'use client';

import { useState, useEffect } from 'react';
import KPICard from '@/components/kpi/KPICard';
import { DollarSign, TrendingUp, Users, Scissors, Clock, Target, BarChart3, CreditCard } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';
const PERIODS = ['Lună', 'Trimestru', 'An', 'Ultimele 30 zile'];
const MONTH_NAMES = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface MonthData { m: string; r: number; p: number; }
interface CategoryData { name: string; revenue: number; profit: number; pct: number; }

function MiniBarChart({ monthly }: { monthly: MonthData[] }) {
  const maxR = Math.max(...monthly.map(m => m.r), 1);
  const lastMonth = monthly[monthly.length - 1]?.m;
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: '18px 18px 12px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 14 }}>
        Revenue & Profit — {new Date().getFullYear()}
      </p>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 72 }}>
        {monthly.map((m) => {
          const rH = (m.r / maxR) * 72;
          const pH = (m.p / maxR) * 72;
          const isLast = m.m === lastMonth;
          return (
            <div key={m.m} style={{ flex: 1, display: 'flex', gap: 1, alignItems: 'flex-end', height: 72 }}>
              <div style={{ flex: 1, height: rH, background: isLast ? GOLD : 'var(--gold-pale)', borderRadius: '3px 3px 0 0' }} />
              <div style={{ flex: 1, height: pH, background: isLast ? '#4A403A' : '#E8E1D8', borderRadius: '3px 3px 0 0' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        {monthly.map(m => (
          <div key={m.m} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: TAUPE_LIGHT }}>{m.m}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        {([['Revenue', GOLD], ['Profit', TAUPE]] as [string, string][]).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories }: { categories: CategoryData[] }) {
  const maxRev = Math.max(...categories.map(c => c.revenue), 1);
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 18 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>
        Revenue pe Categorii
      </p>
      {categories.map(cat => (
        <div key={cat.name} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: TAUPE }}>{cat.name}</span>
            <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{cat.revenue.toLocaleString('ro-RO')} lei · {cat.pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--beige)', borderRadius: 3 }}>
            <div style={{ width: `${(cat.revenue / maxRev) * 100}%`, height: '100%', background: GOLD, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const [period, setPeriod] = useState('An');
  const [loading, setLoading] = useState(true);

  const [revenue, setRevenue] = useState(0);
  const [revenuePrev, setRevenuePrev] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [operatingProfit, setOperatingProfit] = useState(0);
  const [treatments, setTreatments] = useState(0);
  const [clients, setClients] = useState(0);
  const [newClients, setNewClients] = useState(0);
  const [returningClients, setReturningClients] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [revenuePerHour, setRevenuePerHour] = useState(0);
  const [targetRevenue, setTargetRevenue] = useState(250000);
  const [monthly, setMonthly] = useState<MonthData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    setLoading(true);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let startDate: string, endDate: string, startPrev: string, endPrev: string;

    if (period === 'Lună') {
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      startPrev = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      endPrev = `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`;
    } else if (period === 'Ultimele 30 zile') {
      const d = new Date(); d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
      endDate = now.toISOString().slice(0, 10);
      const d2 = new Date(); d2.setDate(d2.getDate() - 60);
      startPrev = d2.toISOString().slice(0, 10);
      endPrev = d.toISOString().slice(0, 10);
    } else if (period === 'Trimestru') {
      const q = Math.floor((month - 1) / 3);
      startDate = `${year}-${String(q * 3 + 1).padStart(2, '0')}-01`;
      endDate = `${year}-${String(Math.min(q * 3 + 3, 12)).padStart(2, '0')}-31`;
      const pq = q === 0 ? 3 : q - 1;
      const pqYear = q === 0 ? year - 1 : year;
      startPrev = `${pqYear}-${String(pq * 3 + 1).padStart(2, '0')}-01`;
      endPrev = `${pqYear}-${String(Math.min(pq * 3 + 3, 12)).padStart(2, '0')}-31`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
      startPrev = `${year - 1}-01-01`;
      endPrev = `${year - 1}-12-31`;
    }

    const [
      { data: tCurr },
      { data: tPrev },
      { data: eCurr },
      { data: tYear },
      { data: eYear },
      { data: targetData },
      { data: clientsData },
    ] = await Promise.all([
      supabase().from('treatments').select('final_price, cost_snapshot, duration_snapshot, client_id, services(service_categories(name))').eq('status', 'completed').gte('treatment_date', startDate).lte('treatment_date', endDate),
      supabase().from('treatments').select('final_price').eq('status', 'completed').gte('treatment_date', startPrev).lte('treatment_date', endPrev),
      supabase().from('expenses').select('amount').gte('expense_date', startDate).lte('expense_date', endDate),
      supabase().from('treatments').select('final_price, cost_snapshot, treatment_date').eq('status', 'completed').gte('treatment_date', `${year}-01-01`).order('treatment_date'),
      supabase().from('expenses').select('amount, expense_date').gte('expense_date', `${year}-01-01`).order('expense_date'),
      supabase().from('targets').select('target_revenue').eq('period_type', 'year').eq('period_year', year).eq('period_number', year).single(),
      supabase().from('clients').select('id, segment, acquisition_date').eq('is_active', true),
    ]);

    const tcList = ((tCurr as unknown) as { final_price: number; cost_snapshot: number; duration_snapshot: number; client_id: string; services: { service_categories: { name: string } | null } | null }[]) || [];
    const tpList = (tPrev as { final_price: number }[]) || [];
    const ecList = (eCurr as { amount: number }[]) || [];

    const rev = tcList.reduce((s, t) => s + t.final_price, 0);
    const cogsVal = tcList.reduce((s, t) => s + t.cost_snapshot, 0);
    const expVal = ecList.reduce((s, e) => s + e.amount, 0);
    const totalHours = tcList.reduce((s, t) => s + t.duration_snapshot / 60, 0);
    const prevRev = tpList.reduce((s, t) => s + t.final_price, 0);
    const uniqueClients = new Set(tcList.map(t => t.client_id)).size;

    setRevenue(rev);
    setRevenuePrev(prevRev);
    setGrossProfit(rev - cogsVal);
    setOperatingProfit(rev - cogsVal - expVal);
    setTreatments(tcList.length);
    setClients(uniqueClients);
    setAvgTicket(tcList.length > 0 ? Math.round(rev / tcList.length) : 0);
    setRevenuePerHour(totalHours > 0 ? Math.round(rev / totalHours) : 0);

    const cList = (clientsData as { id: string; segment: string; acquisition_date: string }[]) || [];
    setNewClients(cList.filter(c => c.segment === 'new').length);
    setReturningClients(cList.filter(c => c.segment !== 'new' && c.segment !== 'lapsed').length);

    setTargetRevenue((targetData as { target_revenue?: number } | null)?.target_revenue || 250000);

    // Monthly aggregation
    const monthMap: Record<number, { r: number; exp: number }> = {};
    for (let m = 1; m <= (new Date().getMonth() + 1); m++) monthMap[m] = { r: 0, exp: 0 };
    ((tYear as { final_price: number; cost_snapshot: number; treatment_date: string }[]) || []).forEach(t => {
      const m = new Date(t.treatment_date).getMonth() + 1;
      if (monthMap[m]) monthMap[m].r += t.final_price;
    });
    const eYearList = (eYear as { amount: number; expense_date: string }[]) || [];
    eYearList.forEach(e => {
      const m = new Date(e.expense_date).getMonth() + 1;
      if (monthMap[m]) monthMap[m].exp += e.amount;
    });
    setMonthly(Object.entries(monthMap).map(([m, v]) => ({
      m: MONTH_NAMES[Number(m) - 1],
      r: Math.round(v.r),
      p: Math.round(v.r - v.exp),
    })));

    // Category breakdown
    const catMap: Record<string, number> = {};
    tcList.forEach(t => {
      const cat = t.services?.service_categories?.name || 'Altele';
      catMap[cat] = (catMap[cat] || 0) + t.final_price;
    });
    const totalRev = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    setCategories(
      Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, revenue]) => ({ name, revenue, profit: Math.round(revenue * 0.7), pct: Math.round((revenue / totalRev) * 100) }))
    );

    setLoading(false);
  }

  const gpMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const opMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;
  const yearProgress = targetRevenue > 0 ? (revenue / targetRevenue) * 100 : 0;
  const retentionRate = clients > 0 ? (returningClients / (newClients + returningClients)) * 100 : 0;
  const trendRevenue = revenuePrev > 0 ? ((revenue - revenuePrev) / revenuePrev) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>CEO Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Executive Overview</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Imagine completă business · {new Date().getFullYear()}</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${period === p ? GOLD : 'var(--beige)'}`, background: period === p ? 'var(--gold-pale)' : 'white', color: period === p ? TAUPE : TAUPE_LIGHT, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ background: TAUPE, borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Target Revenue {new Date().getFullYear()}</p>
            <p style={{ fontSize: 28, fontWeight: 300, fontFamily: 'var(--font-cormorant)' }}>
              {loading ? '...' : revenue.toLocaleString('ro-RO')} <span style={{ fontSize: 14 }}>lei</span>
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>din {targetRevenue.toLocaleString('ro-RO')} lei target</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-cormorant)' }}>{yearProgress.toFixed(0)}%</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>din target {period.toLowerCase()}</p>
          </div>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
          <div style={{ width: `${Math.min(yearProgress, 100)}%`, height: '100%', background: GOLD, borderRadius: 3 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: TAUPE_LIGHT, fontSize: 14 }}>Se încarcă datele...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
            <KPICard label="Revenue Total" value={revenue} isCurrency trend={trendRevenue} trendLabel="vs perioadă anterioară" icon={DollarSign} />
            <KPICard label="Profit Operațional" value={operatingProfit} isCurrency icon={TrendingUp} sub={`Marjă ${opMargin.toFixed(1)}%`} />
            <KPICard label="Clientele Unice" value={clients} icon={Users} sub={`${newClients} noi`} />
            <KPICard label="Tratamente" value={treatments} icon={Scissors} sub={`Ticket mediu ${avgTicket} lei`} />
            <KPICard label="Revenue / Oră" value={revenuePerHour} isCurrency icon={Clock} />
            <KPICard label="Marjă Brută" value={`${gpMargin.toFixed(1)}%`} icon={Target} sub={`Profit brut ${grossProfit.toLocaleString('ro-RO')} lei`} />
            <KPICard label="Marjă Operațională" value={`${opMargin.toFixed(1)}%`} icon={BarChart3} />
            <KPICard label="Retention Rate" value={`${retentionRate.toFixed(0)}%`} icon={CreditCard} sub={`${returningClients} recurente`} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monthly.length > 0 && <MiniBarChart monthly={monthly} />}
            {categories.length > 0 && <CategoryBreakdown categories={categories} />}
          </div>
        </>
      )}
    </div>
  );
}
