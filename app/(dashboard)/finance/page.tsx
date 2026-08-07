'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, BarChart3 } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';
import Link from 'next/link';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

// Date demo vizuale (se vor înlocui cu date din Supabase)
const DEMO = {
  revenue: 18450,
  revenuePrev: 15200,
  cogs: 4200,
  expenses: 8500,
  grossProfit: 14250,
  operatingProfit: 5750,
  treatments: 62,
  avgTicket: 297,
  revenuePerHour: 312,
  discountImpact: 820,
  monthly: [
    { month: 'Ian', revenue: 9200, expenses: 6800, profit: 2400 },
    { month: 'Feb', revenue: 11400, expenses: 7100, profit: 4300 },
    { month: 'Mar', revenue: 13800, expenses: 7400, profit: 6400 },
    { month: 'Apr', revenue: 15200, expenses: 7800, profit: 7400 },
    { month: 'Mai', revenue: 17600, expenses: 8200, profit: 9400 },
    { month: 'Iun', revenue: 19800, expenses: 8600, profit: 11200 },
    { month: 'Iul', revenue: 18200, expenses: 8100, profit: 10100 },
    { month: 'Aug', revenue: 18450, expenses: 8500, profit: 9950 },
  ],
};

function pct(a: number, b: number) {
  return b > 0 ? ((a - b) / b) * 100 : 0;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: 4, background: 'var(--beige)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
  );
}

function MiniChart() {
  const maxRev = Math.max(...DEMO.monthly.map(m => m.revenue));
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: '20px 20px 12px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>Revenue vs Cheltuieli — 2026</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {DEMO.monthly.map((m) => {
          const revH = (m.revenue / maxRev) * 80;
          const expH = (m.expenses / maxRev) * 80;
          const isLast = m.month === 'Aug';
          return (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 80 }}>
                <div style={{ flex: 1, height: revH, background: isLast ? GOLD : 'var(--gold-pale)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                <div style={{ flex: 1, height: expH, background: isLast ? 'var(--rose)' : '#F4DDD6', borderRadius: '3px 3px 0 0' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, overflowX: 'auto' }}>
        {DEMO.monthly.map((m) => (
          <div key={m.month} style={{ flex: 1, minWidth: 28, textAlign: 'center', fontSize: 9, color: TAUPE_LIGHT }}>{m.month}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: GOLD, borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>Revenue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: 'var(--rose)', borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>Cheltuieli</span>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const [tab, setTab] = useState<'overview' | 'income' | 'expenses'>('overview');
  const trendRevenue = pct(DEMO.revenue, DEMO.revenuePrev);
  const gpMargin = DEMO.revenue > 0 ? (DEMO.grossProfit / DEMO.revenue) * 100 : 0;
  const opMargin = DEMO.revenue > 0 ? (DEMO.operatingProfit / DEMO.revenue) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Finanțe</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>
            P&amp;L Dashboard
          </h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Luna aceasta · August 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/finance/income" style={{ padding: '8px 14px', border: '1px solid var(--beige)', borderRadius: 10, fontSize: 12, color: TAUPE, textDecoration: 'none', fontWeight: 500 }}>
            + Înregistrare
          </Link>
          <Link href="/finance/expenses" style={{ padding: '8px 14px', border: '1px solid var(--beige)', borderRadius: 10, fontSize: 12, color: TAUPE, textDecoration: 'none', fontWeight: 500 }}>
            + Cheltuială
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--beige)', marginBottom: 24, gap: 0 }}>
        {[['overview', 'Overview'], ['income', 'Venituri'], ['expenses', 'Cheltuieli']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            style={{ padding: '10px 20px', fontSize: 12, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === k ? `2px solid ${GOLD}` : '2px solid transparent', color: tab === k ? TAUPE : TAUPE_LIGHT, transition: 'all 0.15s', marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          {/* P&L Waterfall */}
          <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 20 }}>Profit & Loss — August 2026</p>
            {[
              { label: 'Revenue', value: DEMO.revenue, color: '#22c55e', isTotal: false },
              { label: '— Cost Servicii (COGS)', value: -DEMO.cogs, color: '#f87171', isTotal: false },
              { label: '= Profit Brut', value: DEMO.grossProfit, color: GOLD, isTotal: true },
              { label: '— Cheltuieli Operaționale', value: -DEMO.expenses, color: '#f87171', isTotal: false },
              { label: '= Profit Operațional', value: DEMO.operatingProfit, color: '#3b82f6', isTotal: true },
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

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            <KPICard label="Revenue Total" value={DEMO.revenue} isCurrency trend={trendRevenue} trendLabel="vs luna trecută" icon={DollarSign} />
            <KPICard label="Profit Operațional" value={DEMO.operatingProfit} isCurrency icon={TrendingUp} />
            <KPICard label="Ticket Mediu" value={DEMO.avgTicket} isCurrency icon={CreditCard} />
            <KPICard label="Revenue / Oră" value={DEMO.revenuePerHour} isCurrency icon={BarChart3} />
          </div>

          {/* Discount impact */}
          <div style={{ background: '#FEF9F0', border: '1px solid var(--gold-pale)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Impact Discount-uri</p>
                <p style={{ fontSize: 12, color: TAUPE_LIGHT, marginTop: 2 }}>Revenue potențial pierdut prin reduceri</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#B45309', fontFamily: 'var(--font-cormorant)' }}>
                -{DEMO.discountImpact.toLocaleString('ro-RO')} lei
              </p>
            </div>
          </div>

          {/* Chart */}
          <MiniChart />
        </div>
      )}

      {tab === 'income' && (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 14, color: TAUPE_LIGHT, textAlign: 'center', padding: '40px 0' }}>
            Adaugă primul tratament pentru a vedea venituri.<br />
            <Link href="/" style={{ color: GOLD, fontWeight: 500 }}>→ Adaugă Tratament</Link>
          </p>
        </div>
      )}

      {tab === 'expenses' && (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 14, color: TAUPE_LIGHT, textAlign: 'center', padding: '40px 0' }}>
            Adaugă prima cheltuială pentru a vedea raportul.<br />
            <Link href="/finance/expenses" style={{ color: GOLD, fontWeight: 500 }}>→ Adaugă Cheltuială</Link>
          </p>
        </div>
      )}
    </div>
  );
}
