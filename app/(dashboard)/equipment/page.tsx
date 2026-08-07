'use client';

import { Wrench, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

const DEMO_EQUIPMENT = [
  { id: '1', name: 'Laser Diodă 4λ', purchase_date: '2023-03-15', purchase_price: 28000, maintenance_cost_yearly: 1500, revenue_generated: 32400, treatments: 96, expected_lifespan_years: 8 },
  { id: '2', name: 'HydraFacial', purchase_date: '2024-01-10', purchase_price: 12000, maintenance_cost_yearly: 800, revenue_generated: 18600, treatments: 62, expected_lifespan_years: 7 },
  { id: '3', name: 'Dermapen / Microneedling', purchase_date: '2024-06-20', purchase_price: 5500, maintenance_cost_yearly: 400, revenue_generated: 9000, treatments: 18, expected_lifespan_years: 5 },
  { id: '4', name: 'LipoShape Pro', purchase_date: '2023-08-01', purchase_price: 18000, maintenance_cost_yearly: 1200, revenue_generated: 12600, treatments: 36, expected_lifespan_years: 8 },
  { id: '5', name: 'Skin Analyzer', purchase_date: '2026-04-01', purchase_price: 8000, maintenance_cost_yearly: 500, revenue_generated: 1600, treatments: 8, expected_lifespan_years: 6 },
];

function calculateROI(eq: typeof DEMO_EQUIPMENT[0]) {
  const purchaseDate = new Date(eq.purchase_date);
  const now = new Date();
  const monthsInUse = Math.max(
    (now.getFullYear() - purchaseDate.getFullYear()) * 12 + now.getMonth() - purchaseDate.getMonth(), 1
  );
  const maintenanceCostToDate = (eq.maintenance_cost_yearly / 12) * monthsInUse;
  const totalInvestment = eq.purchase_price + maintenanceCostToDate;
  const netReturn = eq.revenue_generated - totalInvestment;
  const roiPercent = (netReturn / totalInvestment) * 100;
  const avgMonthlyRevenue = eq.revenue_generated / monthsInUse;
  const monthlyMaintenance = eq.maintenance_cost_yearly / 12;
  const monthlyNet = avgMonthlyRevenue - monthlyMaintenance;
  const paybackMonths = monthlyNet > 0 ? eq.purchase_price / monthlyNet : null;
  const recoveredPercent = Math.min((eq.revenue_generated / eq.purchase_price) * 100, 100);
  const isRecouped = eq.revenue_generated >= eq.purchase_price;
  return { totalInvestment, netReturn, roiPercent, paybackMonths, recoveredPercent, isRecouped, monthsInUse };
}

function ROIProgressBar({ percent, isRecouped }: { percent: number; isRecouped: boolean }) {
  const color = isRecouped ? '#22c55e' : percent >= 70 ? GOLD : percent >= 40 ? '#f59e0b' : '#94a3b8';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: TAUPE_LIGHT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {isRecouped ? '✓ Investiție recuperată' : `Recuperat ${percent.toFixed(0)}%`}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{percent.toFixed(0)}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--beige)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const allROI = DEMO_EQUIPMENT.map(eq => ({ ...eq, ...calculateROI(eq) }));
  const totalInvested = DEMO_EQUIPMENT.reduce((s, e) => s + e.purchase_price, 0);
  const totalRevenue = DEMO_EQUIPMENT.reduce((s, e) => s + e.revenue_generated, 0);
  const recouped = allROI.filter(e => e.isRecouped).length;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>ROI Aparatură</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Aparatură</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Analiza recuperării investițiilor</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        <KPICard label="Total Investit" value={totalInvested} isCurrency icon={Wrench} />
        <KPICard label="Revenue Generat" value={totalRevenue} isCurrency icon={TrendingUp} />
        <KPICard label="Aparate Recuperate" value={`${recouped}/${DEMO_EQUIPMENT.length}`} icon={CheckCircle} sub="investiție acoperită" />
        <KPICard label="Net Return" value={totalRevenue - totalInvested} isCurrency icon={TrendingUp} trend={((totalRevenue - totalInvested) / totalInvested) * 100} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {allROI.map(eq => (
          <div key={eq.id}
            style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: TAUPE }}>{eq.name}</p>
                <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 2 }}>
                  Cumpărat {new Date(eq.purchase_date).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })} · {eq.purchase_price.toLocaleString('ro-RO')} lei investiți
                </p>
              </div>
              {eq.isRecouped ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', color: '#16a34a', fontSize: 11, fontWeight: 700 }}>
                  <CheckCircle size={12} /> Recuperat
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: 'var(--gold-pale)', color: TAUPE, fontSize: 11, fontWeight: 700 }}>
                  <Clock size={12} /> În recuperare
                </span>
              )}
            </div>

            <ROIProgressBar percent={eq.recoveredPercent} isRecouped={eq.isRecouped} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
              {[
                ['Revenue Generat', `${eq.revenue_generated.toLocaleString('ro-RO')} lei`],
                ['Tratamente', `${eq.treatments}`],
                ['Revenue/Tratament', `${Math.round(eq.revenue_generated / Math.max(eq.treatments, 1)).toLocaleString('ro-RO')} lei`],
                ['ROI %', `${eq.roiPercent >= 0 ? '+' : ''}${eq.roiPercent.toFixed(0)}%`],
                ['Payback', eq.paybackMonths ? `${eq.paybackMonths.toFixed(0)} luni` : '—'],
                ['Net Return', `${eq.netReturn >= 0 ? '+' : ''}${Math.round(eq.netReturn).toLocaleString('ro-RO')} lei`],
              ].map(([label, value]) => (
                <div key={label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--ivory)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
