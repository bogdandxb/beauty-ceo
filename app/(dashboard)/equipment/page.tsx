'use client';

import { useEffect, useState } from 'react';
import { Wrench, TrendingUp, CheckCircle, Clock, Plus } from 'lucide-react';
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

interface Equipment {
  id: string;
  name: string;
  purchase_date: string;
  purchase_price: number;
  maintenance_cost_yearly: number;
  expected_lifespan_years: number;
  treatments: { final_price: number }[];
}

function calculateROI(eq: Equipment) {
  const purchaseDate = new Date(eq.purchase_date);
  const now = new Date();
  const monthsInUse = Math.max(
    (now.getFullYear() - purchaseDate.getFullYear()) * 12 + now.getMonth() - purchaseDate.getMonth(), 1
  );
  const revenue_generated = eq.treatments.reduce((s, t) => s + t.final_price, 0);
  const maintenanceCostToDate = (eq.maintenance_cost_yearly / 12) * monthsInUse;
  const totalInvestment = eq.purchase_price + maintenanceCostToDate;
  const netReturn = revenue_generated - totalInvestment;
  const roiPercent = (netReturn / totalInvestment) * 100;
  const avgMonthlyRevenue = revenue_generated / monthsInUse;
  const monthlyMaintenance = eq.maintenance_cost_yearly / 12;
  const monthlyNet = avgMonthlyRevenue - monthlyMaintenance;
  const paybackMonths = monthlyNet > 0 ? eq.purchase_price / monthlyNet : null;
  const recoveredPercent = Math.min((revenue_generated / eq.purchase_price) * 100, 100);
  const isRecouped = revenue_generated >= eq.purchase_price;
  return { totalInvestment, netReturn, roiPercent, paybackMonths, recoveredPercent, isRecouped, revenue_generated, treatments_count: eq.treatments.length };
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

const EMPTY_FORM = { name: '', brand: '', purchase_date: '', purchase_price: '', maintenance_cost_yearly: '', expected_lifespan_years: '5' };

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase()
      .from('equipment')
      .select('id, name, purchase_date, purchase_price, maintenance_cost_yearly, expected_lifespan_years, treatments(final_price)')
      .eq('is_active', true)
      .eq('treatments.status', 'completed')
      .order('purchase_date');
    setEquipment((data as Equipment[]) || []);
    setLoading(false);
  }

  async function saveEquipment() {
    if (!form.name.trim() || !form.purchase_date || !form.purchase_price) return;
    setSaving(true);
    await supabase().from('equipment').insert({
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      purchase_date: form.purchase_date,
      purchase_price: parseFloat(form.purchase_price),
      purchase_price_ron: parseFloat(form.purchase_price),
      maintenance_cost_yearly: parseFloat(form.maintenance_cost_yearly || '0'),
      expected_lifespan_years: parseInt(form.expected_lifespan_years || '5'),
      is_demo: false,
    });
    setSaving(false);
    setShowAdd(false);
    setForm(EMPTY_FORM);
    load();
  }

  const allROI = equipment.map(eq => ({ ...eq, ...calculateROI(eq) }));
  const totalInvested = equipment.reduce((s, e) => s + e.purchase_price, 0);
  const totalRevenue = allROI.reduce((s, e) => s + e.revenue_generated, 0);
  const recouped = allROI.filter(e => e.isRecouped).length;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>ROI Aparatură</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Aparatură</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Analiza recuperării investițiilor</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Plus size={14} /> Aparat nou
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        <KPICard label="Total Investit" value={totalInvested} isCurrency icon={Wrench} />
        <KPICard label="Revenue Generat" value={totalRevenue} isCurrency icon={TrendingUp} />
        <KPICard label="Aparate Recuperate" value={`${recouped}/${equipment.length}`} icon={CheckCircle} sub="investiție acoperită" />
        <KPICard label="Net Return" value={totalRevenue - totalInvested} isCurrency icon={TrendingUp} trend={totalInvested > 0 ? ((totalRevenue - totalInvested) / totalInvested) * 100 : 0} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT, fontSize: 14 }}>Se încarcă...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {allROI.map(eq => (
            <div key={eq.id} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
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
                  ['Tratamente', `${eq.treatments_count}`],
                  ['Revenue/Tratament', `${eq.treatments_count > 0 ? Math.round(eq.revenue_generated / eq.treatments_count).toLocaleString('ro-RO') : '—'} lei`],
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
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowAdd(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 500, paddingBottom: 40 }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>Aparat nou</h2>

            {([
              ['Nume aparat *', 'name', 'text', 'ex: Laser Diodă, HydraFacial...'],
              ['Brand / Producător', 'brand', 'text', 'ex: Alma Lasers, Edge Systems...'],
            ] as [string, keyof typeof EMPTY_FORM, string, string][]).map(([label, field, type, placeholder]) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={placeholder} value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>Data cumpărării *</label>
              <input type="date" value={form.purchase_date}
                onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>Preț achiziție (lei) *</label>
                <input type="number" placeholder="ex: 15000" value={form.purchase_price}
                  onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>Mentenanță/an (lei)</label>
                <input type="number" placeholder="ex: 1200" value={form.maintenance_cost_yearly}
                  onChange={e => setForm(f => ({ ...f, maintenance_cost_yearly: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>Durată de viață estimată (ani)</label>
              <select value={form.expected_lifespan_years}
                onChange={e => setForm(f => ({ ...f, expected_lifespan_years: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                {['3', '4', '5', '6', '7', '8', '10', '12', '15'].map(y => (
                  <option key={y} value={y}>{y} ani</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveEquipment} disabled={saving || !form.name.trim() || !form.purchase_date || !form.purchase_price}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: (!form.name.trim() || !form.purchase_date || !form.purchase_price || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, cursor: (!form.name.trim() || !form.purchase_date || !form.purchase_price || saving) ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                {saving ? 'Se salvează...' : 'Salvează aparatul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
