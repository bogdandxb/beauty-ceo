'use client';

import { useEffect, useState } from 'react';
import { Wrench, TrendingUp, CheckCircle, Clock, Plus, Edit2, Check, Archive } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';
import { createBrowserClient } from '@supabase/ssr';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

interface Equipment {
  id: string; name: string; brand: string | null; category: string | null;
  purchase_date: string; purchase_price: number; maintenance_cost_yearly: number;
  expected_lifespan_years: number; installation_cost: number; training_cost: number;
  accessories_cost: number; next_service_date: string | null; is_demo: boolean;
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
  const totalInvestment = eq.purchase_price + (eq.installation_cost || 0) + (eq.training_cost || 0) + (eq.accessories_cost || 0) + maintenanceCostToDate;
  const netReturn = revenue_generated - totalInvestment;
  const roiPercent = totalInvestment > 0 ? (netReturn / totalInvestment) * 100 : 0;
  const avgMonthlyRevenue = revenue_generated / monthsInUse;
  const monthlyMaintenance = eq.maintenance_cost_yearly / 12;
  const monthlyNet = avgMonthlyRevenue - monthlyMaintenance;
  const paybackMonths = monthlyNet > 0 ? eq.purchase_price / monthlyNet : null;
  const totalCapital = eq.purchase_price + (eq.installation_cost || 0) + (eq.training_cost || 0) + (eq.accessories_cost || 0);
  const recoveredPercent = Math.min(totalCapital > 0 ? (revenue_generated / totalCapital) * 100 : 0, 100);
  const isRecouped = revenue_generated >= totalCapital;
  return { totalInvestment, totalCapital, netReturn, roiPercent, paybackMonths, recoveredPercent, isRecouped, revenue_generated, treatments_count: eq.treatments.length };
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

const EMPTY_FORM = {
  name: '', brand: '', category: '', purchase_date: '', purchase_price: '',
  maintenance_cost_yearly: '', expected_lifespan_years: '5',
  installation_cost: '', training_cost: '', accessories_cost: '', next_service_date: '',
};
type FormKey = keyof typeof EMPTY_FORM;

const EQUIPMENT_CATEGORIES = ['Laser', 'Epilare', 'Față', 'Corp', 'Unghii', 'Păr', 'Sterilizare', 'Mobilier', 'Altele'];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await sb()
      .from('equipment')
      .select('id, name, brand, category, purchase_date, purchase_price, maintenance_cost_yearly, expected_lifespan_years, installation_cost, training_cost, accessories_cost, next_service_date, is_demo, treatments(final_price)')
      .eq('is_active', true)
      .neq('is_archived', true)
      .eq('treatments.status', 'completed')
      .order('purchase_date');
    setEquipment((data as Equipment[]) || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(EMPTY_FORM); setEditId(null); setSaved(false); setShowForm(true);
  }

  function openEdit(eq: Equipment) {
    setForm({
      name: eq.name, brand: eq.brand || '', category: eq.category || '',
      purchase_date: eq.purchase_date, purchase_price: String(eq.purchase_price),
      maintenance_cost_yearly: String(eq.maintenance_cost_yearly || ''),
      expected_lifespan_years: String(eq.expected_lifespan_years || 5),
      installation_cost: String(eq.installation_cost || ''),
      training_cost: String(eq.training_cost || ''),
      accessories_cost: String(eq.accessories_cost || ''),
      next_service_date: eq.next_service_date || '',
    });
    setEditId(eq.id); setSaved(false); setShowForm(true);
  }

  async function saveEquipment() {
    if (!form.name.trim() || !form.purchase_date || !form.purchase_price) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(), brand: form.brand.trim() || null,
      category: form.category || null,
      purchase_date: form.purchase_date,
      purchase_price: parseFloat(form.purchase_price),
      purchase_price_ron: parseFloat(form.purchase_price),
      maintenance_cost_yearly: parseFloat(form.maintenance_cost_yearly || '0'),
      expected_lifespan_years: parseInt(form.expected_lifespan_years || '5'),
      installation_cost: parseFloat(form.installation_cost || '0'),
      training_cost: parseFloat(form.training_cost || '0'),
      accessories_cost: parseFloat(form.accessories_cost || '0'),
      next_service_date: form.next_service_date || null,
    };
    if (editId) {
      await sb().from('equipment').update(payload).eq('id', editId);
    } else {
      await sb().from('equipment').insert({ ...payload, is_demo: false });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); load(); }, 800);
  }

  async function archiveEquipment(id: string) {
    await sb().from('equipment').update({ is_archived: true, is_active: false }).eq('id', id);
    setArchiveConfirm(null);
    load();
  }

  const allROI = equipment.map(eq => ({ ...eq, ...calculateROI(eq) }));
  const totalInvested = allROI.reduce((s, e) => s + e.totalCapital, 0);
  const totalRevenue = allROI.reduce((s, e) => s + e.revenue_generated, 0);
  const recouped = allROI.filter(e => e.isRecouped).length;

  const numField = (label: string, field: FormKey, placeholder: string) => (
    <div key={field}>
      <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input type="number" placeholder={placeholder} value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' as const }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>ROI Aparatură</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Aparatură</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Analiza recuperării investițiilor · {equipment.length} aparate</p>
        </div>
        <button onClick={openAdd}
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
      ) : equipment.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 14, color: TAUPE_LIGHT, marginBottom: 16 }}>Niciun aparat înregistrat.</p>
          <button onClick={openAdd} style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Adaugă aparat</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {allROI.map(eq => (
            <div key={eq.id} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: TAUPE }}>{eq.name}</p>
                    {eq.is_demo && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#FEF3C7', color: '#92400E' }}>DEMO</span>}
                    {eq.category && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'var(--beige)', color: TAUPE_LIGHT, fontWeight: 600 }}>{eq.category}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 2 }}>
                    {eq.brand && `${eq.brand} · `}
                    Cumpărat {new Date(eq.purchase_date).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })} · {eq.purchase_price.toLocaleString('ro-RO')} lei
                    {(eq.installation_cost > 0 || eq.training_cost > 0 || eq.accessories_cost > 0) && ` + ${((eq.installation_cost || 0) + (eq.training_cost || 0) + (eq.accessories_cost || 0)).toLocaleString('ro-RO')} lei costuri`}
                  </p>
                  {eq.next_service_date && (
                    <p style={{ fontSize: 11, color: new Date(eq.next_service_date) <= new Date() ? '#ef4444' : '#f59e0b', marginTop: 2 }}>
                      🔧 Service: {new Date(eq.next_service_date).toLocaleDateString('ro-RO')}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {eq.isRecouped ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', color: '#16a34a', fontSize: 11, fontWeight: 700 }}>
                      <CheckCircle size={12} /> Recuperat
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: 'var(--gold-pale)', color: TAUPE, fontSize: 11, fontWeight: 700 }}>
                      <Clock size={12} /> În recuperare
                    </span>
                  )}
                  <button onClick={() => openEdit(eq)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Edit2 size={13} color={TAUPE} />
                  </button>
                  {archiveConfirm === eq.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => archiveEquipment(eq.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Da</button>
                      <button onClick={() => setArchiveConfirm(null)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--beige)', background: 'white', color: TAUPE, fontSize: 11, cursor: 'pointer' }}>Nu</button>
                    </div>
                  ) : (
                    <button onClick={() => setArchiveConfirm(eq.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Archive size={13} color={TAUPE_LIGHT} />
                    </button>
                  )}
                </div>
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

      {/* Form modal — Add/Edit */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 560, paddingBottom: 40, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>
              {editId ? 'Editează aparatul' : 'Aparat nou'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NUME APARAT *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Laser Diodă, HydraFacial..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BRAND</label>
                <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="ex: Alma Lasers..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CATEGORIE</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  <option value="">— fără categorie —</option>
                  {EQUIPMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA CUMPĂRĂRII *</label>
                <input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Costuri achiziție</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {numField('Preț achiziție (lei) *', 'purchase_price', 'ex: 15000')}
              {numField('Instalare (lei)', 'installation_cost', 'ex: 500')}
              {numField('Training (lei)', 'training_cost', 'ex: 300')}
              {numField('Accesorii (lei)', 'accessories_cost', 'ex: 200')}
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Mentenanță & durată</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {numField('Mentenanță/an (lei)', 'maintenance_cost_yearly', 'ex: 1200')}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DURATĂ VIAȚĂ</label>
                <select value={form.expected_lifespan_years} onChange={e => setForm(f => ({ ...f, expected_lifespan_years: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {['3', '4', '5', '6', '7', '8', '10', '12', '15'].map(y => <option key={y} value={y}>{y} ani</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA NEXT SERVICE</label>
                <input type="date" value={form.next_service_date} onChange={e => setForm(f => ({ ...f, next_service_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Preview total investiție */}
            {form.purchase_price && (
              <div style={{ background: 'var(--ivory)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>Total investiție inițială</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>
                  {(parseFloat(form.purchase_price || '0') + parseFloat(form.installation_cost || '0') + parseFloat(form.training_cost || '0') + parseFloat(form.accessories_cost || '0')).toLocaleString('ro-RO')} lei
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveEquipment} disabled={saving || !form.name.trim() || !form.purchase_date || !form.purchase_price}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saved ? '#22c55e' : (!form.name.trim() || !form.purchase_date || !form.purchase_price || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Salvează aparatul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
