'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Users, Heart, Clock, TrendingUp } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';
import { createBrowserClient } from '@supabase/ssr';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

const SEGMENT_CONFIG = {
  new: { label: 'Nouă', color: '#C6A769', bg: '#FBF7F0' },
  returning: { label: 'Recurentă', color: '#3b82f6', bg: '#EFF6FF' },
  loyal: { label: 'Loială', color: '#22c55e', bg: '#F0FDF4' },
  inactive: { label: 'Inactivă', color: '#f59e0b', bg: '#FFFBEB' },
  lapsed: { label: 'Pierdută', color: '#ef4444', bg: '#FEF2F2' },
} as const;

type Segment = keyof typeof SEGMENT_CONFIG;

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  total_visits: number;
  total_spent: number;
  last_visit_date: string | null;
  segment: Segment;
  acquisition_source: string | null;
}

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState<Segment | ''>('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', acquisition_source: 'Instagram' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    const { data } = await supabase()
      .from('clients')
      .select('id, first_name, last_name, phone, total_visits, total_spent, last_visit_date, segment, acquisition_source')
      .eq('is_active', true)
      .order('total_spent', { ascending: false });
    setClients((data as Client[]) || []);
    setLoading(false);
  }

  async function saveClient() {
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setSaving(true);
    await supabase().from('clients').insert({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      acquisition_source: form.acquisition_source,
      acquisition_date: new Date().toISOString().slice(0, 10),
      segment: 'new',
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ first_name: '', last_name: '', phone: '', email: '', acquisition_source: 'Instagram' });
    loadClients();
  }

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || (c.phone || '').includes(search);
    const matchSegment = !filterSegment || c.segment === filterSegment;
    return matchSearch && matchSegment;
  });

  const segmentCounts = Object.fromEntries(
    Object.keys(SEGMENT_CONFIG).map(k => [k, clients.filter(c => c.segment === k).length])
  );
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
        <button onClick={() => setShowAdd(true)}
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

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: TAUPE_LIGHT }} />
        <input type="text" placeholder="Caută după nume sau telefon..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--beige)', borderRadius: 10, fontSize: 13, color: TAUPE, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 90px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
          {['Clientă', 'Vizite', 'Total cheltuit', 'Segment'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT }}>{h}</span>
          ))}
        </div>
        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Se încarcă...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Nicio clientă găsită.</p>
          </div>
        ) : filtered.map((c, i) => {
          const seg = SEGMENT_CONFIG[c.segment] || SEGMENT_CONFIG.new;
          return (
            <div key={c.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 90px', gap: 8, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.first_name} {c.last_name}</p>
                <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 1 }}>{c.phone || '—'} · {c.acquisition_source || '—'}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.total_visits}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.total_spent.toLocaleString('ro-RO')} lei</span>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: seg.bg, color: seg.color, whiteSpace: 'nowrap' }}>{seg.label}</span>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowAdd(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 500, paddingBottom: 40 }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>Clientă nouă</h2>
            {([['Prenume *', 'first_name', 'text'], ['Nume *', 'last_name', 'text'], ['Telefon', 'phone', 'tel'], ['Email (opțional)', 'email', 'email']] as [string, keyof typeof form, string][]).map(([label, field, type]) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>Sursa</label>
              <select value={form.acquisition_source} onChange={e => setForm(f => ({ ...f, acquisition_source: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                {['Instagram', 'Facebook', 'TikTok', 'Google', 'Recomandare', 'Walk-in', 'Website', 'Altele'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveClient} disabled={saving}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saving ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
