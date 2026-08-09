'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Users, Heart, Clock, TrendingUp, Edit2, Check, ChevronRight } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';
import { createBrowserClient } from '@supabase/ssr';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

const SEGMENT_CONFIG = {
  new:       { label: 'Nouă',      color: '#C6A769', bg: '#FBF7F0' },
  returning: { label: 'Recurentă', color: '#3b82f6', bg: '#EFF6FF' },
  loyal:     { label: 'Loială',    color: '#22c55e', bg: '#F0FDF4' },
  inactive:  { label: 'Inactivă',  color: '#f59e0b', bg: '#FFFBEB' },
  lapsed:    { label: 'Pierdută',  color: '#ef4444', bg: '#FEF2F2' },
} as const;
type Segment = keyof typeof SEGMENT_CONFIG;

const SOURCES = ['Instagram', 'Facebook', 'TikTok', 'Google', 'Recomandare', 'Walk-in', 'Website', 'Altele'];
const SKIN_TYPES = ['normală', 'uscată', 'grasă', 'mixtă', 'sensibilă', 'acneică', 'matură'];
const HAIR_TYPES = ['fin', 'normal', 'gros', 'creț', 'vopsit'];

interface Client {
  id: string; first_name: string; last_name: string;
  phone: string | null; email: string | null;
  total_visits: number; total_spent: number;
  last_visit_date: string | null; segment: Segment;
  acquisition_source: string | null; acquisition_date: string | null;
  birthday: string | null; skin_type: string | null; hair_type: string | null;
  allergies_notes: string | null; general_notes: string | null; is_demo: boolean;
}

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

const EMPTY_FORM = {
  first_name: '', last_name: '', phone: '', email: '',
  acquisition_source: 'Instagram', acquisition_date: '',
  birthday: '', skin_type: '', hair_type: '',
  allergies_notes: '', general_notes: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState<Segment | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);
    const { data } = await sb()
      .from('clients')
      .select('id, first_name, last_name, phone, email, total_visits, total_spent, last_visit_date, segment, acquisition_source, acquisition_date, birthday, skin_type, hair_type, allergies_notes, general_notes, is_demo')
      .eq('is_active', true)
      .order('total_spent', { ascending: false });
    setClients((data as Client[]) || []);
    setLoading(false);
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, acquisition_date: new Date().toISOString().slice(0, 10) });
    setEditId(null); setSaved(false); setShowForm(true);
  }

  function openEdit(c: Client) {
    setForm({
      first_name: c.first_name, last_name: c.last_name,
      phone: c.phone || '', email: c.email || '',
      acquisition_source: c.acquisition_source || 'Instagram',
      acquisition_date: c.acquisition_date || '',
      birthday: c.birthday || '', skin_type: c.skin_type || '',
      hair_type: c.hair_type || '', allergies_notes: c.allergies_notes || '',
      general_notes: c.general_notes || '',
    });
    setEditId(c.id); setSaved(false); setShowForm(true);
  }

  async function saveClient() {
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setSaving(true);
    const payload = {
      first_name: form.first_name.trim(), last_name: form.last_name.trim(),
      phone: form.phone.trim() || null, email: form.email.trim() || null,
      acquisition_source: form.acquisition_source,
      acquisition_date: form.acquisition_date || null,
      birthday: form.birthday || null,
      skin_type: form.skin_type || null, hair_type: form.hair_type || null,
      allergies_notes: form.allergies_notes.trim() || null, general_notes: form.general_notes.trim() || null,
    };
    if (editId) {
      await sb().from('clients').update(payload).eq('id', editId);
    } else {
      await sb().from('clients').insert({ ...payload, segment: 'new', is_demo: false });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); loadClients(); }, 800);
  }

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || (c.phone || '').includes(search);
    const matchSegment = !filterSegment || c.segment === filterSegment;
    return matchSearch && matchSegment;
  });

  const segmentCounts = Object.fromEntries(Object.keys(SEGMENT_CONFIG).map(k => [k, clients.filter(c => c.segment === k).length]));
  const totalRevenue = clients.reduce((s, c) => s + c.total_spent, 0);
  const avgLTV = clients.length > 0 ? Math.round(totalRevenue / clients.length) : 0;
  const loyalCount = segmentCounts.loyal || 0;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>CRM</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Clientele</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{loading ? '...' : `${clients.length} cliente înregistrate`}</p>
        </div>
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Clientă nouă
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <KPICard label="Total Cliente" value={clients.length} icon={Users} />
        <KPICard label="Loiale" value={loyalCount} icon={Heart} sub={clients.length > 0 ? `${Math.round((loyalCount / clients.length) * 100)}% din total` : '—'} />
        <KPICard label="LTV Mediu" value={avgLTV} isCurrency icon={TrendingUp} />
        <KPICard label="Inactive / Pierdute" value={(segmentCounts.inactive || 0) + (segmentCounts.lapsed || 0)} icon={Clock} />
      </div>

      {/* Filtre segment */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilterSegment('')}
          style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid var(--beige)', background: !filterSegment ? GOLD : 'white', color: !filterSegment ? 'white' : TAUPE, cursor: 'pointer' }}>
          Toate ({clients.length})
        </button>
        {(Object.entries(SEGMENT_CONFIG) as [Segment, typeof SEGMENT_CONFIG[Segment]][]).map(([k, cfg]) => (
          <button key={k} onClick={() => setFilterSegment(filterSegment === k ? '' : k)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${cfg.color}40`, background: filterSegment === k ? cfg.color : cfg.bg, color: filterSegment === k ? 'white' : cfg.color, cursor: 'pointer' }}>
            {cfg.label} ({segmentCounts[k] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: TAUPE_LIGHT }} />
        <input type="text" placeholder="Caută după nume sau telefon..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--beige)', borderRadius: 10, fontSize: 13, color: TAUPE, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Lista */}
      <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 90px 56px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
          {['Clientă', 'Vizite', 'Total cheltuit', 'Segment', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT }}>{h}</span>
          ))}
        </div>
        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}><p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Se încarcă...</p></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}><p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Nicio clientă găsită.</p></div>
        ) : filtered.map((c, i) => {
          const seg = SEGMENT_CONFIG[c.segment] || SEGMENT_CONFIG.new;
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--beige-light)' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 90px 56px', gap: 8, padding: '14px 20px', alignItems: 'center' }}>
                <div style={{ cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.first_name} {c.last_name}</p>
                    {c.is_demo && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#FEF3C7', color: '#92400E' }}>DEMO</span>}
                    <ChevronRight size={12} color={TAUPE_LIGHT} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                  </div>
                  <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 1 }}>{c.phone || '—'} · {c.acquisition_source || '—'}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.total_visits}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.total_spent.toLocaleString('ro-RO')} lei</span>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: seg.bg, color: seg.color, whiteSpace: 'nowrap' }}>{seg.label}</span>
                <button onClick={() => openEdit(c)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Edit2 size={13} color={TAUPE} />
                </button>
              </div>

              {/* Expanded detalii */}
              {isExpanded && (
                <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    ['Email', c.email || '—'],
                    ['Data înregistrării', c.acquisition_date ? new Date(c.acquisition_date).toLocaleDateString('ro-RO') : '—'],
                    ['Ultima vizită', c.last_visit_date ? new Date(c.last_visit_date).toLocaleDateString('ro-RO') : '—'],
                    ['Zi de naștere', c.birthday ? new Date(c.birthday).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' }) : '—'],
                    ['Tip ten', c.skin_type || '—'],
                    ['Tip păr', c.hair_type || '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: 'var(--ivory)', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ fontSize: 10, color: TAUPE_LIGHT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: TAUPE }}>{val}</p>
                    </div>
                  ))}
                  {c.allergies_notes && (
                    <div style={{ gridColumn: '1 / -1', background: '#FEF2F2', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>⚠ Alergii</p>
                      <p style={{ fontSize: 12, color: TAUPE }}>{c.allergies_notes}</p>
                    </div>
                  )}
                  {c.general_notes && (
                    <div style={{ gridColumn: '1 / -1', background: 'var(--ivory)', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ fontSize: 10, color: TAUPE_LIGHT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Observații</p>
                      <p style={{ fontSize: 12, color: TAUPE }}>{c.general_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 560, paddingBottom: 40, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>
              {editId ? 'Editează profil clientă' : 'Clientă nouă'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {([['Prenume *', 'first_name', 'text'], ['Nume *', 'last_name', 'text'], ['Telefon', 'phone', 'tel'], ['Email', 'email', 'email']] as [string, keyof typeof EMPTY_FORM, string][]).map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SURSĂ ACHIZIȚIE</label>
                <select value={form.acquisition_source} onChange={e => setForm(f => ({ ...f, acquisition_source: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA PRIMEI VIZITE</label>
                <input type="date" value={form.acquisition_date} onChange={e => setForm(f => ({ ...f, acquisition_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ZI DE NAȘTERE</label>
                <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Profil frumusețe</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TIP TEN</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {SKIN_TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, skin_type: f.skin_type === t ? '' : t }))}
                      style={{ padding: '5px 10px', borderRadius: 14, fontSize: 11, fontWeight: 500, border: `1px solid ${form.skin_type === t ? GOLD : 'var(--beige)'}`, background: form.skin_type === t ? 'var(--gold-pale)' : 'white', color: form.skin_type === t ? TAUPE : TAUPE_LIGHT, cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TIP PĂR</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {HAIR_TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, hair_type: f.hair_type === t ? '' : t }))}
                      style={{ padding: '5px 10px', borderRadius: 14, fontSize: 11, fontWeight: 500, border: `1px solid ${form.hair_type === t ? GOLD : 'var(--beige)'}`, background: form.hair_type === t ? 'var(--gold-pale)' : 'white', color: form.hair_type === t ? TAUPE : TAUPE_LIGHT, cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚠ ALERGII / CONTRAINDICAȚII</label>
              <textarea value={form.allergies_notes} onChange={e => setForm(f => ({ ...f, allergies_notes: e.target.value }))} rows={2}
                placeholder="Alergii cunoscute, contraindicații..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>OBSERVAȚII GENERALE</label>
              <textarea value={form.general_notes} onChange={e => setForm(f => ({ ...f, general_notes: e.target.value }))} rows={2}
                placeholder="Preferințe, note personale..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveClient} disabled={saving || !form.first_name.trim() || !form.last_name.trim()}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saved ? '#22c55e' : (!form.first_name.trim() || !form.last_name.trim() || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Adaugă clienta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
