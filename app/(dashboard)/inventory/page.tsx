'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Edit2, Check, Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

const UNITS = ['ml', 'g', 'buc', 'l', 'kg', 'doze'];
const CATEGORIES_PRO = ['Curățare', 'Peeling', 'Mască', 'Ser', 'Cremă', 'Ulei', 'Acid', 'Epilare', 'Vopsea', 'Tratament', 'Altele'];
const CATEGORIES_RETAIL = ['Curățare', 'Hidratare', 'Protecție solară', 'Anti-age', 'Corp', 'Scalp', 'Acnee', 'Pigmentare', 'Altele'];

interface Product {
  id: string; name: string; brand: string | null; category: string | null;
  product_type: string; unit: string; package_size: number | null;
  cost_per_package: number | null; cost_per_unit: number | null;
  retail_price: number | null; current_stock: number; min_stock_alert: number;
  reorder_quantity: number | null; pao_months: number | null;
  opening_date: string | null; expiry_date: string | null;
  lot_number: string | null; location: string | null; supplier: string | null;
  last_purchase_date: string | null; last_purchase_price: number | null;
  is_demo: boolean;
}

const EMPTY_FORM = {
  name: '', brand: '', category: '', product_type: 'professional',
  unit: 'ml', package_size: '', cost_per_package: '', retail_price: '',
  current_stock: '', min_stock_alert: '', reorder_quantity: '',
  pao_months: '', opening_date: '', expiry_date: '',
  lot_number: '', location: '', supplier: '',
};

type Tab = 'professional' | 'retail';
type FormKey = keyof typeof EMPTY_FORM;

function daysUntilExpiry(product: Product): number | null {
  const ref = product.expiry_date
    ? new Date(product.expiry_date)
    : product.opening_date && product.pao_months
    ? new Date(new Date(product.opening_date).setMonth(new Date(product.opening_date).getMonth() + product.pao_months))
    : null;
  if (!ref) return null;
  return Math.floor((ref.getTime() - Date.now()) / 86400000);
}

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < 0) return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#FEF2F2', color: '#dc2626', fontWeight: 700 }}>EXPIRAT</span>;
  if (days <= 30) return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#FEF2F2', color: '#ef4444', fontWeight: 700 }}>{days}z</span>;
  if (days <= 60) return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#FEF3C7', color: '#d97706', fontWeight: 700 }}>{days}z</span>;
  if (days <= 90) return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#FFFBEB', color: '#f59e0b', fontWeight: 700 }}>{days}z</span>;
  return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#F0FDF4', color: '#16a34a', fontWeight: 700 }}>{days}z</span>;
}

function StockBar({ current, min, reorder }: { current: number; min: number; reorder: number | null }) {
  const max = Math.max(current, min * 3, reorder || 0, 1);
  const pct = Math.min((current / max) * 100, 100);
  const isLow = current <= min;
  const color = isLow ? '#ef4444' : current <= (min * 1.5) ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: 'var(--beige)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('professional');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showAdjust, setShowAdjust] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('purchase');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await sb().from('products').select('*').eq('is_active', true).order('name');
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, product_type: tab });
    setEditId(null); setSavedId(null); setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, brand: p.brand || '', category: p.category || '',
      product_type: p.product_type, unit: p.unit,
      package_size: p.package_size ? String(p.package_size) : '',
      cost_per_package: p.cost_per_package ? String(p.cost_per_package) : '',
      retail_price: p.retail_price ? String(p.retail_price) : '',
      current_stock: String(p.current_stock), min_stock_alert: String(p.min_stock_alert),
      reorder_quantity: p.reorder_quantity ? String(p.reorder_quantity) : '',
      pao_months: p.pao_months ? String(p.pao_months) : '',
      opening_date: p.opening_date || '', expiry_date: p.expiry_date || '',
      lot_number: p.lot_number || '', location: p.location || '', supplier: p.supplier || '',
    });
    setEditId(p.id); setSavedId(null); setShowForm(true);
  }

  async function saveProduct() {
    if (!form.name.trim()) return;
    setSaving(true);
    const costPerUnit = form.cost_per_package && form.package_size
      ? parseFloat(form.cost_per_package) / parseFloat(form.package_size)
      : null;
    const payload = {
      name: form.name.trim(), brand: form.brand.trim() || null,
      category: form.category || null, product_type: form.product_type,
      unit: form.unit, package_size: parseFloat(form.package_size) || null,
      cost_per_package: parseFloat(form.cost_per_package) || null,
      cost_per_unit: costPerUnit,
      retail_price: parseFloat(form.retail_price) || null,
      current_stock: parseFloat(form.current_stock) || 0,
      min_stock_alert: parseFloat(form.min_stock_alert) || 0,
      reorder_quantity: parseFloat(form.reorder_quantity) || null,
      pao_months: parseInt(form.pao_months) || null,
      opening_date: form.opening_date || null, expiry_date: form.expiry_date || null,
      lot_number: form.lot_number.trim() || null, location: form.location.trim() || null,
      supplier: form.supplier.trim() || null,
    };
    let id = editId;
    if (editId) {
      await sb().from('products').update(payload).eq('id', editId);
    } else {
      const { data } = await sb().from('products').insert({ ...payload, is_demo: false }).select('id').single();
      id = (data as { id: string } | null)?.id || null;
    }
    setSaving(false); setSavedId(id);
    setTimeout(() => { setSavedId(null); setShowForm(false); load(); }, 800);
  }

  async function doAdjust() {
    if (!showAdjust || !adjustQty) return;
    setAdjusting(true);
    const qty = adjustType === 'purchase' || adjustType === 'return' ? Math.abs(parseFloat(adjustQty)) : -Math.abs(parseFloat(adjustQty));
    await sb().rpc('adjust_stock', {
      p_product_id: showAdjust.id,
      p_movement_type: adjustType,
      p_quantity: qty,
      p_cost: showAdjust.cost_per_unit || null,
      p_notes: adjustNote || null,
    });
    setAdjusting(false); setShowAdjust(null); setAdjustQty(''); setAdjustNote('');
    load();
  }

  const displayed = products.filter(p => p.product_type === tab);
  const lowStock = products.filter(p => p.current_stock <= p.min_stock_alert);
  const expiringSoon = products.filter(p => { const d = daysUntilExpiry(p); return d !== null && d <= 90; });
  const totalValuePro = products.filter(p => p.product_type === 'professional').reduce((s, p) => s + (p.current_stock * (p.cost_per_unit || 0)), 0);
  const totalValueRetail = products.filter(p => p.product_type === 'retail').reduce((s, p) => s + (p.current_stock * (p.retail_price || 0)), 0);

  const cats = tab === 'professional' ? CATEGORIES_PRO : CATEGORIES_RETAIL;
  const numInput = (label: string, field: FormKey, placeholder: string, suffix?: string) => (
    <div key={field}>
      <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}{suffix && ` (${suffix})`}</label>
      <input type="number" placeholder={placeholder} value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' as const }} />
    </div>
  );

  const costPerUnit = form.cost_per_package && form.package_size
    ? (parseFloat(form.cost_per_package) / parseFloat(form.package_size)).toFixed(4)
    : null;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Inventar</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Stoc Produse</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{products.length} produse · {lowStock.length} sub minim · {expiringSoon.length} expiră în 90 zile</p>
        </div>
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Produs nou
        </button>
      </div>

      {/* KPI-uri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Stoc Cabină', val: `${totalValuePro.toLocaleString('ro-RO')} lei`, icon: Package, color: TAUPE },
          { label: 'Stoc Retail', val: `${totalValueRetail.toLocaleString('ro-RO')} lei`, icon: ShoppingCart, color: GOLD },
          { label: 'Sub minim', val: String(lowStock.length), icon: AlertTriangle, color: lowStock.length > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Expiră 90z', val: String(expiringSoon.length), icon: TrendingUp, color: expiringSoon.length > 0 ? '#f59e0b' : '#22c55e' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon size={14} color={color} />
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{label}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-cormorant)' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Alerte stoc scăzut */}
      {lowStock.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="#dc2626" />
          <p style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            Stoc scăzut: {lowStock.map(p => p.name).join(', ')}
          </p>
        </div>
      )}

      {/* Tabs Professional / Retail */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {([['professional', 'Stoc Cabină (Profesional)'], ['retail', 'Stoc Retail (Revânzare)']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 20px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', background: tab === t ? TAUPE : 'transparent', color: tab === t ? 'white' : TAUPE_LIGHT, cursor: 'pointer', transition: 'all 0.15s' }}>
            {label} ({products.filter(p => p.product_type === t).length})
          </button>
        ))}
      </div>

      {/* Lista produse */}
      <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 80px 70px 60px', gap: 6, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
          {['Produs', 'Stoc', tab === 'retail' ? 'Preț vânz.' : 'Cost/pkg', 'Valoare', 'PAO / Exp.', 'Locație', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: TAUPE_LIGHT }}>Se încarcă...</div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: TAUPE_LIGHT, marginBottom: 12 }}>Niciun produs {tab === 'professional' ? 'de cabină' : 'retail'} înregistrat.</p>
            <button onClick={openAdd} style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Adaugă produs</button>
          </div>
        ) : displayed.map((p, i) => {
          const days = daysUntilExpiry(p);
          const isLow = p.current_stock <= p.min_stock_alert;
          const unitVal = p.product_type === 'retail' ? (p.retail_price || 0) : (p.cost_per_unit || 0);
          const value = p.current_stock * unitVal;
          return (
            <div key={p.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid var(--beige-light)' : 'none', padding: '12px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 80px 70px 60px', gap: 6, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isLow ? '#ef4444' : TAUPE }}>{p.name}</p>
                    {p.is_demo && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#FEF3C7', color: '#92400E' }}>DEMO</span>}
                  </div>
                  <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{p.brand || '—'} · {p.category || '—'}</p>
                  <StockBar current={p.current_stock} min={p.min_stock_alert} reorder={p.reorder_quantity} />
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isLow ? '#ef4444' : TAUPE }}>
                    {p.current_stock} {p.unit}
                  </span>
                  {isLow && <p style={{ fontSize: 10, color: '#ef4444' }}>minim: {p.min_stock_alert}</p>}
                </div>
                <span style={{ fontSize: 12, color: TAUPE }}>
                  {p.product_type === 'retail'
                    ? (p.retail_price ? `${p.retail_price.toLocaleString('ro-RO')} lei` : '—')
                    : (p.cost_per_package ? `${p.cost_per_package.toLocaleString('ro-RO')} lei` : '—')}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>
                  {value > 0 ? `${value.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei` : '—'}
                </span>
                <ExpiryBadge days={days} />
                <span style={{ fontSize: 11, color: TAUPE_LIGHT }}>{p.location || '—'}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setShowAdjust(p); setAdjustType('purchase'); }}
                    style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: '#22c55e', fontWeight: 700 }} title="Ajustează stoc">±</button>
                  <button onClick={() => openEdit(p)}
                    style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Edit2 size={11} color={TAUPE} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal ajustare stoc */}
      {showAdjust && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAdjust(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', color: TAUPE, marginBottom: 4 }}>Ajustare stoc</h3>
            <p style={{ fontSize: 12, color: TAUPE_LIGHT, marginBottom: 20 }}>{showAdjust.name} · curent: <strong>{showAdjust.current_stock} {showAdjust.unit}</strong></p>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {[['purchase', 'Achiziție +'], ['use', 'Utilizare −'], ['sale', 'Vânzare −'], ['waste', 'Pierdere −'], ['adjustment', 'Ajustare ±'], ['return', 'Retur +']].map(([t, label]) => (
                <button key={t} onClick={() => setAdjustType(t)}
                  style={{ padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, border: `1px solid ${adjustType === t ? GOLD : 'var(--beige)'}`, background: adjustType === t ? 'var(--gold-pale)' : 'white', color: adjustType === t ? TAUPE : TAUPE_LIGHT, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                CANTITATE ({showAdjust.unit})
              </label>
              <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="ex: 100"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 14, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>OBSERVAȚII</label>
              <input value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="opțional..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {adjustQty && (
              <div style={{ background: 'var(--ivory)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>Stoc după ajustare</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: TAUPE }}>
                  {(['purchase', 'return', 'adjustment'].includes(adjustType)
                    ? showAdjust.current_stock + Math.abs(parseFloat(adjustQty || '0'))
                    : showAdjust.current_stock - Math.abs(parseFloat(adjustQty || '0'))
                  ).toFixed(1)} {showAdjust.unit}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdjust(null)}
                style={{ flex: 1, padding: 11, border: '1px solid var(--beige)', borderRadius: 9, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer' }}>
                Anulează
              </button>
              <button onClick={doAdjust} disabled={adjusting || !adjustQty}
                style={{ flex: 2, padding: 11, border: 'none', borderRadius: 9, background: !adjustQty || adjusting ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {adjusting ? 'Se salvează...' : 'Confirmă ajustarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal — Add / Edit produs */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 580, paddingBottom: 40, maxHeight: '93vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 6 }}>
              {editId ? 'Editează produs' : 'Produs nou'}
            </h2>

            {/* Tab tip produs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'var(--ivory)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
              {([['professional', 'Cabină'], ['retail', 'Retail']] as [string, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setForm(f => ({ ...f, product_type: t }))}
                  style={{ padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: 'none', background: form.product_type === t ? TAUPE : 'transparent', color: form.product_type === t ? 'white' : TAUPE_LIGHT, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NUME PRODUS *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Acid Hialuronic 2%, Cremă SPF50..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BRAND</label>
                <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="ex: RHEA, The Ordinary..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CATEGORIE</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  <option value="">— selectează —</option>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Ambalaj & cost</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>UNITATE</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              {numInput('Mărime pachet', 'package_size', 'ex: 500')}
              {numInput('Cost pachet (lei)', 'cost_per_package', 'ex: 85')}
            </div>

            {/* Preview cost/unitate */}
            {costPerUnit && (
              <div style={{ background: 'var(--ivory)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>Cost per {form.unit}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: TAUPE }}>{costPerUnit} lei/{form.unit}</span>
              </div>
            )}

            {form.product_type === 'retail' && (
              <div style={{ marginBottom: 12 }}>
                {numInput('Preț vânzare retail (lei)', 'retail_price', 'ex: 150')}
                {form.cost_per_package && form.package_size && form.retail_price && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                    Marjă: {(((parseFloat(form.retail_price) - parseFloat(form.cost_per_package)) / parseFloat(form.retail_price)) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            )}

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Stoc & alertă</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              {numInput(`Stoc curent (${form.unit || 'unități'})`, 'current_stock', '0')}
              {numInput(`Minim alertă (${form.unit || 'unități'})`, 'min_stock_alert', 'ex: 50')}
              {numInput(`Cantitate recomandă (${form.unit || 'unități'})`, 'reorder_quantity', 'ex: 200')}
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>PAO & expirare</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              {numInput('PAO (luni)', 'pao_months', 'ex: 12')}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA DESCHIDERE</label>
                <input type="date" value={form.opening_date} onChange={e => setForm(f => ({ ...f, opening_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA EXPIRARE</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Detalii logistice</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>FURNIZOR</label>
                <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="ex: Dermo Concept..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>LOT / LOT NR.</label>
                <input value={form.lot_number} onChange={e => setForm(f => ({ ...f, lot_number: e.target.value }))} placeholder="opțional"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>LOCAȚIE DEPOZITARE</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="ex: Raft 2, Frigider..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveProduct} disabled={saving || !form.name.trim()}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: savedId ? '#22c55e' : (!form.name.trim() || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {savedId ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Adaugă produsul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
