'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, CreditCard, BarChart3 } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';
import { createBrowserClient } from '@supabase/ssr';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const MONTH_NAMES = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthData { month: string; revenue: number; expenses: number; profit: number; }
interface Treatment { final_price: number; cost_snapshot: number; duration_snapshot: number; }
interface Expense { amount: number; }

export default function FinancePage() {
  const [tab, setTab] = useState<'overview' | 'income' | 'expenses'>('overview');
  const [loading, setLoading] = useState(true);

  const [revenue, setRevenue] = useState(0);
  const [cogs, setCogs] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [treatments, setTreatments] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [revenuePerHour, setRevenuePerHour] = useState(0);
  const [monthly, setMonthly] = useState<MonthData[]>([]);
  const [expensesList, setExpensesList] = useState<{ name: string; category: string; amount: number; expense_date: string; payment_method: string | null }[]>([]);
  const [treatmentsList, setTreatmentsList] = useState<{ service_name_snapshot: string; final_price: number; treatment_date: string; payment_method: string | null; client: { first_name: string; last_name: string } | null }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const endOfMonth = `${year}-${String(month).padStart(2, '0')}-31`;
    const startOfYear = `${year}-01-01`;

    const [{ data: tData }, { data: eData }, { data: tYear }, { data: eYear }] = await Promise.all([
      supabase().from('treatments').select('final_price, cost_snapshot, duration_snapshot').eq('status', 'completed').gte('treatment_date', startOfMonth).lte('treatment_date', endOfMonth),
      supabase().from('expenses').select('amount').gte('expense_date', startOfMonth).lte('expense_date', endOfMonth),
      supabase().from('treatments').select('final_price, cost_snapshot, treatment_date').eq('status', 'completed').gte('treatment_date', startOfYear).order('treatment_date'),
      supabase().from('expenses').select('amount, expense_date').gte('expense_date', startOfYear).order('expense_date'),
    ]);

    const tList = (tData as Treatment[]) || [];
    const eList = (eData as Expense[]) || [];
    const rev = tList.reduce((s, t) => s + t.final_price, 0);
    const cogsVal = tList.reduce((s, t) => s + t.cost_snapshot, 0);
    const expVal = eList.reduce((s, e) => s + e.amount, 0);
    const totalHours = tList.reduce((s, t) => s + t.duration_snapshot / 60, 0);

    setRevenue(rev);
    setCogs(cogsVal);
    setTotalExpenses(expVal);
    setTreatments(tList.length);
    setAvgTicket(tList.length > 0 ? Math.round(rev / tList.length) : 0);
    setRevenuePerHour(totalHours > 0 ? Math.round(rev / totalHours) : 0);

    // Monthly aggregation for chart
    const monthMap: Record<number, { revenue: number; expenses: number }> = {};
    for (let m = 1; m <= month; m++) monthMap[m] = { revenue: 0, expenses: 0 };
    ((tYear as { final_price: number; treatment_date: string }[]) || []).forEach(t => {
      const m = new Date(t.treatment_date).getMonth() + 1;
      if (monthMap[m]) monthMap[m].revenue += t.final_price;
    });
    ((eYear as { amount: number; expense_date: string }[]) || []).forEach(e => {
      const m = new Date(e.expense_date).getMonth() + 1;
      if (monthMap[m]) monthMap[m].expenses += e.amount;
    });
    setMonthly(Object.entries(monthMap).map(([m, v]) => ({
      month: MONTH_NAMES[Number(m) - 1],
      revenue: Math.round(v.revenue),
      expenses: Math.round(v.expenses),
      profit: Math.round(v.revenue - v.expenses),
    })));

    // For tabs
    const [{ data: expFull }, { data: trFull }] = await Promise.all([
      supabase().from('expenses').select('name, category, amount, expense_date, payment_method').gte('expense_date', startOfMonth).order('expense_date', { ascending: false }),
      supabase().from('treatments').select('service_name_snapshot, final_price, treatment_date, payment_method, clients(first_name, last_name)').eq('status', 'completed').gte('treatment_date', startOfMonth).order('treatment_date', { ascending: false }),
    ]);
    setExpensesList((expFull as typeof expensesList) || []);
    setTreatmentsList(((trFull as unknown) as typeof treatmentsList) || []);
    setLoading(false);
  }

  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - totalExpenses;
  const gpMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const opMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;
  const maxRev = monthly.length > 0 ? Math.max(...monthly.map(m => m.revenue), 1) : 1;
  const currentMonthName = MONTH_NAMES[new Date().getMonth()];

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Finanțe</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>P&amp;L Dashboard</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Luna aceasta · {currentMonthName} {new Date().getFullYear()}</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--beige)', marginBottom: 24, gap: 0 }}>
        {[['overview', 'Overview'], ['income', 'Venituri'], ['expenses', 'Cheltuieli']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            style={{ padding: '10px 20px', fontSize: 12, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === k ? `2px solid ${GOLD}` : '2px solid transparent', color: tab === k ? TAUPE : TAUPE_LIGHT, marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT, fontSize: 14 }}>Se încarcă datele...</div>}

      {!loading && tab === 'overview' && (
        <div>
          <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 20 }}>
              Profit &amp; Loss — {currentMonthName} {new Date().getFullYear()}
            </p>
            {[
              { label: 'Revenue', value: revenue, color: '#22c55e', isTotal: false },
              { label: '— Cost Servicii (COGS)', value: -cogs, color: '#f87171', isTotal: false },
              { label: '= Profit Brut', value: grossProfit, color: GOLD, isTotal: true },
              { label: '— Cheltuieli Operaționale', value: -totalExpenses, color: '#f87171', isTotal: false },
              { label: '= Profit Operațional', value: operatingProfit, color: '#3b82f6', isTotal: true },
            ].map(({ label, value, color, isTotal }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isTotal ? '10px 12px' : '7px 12px', background: isTotal ? 'var(--gold-pale)' : 'transparent', borderRadius: 8, marginBottom: 4 }}>
                <span style={{ fontSize: isTotal ? 13 : 12, fontWeight: isTotal ? 600 : 400, color: TAUPE }}>{label}</span>
                <span style={{ fontSize: isTotal ? 15 : 13, fontWeight: isTotal ? 700 : 500, color, fontFamily: 'var(--font-cormorant)' }}>
                  {value >= 0 ? '+' : ''}{value.toLocaleString('ro-RO')} lei
                </span>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'var(--beige-light)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: TAUPE_LIGHT, marginBottom: 4 }}>MARJĂ BRUTĂ</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-cormorant)' }}>{gpMargin.toFixed(1)}%</p>
              </div>
              <div style={{ background: 'var(--beige-light)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: TAUPE_LIGHT, marginBottom: 4 }}>MARJĂ OPERAȚIONALĂ</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-cormorant)' }}>{opMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            <KPICard label="Revenue Total" value={revenue} isCurrency icon={DollarSign} />
            <KPICard label="Profit Operațional" value={operatingProfit} isCurrency icon={TrendingUp} />
            <KPICard label="Ticket Mediu" value={avgTicket} isCurrency icon={CreditCard} sub={`${treatments} tratamente`} />
            <KPICard label="Revenue / Oră" value={revenuePerHour} isCurrency icon={BarChart3} />
          </div>

          {/* Chart Revenue vs Cheltuieli */}
          <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: '20px 20px 12px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>Revenue vs Cheltuieli — {new Date().getFullYear()}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, overflow: 'hidden' }}>
              {monthly.map((m) => {
                const revH = Math.max(0, (m.revenue / maxRev) * 76);
                const expH = Math.max(0, (m.expenses / maxRev) * 76);
                const isLast = m.month === currentMonthName;
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end', height: 80, minWidth: 0 }}>
                    {revH > 0 && <div style={{ flex: 1, height: revH, background: isLast ? GOLD : 'var(--gold-pale)', borderRadius: '3px 3px 0 0' }} />}
                    {expH > 0 && <div style={{ flex: 1, height: expH, background: isLast ? 'var(--rose)' : '#F4DDD6', borderRadius: '3px 3px 0 0' }} />}
                    {revH === 0 && expH === 0 && <div style={{ flex: 1 }} />}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {monthly.map(m => <div key={m.month} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: TAUPE_LIGHT }}>{m.month}</div>)}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {[['Revenue', GOLD], ['Cheltuieli', 'var(--rose)']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'income' && (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
          {treatmentsList.length === 0 ? (
            <p style={{ fontSize: 14, color: TAUPE_LIGHT, textAlign: 'center', padding: '40px 0' }}>Nicio înregistrare luna aceasta.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 80px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
                {['Serviciu / Clientă', 'Data', 'Plată', 'Sumă'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
                ))}
              </div>
              {treatmentsList.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 80px', gap: 8, padding: '12px 20px', borderBottom: i < treatmentsList.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{t.service_name_snapshot}</p>
                    {t.client && <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{t.client.first_name} {t.client.last_name}</p>}
                  </div>
                  <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{new Date(t.treatment_date).toLocaleDateString('ro-RO')}</span>
                  <span style={{ fontSize: 11, color: TAUPE_LIGHT, textTransform: 'capitalize' }}>{t.payment_method || '—'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TAUPE }}>{t.final_price.toLocaleString('ro-RO')} lei</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {!loading && tab === 'expenses' && (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
          {expensesList.length === 0 ? (
            <p style={{ fontSize: 14, color: TAUPE_LIGHT, textAlign: 'center', padding: '40px 0' }}>Nicio cheltuială luna aceasta.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
                {['Cheltuială', 'Categorie', 'Data', 'Sumă'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
                ))}
              </div>
              {expensesList.map((e, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px', gap: 8, padding: '12px 20px', borderBottom: i < expensesList.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{e.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--gold-pale)', borderRadius: 20, color: TAUPE, whiteSpace: 'nowrap' }}>{e.category}</span>
                  <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{new Date(e.expense_date).toLocaleDateString('ro-RO')}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>-{e.amount.toLocaleString('ro-RO')} lei</span>
                </div>
              ))}
              <div style={{ padding: '14px 20px', borderTop: '2px solid var(--beige)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>Total cheltuieli luna aceasta</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-cormorant)' }}>-{totalExpenses.toLocaleString('ro-RO')} lei</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
