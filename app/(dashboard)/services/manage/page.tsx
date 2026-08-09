'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Edit2, Archive, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

interface Category { id: string; name: string; slug: string; }
interface Equipment { id: string; name: string; }
interface Service {
  id: string; name: string; description: string; price: number; duration_minutes: number;
  operator_cost: number; consumables_cost: number; other_costs: number;
  target_margin_pct: number; is_active: boolean; is_archived: boolean; is_demo: boolean;
  category_id: string; equipment_id: string | null;
  category_name?: string;
}

const EMPTY_FORM = { name: '', description: '', price: '', duration_minutes: '60', category_id: '', equipment_id: '', operator_cost: '', consumables_cost: '', other_costs: '', target_margin_pct: '65' };

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ServicesManagePage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: s }, { data: c }, { data: e }] = await Promise.all([
      sb().from('services').select('*, service_categories(name)').eq('is_archived', false).order('name'),
      sb().from('service_categories').select('id, name, slug').eq('is_active', true).order('sort_order'),
      sb().from('equipment').select('id, name').eq('is_active', true).eq('is_archived', false),
    ]);
    setServices(((s as unknown) as (Service & { service_categories: { name: string } | null })[])?.map(x => ({ ...x, category_name: x.service_categories?.name || '—' })) || []);
    setCategories((c as Category[]) || []);
    setEquipment((e as Equipment[]) || []);
    setLoading(false);
  }

  function openAdd() { setForm({ ...EMPTY_FORM, category_id: categories[0]?.id || '' }); setEditId(null); setShowForm(true); setSaved(false); }
  function openEdit(s: Service) {
    setForm({ name: s.name, description: s.description || '', price: String(s.price), duration_minutes: String(s.duration_minutes), category_id: s.category_id, equipment_id: s.equipment_id || '', operator_cost: String(s.operator_cost || 0), consumables_cost: String(s.consumables_cost || 0), other_costs: String(s.other_costs || 0), target_margin_pct: String(s.target_margin_pct || 65) });
    setEditId(s.id); setShowForm(true); setSaved(false);
  }

  async function saveService() {
    if (!form.name || !form.price || !form.category_id) return;
    setSaving(true);
    const payload = { name: form.name.trim(), description: form.description.trim() || null, price: parseFloat(form.price), duration_minutes: parseInt(form.duration_minutes) || 60, category_id: form.category_id, equipment_id: form.equipment_id || null, operator_cost: parseFloat(form.operator_cost) || 0, consumables_cost: parseFloat(form.consumables_cost) || 0, other_costs: parseFloat(form.other_costs) || 0, target_margin_pct: parseFloat(form.target_margin_pct) || 65 };
    if (editId) {
      await sb().from('services').update(payload).eq('id', editId);
    } else {
      let slug = slugify(form.name);
      const { data: ex } = await sb().from('services').select('id').eq('slug', slug);
      if (ex && ex.length > 0) slug = `${slug}-${Date.now()}`;
      await sb().from('services').insert({ ...payload, slug, is_demo: false });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); loadAll(); }, 800);
  }

  async function duplicate(s: Service) {
    let slug = slugify(s.name + '-copie-' + Date.now());
    await sb().from('services').insert({ name: s.name + ' (copie)', description: s.description, price: s.price, duration_minutes: s.duration_minutes, category_id: s.category_id, equipment_id: s.equipment_id, operator_cost: s.operator_cost, consumables_cost: s.consumables_cost, other_costs: s.other_costs, target_margin_pct: s.target_margin_pct, slug, is_demo: false });
    loadAll();
  }

  async function archive(id: string) {
    if (!confirm('Arhivezi acest serviciu? Nu va mai apărea în liste, dar istoricul tratamentelor rămâne intact.')) return;
    await sb().from('services').update({ is_archived: true, is_active: false }).eq('id', id);
    loadAll();
  }

  const totalCost = (f: typeof form) => (parseFloat(f.operator_cost) || 0) + (parseFloat(f.consumables_cost) || 0) + (parseFloat(f.other_costs) || 0);
  const margin = (f: typeof form) => { const p = parseFloat(f.price) || 0; const c = totalCost(f); return p > 0 ? ((p - c) / p) * 100 : 0; };

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Administrare</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Servicii</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{services.length} servicii active</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/services')} style={{ padding: '10px 16px', border: '1px solid var(--beige)', borderRadius: 10, fontSize: 12, color: TAUPE, background: 'white', cursor: 'pointer', fontWeight: 500 }}>
            Vezi raport
          </button>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Serviciu nou
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT }}>Se încarcă...</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 70px 80px 100px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
            {['Serviciu', 'Preț', 'Cost', 'Marjă', 'Durată', 'Acțiuni'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
            ))}
          </div>
          {services.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: TAUPE_LIGHT, marginBottom: 12 }}>Niciun serviciu. Adaugă primul tău serviciu.</p>
              <button onClick={openAdd} style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Serviciu nou</button>
            </div>
          ) : services.map((s, i) => {
            const cost = (s.operator_cost || 0) + (s.consumables_cost || 0) + (s.other_costs || 0);
            const marg = s.price > 0 ? ((s.price - cost) / s.price) * 100 : 0;
            const margColor = marg >= 70 ? '#22c55e' : marg >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 70px 80px 100px', gap: 8, padding: '13px 20px', borderBottom: i < services.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{s.name}</p>
                    {s.is_demo && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#FEF3C7', color: '#92400E' }}>DEMO</span>}
                  </div>
                  <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{s.category_name}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{s.price.toLocaleString('ro-RO')} lei</span>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{cost > 0 ? `${cost.toLocaleString('ro-RO')} lei` : '—'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: margColor }}>{cost > 0 ? `${marg.toFixed(0)}%` : '—'}</span>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{s.duration_minutes} min</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(s)} title="Editează" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={12} color={TAUPE} /></button>
                  <button onClick={() => duplicate(s)} title="Duplică" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Copy size={12} color={TAUPE} /></button>
                  <button onClick={() => archive(s.id)} title="Arhivează" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Archive size={12} color={TAUPE_LIGHT} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 560, paddingBottom: 40, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>
              {editId ? 'Editează serviciu' : 'Serviciu nou'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>NUME *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: HydraFacial Premium"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>CATEGORIE *</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  <option value="">Selectează...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>APARATURĂ</label>
                <select value={form.equipment_id} onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  <option value="">Fără aparat</option>
                  {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>PREȚ (lei) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="ex: 350"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>DURATĂ (minute)</label>
                <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} placeholder="60"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ background: 'var(--ivory)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: GOLD, marginBottom: 10 }}>Costuri pe tratament</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {([['Cost operator (lei)', 'operator_cost'], ['Cost consumabile (lei)', 'consumables_cost'], ['Alte costuri (lei)', 'other_costs']] as [string, keyof typeof EMPTY_FORM][]).map(([label, field]) => (
                  <div key={field}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 3 }}>{label}</label>
                    <input type="number" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder="0"
                      style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {parseFloat(form.price) > 0 && (
              <div style={{ borderRadius: 10, padding: 12, marginBottom: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: margin(form) >= 70 ? '#F0FDF4' : margin(form) >= 50 ? '#FFFBEB' : '#FEF2F2' }}>
                {[['Cost total', `${totalCost(form).toLocaleString('ro-RO')} lei`], ['Profit / tratament', `${((parseFloat(form.price) || 0) - totalCost(form)).toLocaleString('ro-RO')} lei`], ['Marjă', `${margin(form).toFixed(1)}%`]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: TAUPE_LIGHT, marginBottom: 2 }}>{label.toUpperCase()}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>{val}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>DESCRIERE (opțional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Descriere scurtă..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>Anulează</button>
              <button onClick={saveService} disabled={saving || !form.name || !form.price || !form.category_id}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saved ? '#22c55e' : (!form.name || !form.price || !form.category_id || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Creează serviciul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
