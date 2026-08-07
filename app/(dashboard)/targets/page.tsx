'use client';

import { useState } from 'react';
import { Target, TrendingUp, Users, Scissors, Clock } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

// Demo: August 2026
const DEMO_MONTH = {
  year: 2026,
  month: 8,
  name: 'August 2026',
  workingDays: 26,
  daysElapsed: 7,
  actual: {
    revenue: 4850,
    profit: 1820,
    clients: 18,
    newClients: 4,
    treatments: 21,
  },
  targets: {
    revenue: 22000,
    profit: 8000,
    clients: 80,
    newClients: 15,
    treatments: 90,
  },
};

const DEMO_WEEK = {
  week: 32,
  year: 2026,
  dates: '4–10 Aug 2026',
  actual: { revenue: 4850, treatments: 21, clients: 18 },
  target: { revenue: 5500, treatments: 22, clients: 20 },
};

const DEMO_YEAR = {
  year: 2026,
  actual: { revenue: 98400, profit: 36200, clients: 420 },
  targets: { revenue: 250000, profit: 90000, clients: 900 },
};

function PacingBar({ label, actual, target, unit = 'lei', icon: Icon }: {
  label: string; actual: number; target: number; unit?: string; icon?: React.ElementType;
}) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  const { daysElapsed, workingDays } = DEMO_MONTH;
  const timeElapsedPct = (daysElapsed / workingDays) * 100;
  const expected = (target / workingDays) * daysElapsed;
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
            <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>
              Target: {target.toLocaleString('ro-RO')} {unit}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>
            {actual.toLocaleString('ro-RO')} <span style={{ fontSize: 11, fontWeight: 400, color: TAUPE_LIGHT }}>{unit}</span>
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{pct.toFixed(1)}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative', height: 8, background: 'var(--beige)', borderRadius: 4, overflow: 'visible', marginBottom: 8 }}>
        {/* Time elapsed indicator */}
        <div style={{ position: 'absolute', left: `${timeElapsedPct}%`, top: -4, width: 2, height: 16, background: TAUPE_LIGHT, borderRadius: 1, zIndex: 2 }} />
        {/* Actual progress */}
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>Start</span>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>│ Azi ({timeElapsedPct.toFixed(0)}% lună)</span>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT }}>Target</span>
      </div>

      {/* Pacing status */}
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

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Obiective</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Targete & Pacing</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Monitorizare în timp real față de obiective</p>
      </div>

      {/* Tab view */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--beige)', marginBottom: 24, gap: 0 }}>
        {[['month', 'Luna aceasta'], ['week', 'Săptămâna aceasta'], ['year', 'Anul acesta']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k as typeof view)}
            style={{ padding: '10px 20px', fontSize: 12, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: view === k ? `2px solid ${GOLD}` : '2px solid transparent', color: view === k ? TAUPE : TAUPE_LIGHT, marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      {view === 'month' && (
        <div>
          <div style={{ background: 'var(--gold-pale)', border: '1px solid var(--gold)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Perioadă</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{DEMO_MONTH.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zile lucrate</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{DEMO_MONTH.daysElapsed} / {DEMO_MONTH.workingDays}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timp scurs</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{((DEMO_MONTH.daysElapsed / DEMO_MONTH.workingDays) * 100).toFixed(0)}%</p>
            </div>
          </div>

          <PacingBar label="Revenue Lunar" actual={DEMO_MONTH.actual.revenue} target={DEMO_MONTH.targets.revenue} unit="lei" icon={TrendingUp} />
          <PacingBar label="Profit Lunar" actual={DEMO_MONTH.actual.profit} target={DEMO_MONTH.targets.profit} unit="lei" icon={Target} />
          <PacingBar label="Clientele Unice" actual={DEMO_MONTH.actual.clients} target={DEMO_MONTH.targets.clients} unit="cliente" icon={Users} />
          <PacingBar label="Clientele Noi" actual={DEMO_MONTH.actual.newClients} target={DEMO_MONTH.targets.newClients} unit="cliente noi" icon={Users} />
          <PacingBar label="Tratamente" actual={DEMO_MONTH.actual.treatments} target={DEMO_MONTH.targets.treatments} unit="tratamente" icon={Scissors} />
        </div>
      )}

      {view === 'week' && (
        <div>
          <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE, marginBottom: 4 }}>Săptămâna #{DEMO_WEEK.week} · {DEMO_WEEK.dates}</p>
            {[
              { label: 'Revenue', actual: DEMO_WEEK.actual.revenue, target: DEMO_WEEK.target.revenue, unit: 'lei' },
              { label: 'Tratamente', actual: DEMO_WEEK.actual.treatments, target: DEMO_WEEK.target.treatments, unit: 'buc' },
              { label: 'Clientele', actual: DEMO_WEEK.actual.clients, target: DEMO_WEEK.target.clients, unit: 'buc' },
            ].map(({ label, actual, target, unit }) => {
              const pct = (actual / target) * 100;
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

      {view === 'year' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Revenue Anual', actual: DEMO_YEAR.actual.revenue, target: DEMO_YEAR.targets.revenue, unit: 'lei', icon: TrendingUp },
              { label: 'Profit Anual', actual: DEMO_YEAR.actual.profit, target: DEMO_YEAR.targets.profit, unit: 'lei', icon: Target },
              { label: 'Clientele', actual: DEMO_YEAR.actual.clients, target: DEMO_YEAR.targets.clients, unit: 'cliente', icon: Users },
            ].map(({ label, actual, target, unit, icon: Icon }) => {
              const pct = (actual / target) * 100;
              const color = pct >= 50 ? GOLD : '#94a3b8';
              return (
                <div key={label} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{label} {DEMO_YEAR.year}</p>
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
        </div>
      )}
    </div>
  );
}
