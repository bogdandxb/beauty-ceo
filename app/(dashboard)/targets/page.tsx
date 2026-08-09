'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Users, Scissors } from 'lucide-react';
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

interface PacingBarProps {
  label: string;
  actual: number;
  target: number;
  unit?: string;
  icon?: React.ElementType;
  daysElapsed: number;
  workingDays: number;
}

function PacingBar({ label, actual, target, unit = 'lei', icon: Icon, daysElapsed, workingDays }: PacingBarProps) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  const timeElapsedPct = workingDays > 0 ? (daysElapsed / workingDays) * 100 : 0;
  const expected = workingDays > 0 ? (target / workingDays) * daysElapsed : 0;
  const isAhead = actual >= expected;
  const diff = actual - expected;
  const dailyRate = daysElapsed > 0 ? actual / daysElapsed : 0;
  const remaining = target - actual;
  const daysLeft = workingDays - daysElapsed;
  const requiredDaily = daysLeft > 0 ? remaining / daysLeft : 0;
  const barColor = pct >= timeElapsedPct ? '#22c55e' : pct >= timeElapsedPct * 0.85 ? GOLD : '#f87171';

  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 18, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} style={{ color: GOLD }} />
          </div>}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{label}</p>
            <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>Target: {target.toLocaleString('ro-RO')} {unit}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>
            {actual.toLocaleString('ro-RO')} <span style={{ fontSize: 11, fontWeight: 400, color: TAUPE_LIGHT }}>{unit}</span>
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{pct.toFixed(1)}%</p>
        </div>
      </div>
      <div style={{ position: 'relative', height: 8, background: 'var(--beige)', borderRadius: 4, overflow: 'visible', marginBottom: 8 }}>
        <div style={{ position: 'absolute', left: `${timeElapsedPct}%`, top: -4, width: 2, height: 16, background: TAUPE_LIGHT, borderRadius: 1, zIndex: 2 }} />
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>Start</span>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>│ Azi ({timeElapsedPct.toFixed(0)}% lună)</span>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>Target</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ background: isAhead ? '#F0FDF4' : '#FEF2F2', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
          <p style={{ fontSize: 9, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Față de așteptări</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: isAhead ? '#16a34a' : '#dc2626' }}>
            {isAhead ? '+' : ''}{Math.round(diff).toLocaleString('ro-RO')} {unit}
          </p>
        </div>
        <div style={{ background: 'var(--ivory)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
          <p style={{ fontSize: 9, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Ritm zilnic actual</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: TAUPE }}>{Math.round(dailyRate).toLocaleString('ro-RO')} {unit}</p>
        </div>
        <div style={{ background: 'var(--ivory)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
          <p style={{ fontSize: 9, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Necesar/zi rămas</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: requiredDaily > dailyRate ? '#f59e0b' : '#16a34a' }}>
            {Math.round(requiredDaily).toLocaleString('ro-RO')} {unit}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TargetsPage() {
  const [view, setView] = useState<'month' | 'week' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const dayOfMonth = now.getDate();

  // Zile lucratoare estimate (exclud duminica)
  const daysInMonth = new Date(year, month, 0).getDate();
  const workingDays = Math.round(daysInMonth * 6 / 7);
  const daysElapsed = Math.round(dayOfMonth * 6 / 7);

  const [monthActual, setMonthActual] = useState({ revenue: 0, profit: 0, clients: 0, newClients: 0, treatments: 0 });
  const [monthTarget, setMonthTarget] = useState({ revenue: 0, profit: 0, clients: 0, newClients: 0, treatments: 0 });
  const [yearActual, setYearActual] = useState({ revenue: 0, profit: 0, clients: 0 });
  const [yearTarget, setYearTarget] = useState({ revenue: 0, profit: 0, clients: 0 });
  const [weekActual, setWeekActual] = useState({ revenue: 0, treatments: 0, clients: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const startMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = `${year}-${String(month).padStart(2, '0')}-31`;
    const startYear = `${year}-01-01`;

    // ISO week Monday
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startWeek = monday.toISOString().slice(0, 10);
    const endWeek = sunday.toISOString().slice(0, 10);

    const [
      { data: tMonth },
      { data: tYear },
      { data: tWeek },
      { data: eMonth },
      { data: eYear },
      { data: targetMonth },
      { data: targetYear },
      { data: cMonth },
      { data: cYear },
    ] = await Promise.all([
      supabase().from('treatments').select('final_price, cost_snapshot, client_id').eq('status', 'completed').gte('treatment_date', startMonth).lte('treatment_date', endMonth),
      supabase().from('treatments').select('final_price, cost_snapshot').eq('status', 'completed').gte('treatment_date', startYear),
      supabase().from('treatments').select('final_price, client_id').eq('status', 'completed').gte('treatment_date', startWeek).lte('treatment_date', endWeek),
      supabase().from('expenses').select('amount').gte('expense_date', startMonth).lte('expense_date', endMonth),
      supabase().from('expenses').select('amount').gte('expense_date', startYear),
      supabase().from('targets').select('*').eq('period_type', 'month').eq('period_year', year).eq('period_number', month).single(),
      supabase().from('targets').select('*').eq('period_type', 'year').eq('period_year', year).eq('period_number', year).single(),
      supabase().from('clients').select('id, acquisition_date').gte('acquisition_date', startMonth).lte('acquisition_date', endMonth),
      supabase().from('clients').select('id').gte('acquisition_date', startYear),
    ]);

    const tmList = (tMonth as { final_price: number; cost_snapshot: number; client_id: string }[]) || [];
    const eMonthList = (eMonth as { amount: number }[]) || [];
    const eYearList = (eYear as { amount: number }[]) || [];
    const tyList = (tYear as { final_price: number; cost_snapshot: number }[]) || [];
    const twList = (tWeek as { final_price: number; client_id: string }[]) || [];

    const mRevenue = tmList.reduce((s, t) => s + t.final_price, 0);
    const mCogs = tmList.reduce((s, t) => s + t.cost_snapshot, 0);
    const mExpenses = eMonthList.reduce((s, e) => s + e.amount, 0);
    const mProfit = mRevenue - mCogs - mExpenses;
    const mClients = new Set(tmList.map(t => t.client_id)).size;
    const newClientsCount = (cMonth as { id: string; acquisition_date: string }[] || []).length;

    const yRevenue = tyList.reduce((s, t) => s + t.final_price, 0);
    const yCogs = tyList.reduce((s, t) => s + t.cost_snapshot, 0);
    const yExpenses = eYearList.reduce((s, e) => s + e.amount, 0);
    const yProfit = yRevenue - yCogs - yExpenses;
    const yClients = (cYear as { id: string }[] || []).length;

    const wRevenue = twList.reduce((s, t) => s + t.final_price, 0);
    const wClients = new Set(twList.map(t => t.client_id)).size;

    setMonthActual({ revenue: mRevenue, profit: mProfit, clients: mClients, newClients: newClientsCount, treatments: tmList.length });
    setYearActual({ revenue: yRevenue, profit: yProfit, clients: yClients });
    setWeekActual({ revenue: wRevenue, treatments: twList.length, clients: wClients });

    const mt = (targetMonth as { target_revenue?: number; target_profit?: number; target_clients?: number; target_new_clients?: number; target_treatments?: number } | null);
    const yt = (targetYear as { target_revenue?: number; target_profit?: number; target_clients?: number } | null);

    setMonthTarget({
      revenue: mt?.target_revenue || 0,
      profit: mt?.target_profit || 0,
      clients: mt?.target_clients || 0,
      newClients: mt?.target_new_clients || 0,
      treatments: mt?.target_treatments || 0,
    });
    setYearTarget({
      revenue: yt?.target_revenue || 0,
      profit: yt?.target_profit || 0,
      clients: yt?.target_clients || 0,
    });

    setLoading(false);
  }

  const MONTH_NAMES = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Obiective</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Targete & Pacing</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Monitorizare în timp real față de obiective</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--beige)', marginBottom: 24 }}>
        {[['month', 'Luna aceasta'], ['week', 'Săptămâna aceasta'], ['year', 'Anul acesta']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k as typeof view)}
            style={{ padding: '10px 20px', fontSize: 12, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: view === k ? `2px solid ${GOLD}` : '2px solid transparent', color: view === k ? TAUPE : TAUPE_LIGHT, marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT, fontSize: 14 }}>Se încarcă...</div>}

      {!loading && view === 'month' && (
        <div>
          <div style={{ background: 'var(--gold-pale)', border: '1px solid var(--gold)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Perioadă</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{MONTH_NAMES[month - 1]} {year}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zile lucrate</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{daysElapsed} / {workingDays}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timp scurs</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{((daysElapsed / workingDays) * 100).toFixed(0)}%</p>
            </div>
          </div>

          {monthTarget.revenue === 0 && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#92400E' }}>⚠ Nu există target setat pentru această lună. Adaugă targete în Supabase → tabel <strong>targets</strong>.</p>
            </div>
          )}

          <PacingBar label="Revenue Lunar" actual={monthActual.revenue} target={monthTarget.revenue} unit="lei" icon={TrendingUp} daysElapsed={daysElapsed} workingDays={workingDays} />
          <PacingBar label="Profit Lunar" actual={monthActual.profit} target={monthTarget.profit} unit="lei" icon={Target} daysElapsed={daysElapsed} workingDays={workingDays} />
          <PacingBar label="Clientele Unice" actual={monthActual.clients} target={monthTarget.clients} unit="cliente" icon={Users} daysElapsed={daysElapsed} workingDays={workingDays} />
          <PacingBar label="Clientele Noi" actual={monthActual.newClients} target={monthTarget.newClients} unit="cliente noi" icon={Users} daysElapsed={daysElapsed} workingDays={workingDays} />
          <PacingBar label="Tratamente" actual={monthActual.treatments} target={monthTarget.treatments} unit="tratamente" icon={Scissors} daysElapsed={daysElapsed} workingDays={workingDays} />
        </div>
      )}

      {!loading && view === 'week' && (
        <div>
          <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE, marginBottom: 16 }}>Săptămâna curentă</p>
            {[
              { label: 'Revenue', actual: weekActual.revenue, target: monthTarget.revenue / 4, unit: 'lei' },
              { label: 'Tratamente', actual: weekActual.treatments, target: Math.round(monthTarget.treatments / 4), unit: 'buc' },
              { label: 'Clientele', actual: weekActual.clients, target: Math.round(monthTarget.clients / 4), unit: 'buc' },
            ].map(({ label, actual, target, unit }) => {
              const pct = target > 0 ? (actual / target) * 100 : 0;
              const color = pct >= 100 ? '#22c55e' : pct >= 80 ? GOLD : '#f87171';
              return (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TAUPE }}>{label}</span>
                    <span style={{ fontSize: 12, color }}>
                      {actual.toLocaleString('ro-RO')} / {target.toLocaleString('ro-RO')} {unit} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--beige)', borderRadius: 3 }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && view === 'year' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Revenue Anual', actual: yearActual.revenue, target: yearTarget.revenue, unit: 'lei', icon: TrendingUp },
            { label: 'Profit Anual', actual: yearActual.profit, target: yearTarget.profit, unit: 'lei', icon: Target },
            { label: 'Clientele Noi', actual: yearActual.clients, target: yearTarget.clients, unit: 'cliente', icon: Users },
          ].map(({ label, actual, target, unit }) => {
            const pct = target > 0 ? (actual / target) * 100 : 0;
            const color = pct >= 50 ? GOLD : '#94a3b8';
            return (
              <div key={label} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{label} {year}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color }}>{pct.toFixed(1)}%</p>
                </div>
                <div style={{ height: 8, background: 'var(--beige)', borderRadius: 4, marginBottom: 8 }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: TAUPE_LIGHT }}>
                  <span>Realizat: {actual.toLocaleString('ro-RO')} {unit}</span>
                  <span>Target: {target.toLocaleString('ro-RO')} {unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
