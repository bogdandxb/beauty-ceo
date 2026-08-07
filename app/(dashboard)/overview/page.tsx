'use client';

import { useState } from 'react';
import KPICard from '@/components/kpi/KPICard';
import { DollarSign, TrendingUp, Users, Scissors, Clock, Target, BarChart3, CreditCard } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

const PERIODS = ['Lună', 'Trimestru', 'An', 'Ultimele 30 zile'];

const DEMO_DATA = {
  revenue: 98400,
  revenuePrev: 81200,
  cogs: 18500,
  operatingExpenses: 42000,
  grossProfit: 79900,
  operatingProfit: 37900,
  treatments: 312,
  clients: 284,
  newClients: 86,
  returningClients: 198,
  avgTicket: 315,
  revenuePerHour: 287,
  profitPerHour: 133,
  occupancy: 72,
  targetRevenue: 250000,
  monthly: [
    { m: 'Ian', r: 9200, p: 2100 },
    { m: 'Feb', r: 11400, p: 3200 },
    { m: 'Mar', r: 13800, p: 4600 },
    { m: 'Apr', r: 15200, p: 5100 },
    { m: 'Mai', r: 17600, p: 6400 },
    { m: 'Iun', r: 19800, p: 7900 },
    { m: 'Iul', r: 18200, p: 7100 },
    { m: 'Aug', r: 18450, p: 5750 },
  ],
  categories: [
    { name: 'Facial', revenue: 38600, profit: 28400, pct: 39 },
    { name: 'Epilare', revenue: 28800, profit: 23900, pct: 29 },
    { name: 'Corp', revenue: 16200, profit: 11400, pct: 16 },
    { name: 'Analiză', revenue: 8400, profit: 7900, pct: 9 },
    { name: 'Altele', revenue: 6400, profit: 4800, pct: 7 },
  ],
};

function trend(a: number, b: number) {
  return b > 0 ? ((a - b) / b) * 100 : 0;
}

function MiniBarChart() {
  const maxR = Math.max(...DEMO_DATA.monthly.map(m => m.r));
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: '18px 18px 12px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 14 }}>
        Revenue & Profit — 2026
      </p>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 72 }}>
        {DEMO_DATA.monthly.map((m, i) => {
          const rH = (m.r / maxR) * 72;
          const pH = (m.p / maxR) * 72;
          const isLast = i === DEMO_DATA.monthly.length - 1;
          return (
            <div key={m.m} style={{ flex: 1, display: 'flex', gap: 1, alignItems: 'flex-end', height: 72 }}>
              <div style={{ flex: 1, height: rH, background: isLast ? GOLD : 'var(--gold-pale)', borderRadius: '3px 3px 0 0' }} />
              <div style={{ flex: 1, height: pH, background: isLast ? '#4A403A' : '#E8E1D8', borderRadius: '3px 3px 0 0' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        {DEMO_DATA.monthly.map(m => (
          <div key={m.m} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: TAUPE_LIGHT }}>{m.m}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        {[['Revenue', GOLD, 'var(--gold-pale)'], ['Profit', TAUPE, '#E8E1D8']].map(([label, active, inactive]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, background: active, borderRadius: 1 }} />
            <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBreakdown() {
  const maxRev = Math.max(...DEMO_DATA.categories.map(c => c.revenue));
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 18 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>
        Revenue pe Categorii
      </p>
      {DEMO_DATA.categories.map(cat => (
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
  const gpMargin = (DEMO_DATA.grossProfit / DEMO_DATA.revenue) * 100;
  const opMargin = (DEMO_DATA.operatingProfit / DEMO_DATA.revenue) * 100;
  const yearProgress = (DEMO_DATA.revenue / DEMO_DATA.targetRevenue) * 100;
  const retentionRate = (DEMO_DATA.returningClients / DEMO_DATA.clients) * 100;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>CEO Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Executive Overview</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Imagine completă business · 2026</p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${period === p ? GOLD : 'var(--beige)'}`, background: period === p ? 'var(--gold-pale)' : 'white', color: period === p ? TAUPE : TAUPE_LIGHT, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Target anual */}
      <div style={{ background: TAUPE, borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Target Revenue 2026</p>
            <p style={{ fontSize: 28, fontWeight: 300, fontFamily: 'var(--font-cormorant)' }}>
              {DEMO_DATA.revenue.toLocaleString('ro-RO')} <span style={{ fontSize: 14 }}>lei</span>
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>din {DEMO_DATA.targetRevenue.toLocaleString('ro-RO')} lei target</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-cormorant)' }}>{yearProgress.toFixed(0)}%</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>din target anual</p>
          </div>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
          <div style={{ width: `${Math.min(yearProgress, 100)}%`, height: '100%', background: GOLD, borderRadius: 3 }} />
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
        <KPICard label="Revenue Total" value={DEMO_DATA.revenue} isCurrency trend={trend(DEMO_DATA.revenue, DEMO_DATA.revenuePrev)} trendLabel="vs an anterior" icon={DollarSign} />
        <KPICard label="Profit Operațional" value={DEMO_DATA.operatingProfit} isCurrency icon={TrendingUp} sub={`Marjă ${opMargin.toFixed(1)}%`} />
        <KPICard label="Total Clientele" value={DEMO_DATA.clients} icon={Users} sub={`${DEMO_DATA.newClients} noi`} />
        <KPICard label="Tratamente" value={DEMO_DATA.treatments} icon={Scissors} sub={`Ticket mediu ${DEMO_DATA.avgTicket} lei`} />
        <KPICard label="Revenue / Oră" value={DEMO_DATA.revenuePerHour} isCurrency icon={Clock} />
        <KPICard label="Grad Ocupare" value={`${DEMO_DATA.occupancy}%`} icon={BarChart3} />
        <KPICard label="Marjă Brută" value={`${gpMargin.toFixed(1)}%`} icon={Target} sub={`Profit brut ${DEMO_DATA.grossProfit.toLocaleString('ro-RO')} lei`} />
        <KPICard label="Retention Rate" value={`${retentionRate.toFixed(0)}%`} icon={CreditCard} sub={`${DEMO_DATA.returningClients} recurente`} />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MiniBarChart />
        <CategoryBreakdown />
      </div>
    </div>
  );
}
