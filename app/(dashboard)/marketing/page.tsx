'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Edit2, Check, TrendingUp, Users, DollarSign, Megaphone } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

const CHANNELS = ['Instagram', 'Facebook', 'TikTok', 'Google Ads', 'Email', 'SMS', 'WhatsApp', 'Flyere', 'Recomandări', 'Altele'];
const OBJECTIVES = [
  { value: 'awareness',    label: 'Notorietate' },
  { value: 'leads',        label: 'Generare lead-uri' },
  { value: 'retention',    label: 'Retenție' },
  { value: 'reactivation', label: 'Reactivare cliente' },
];

const CHANNEL_COLORS: Record<string, string> = {
  Instagram: '#E1306C', Facebook: '#1877F2', TikTok: '#010101',
  'Google Ads': '#4285F4', Email: '#f59e0b', SMS: '#22c55e',
  WhatsApp: '#25D366', Flyere: '#8b5cf6', Recomandări: GOLD, Altele: TAUPE_LIGHT,
};

interface Campaign {
  id: string; name: string; channel: string; objective: string | null;
  start_date: string; end_date: string | null;
  budget_planned: number | null; budget_spent: number;
  leads_generated: number; clients_acquired: number;
  new_clients_acquired: number | null; existing_clients_reached: number | null;
  revenue_attributed: number; offer_description: string | null;
  promo_code: string | null; notes: string | null;
  is_active: boolean; is_demo: boolean;
}

const EMPTY_FORM = {
  name: '', channel: 'Instagram', objective: 'leads',
  start_date: new Date().toISOString().slice(0, 10), end_date: '',
  budget_planned: '', budget_spent: '0',
  leads_generated: '0', clients_acquired: '0',
  revenue_attributed: '0', offer_description: '',
  promo_code: '', notes: '', is_active: true,
};

function sb_clients_by_source(source: string, setCount: (n: number) => void) {
  sb().from('clients').select('id', { count: 'exact', head: true }).eq('acquisition_source', source)
    .then(({ count }) => setCount(count || 0));
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<'campaigns' | 'sources'>('campaigns');

  useEffect(() => {
    load();
    loadSourceCounts();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await sb().from('marketing_campaigns').select('*').order('start_date', { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  }

  async function loadSourceCounts() {
    const { data } = await sb().from('clients').select('acquisition_source').eq('is_active', true);
    const counts: Record<string, number> = {};
    ((data as { acquisition_source: string | null }[]) || []).forEach(c => {
      const src = c.acquisition_source || 'Necunoscut';
      counts[src] = (counts[src] || 0) + 1;
    });
    setSourceCounts(counts);
  }

  function openAdd() {
    setForm(EMPTY_FORM); setEditId(null); setSaved(false); setShowForm(true);
  }

  function openEdit(c: Campaign) {
    setForm({
      name: c.name, channel: c.channel, objective: c.objective || 'leads',
      start_date: c.start_date, end_date: c.end_date || '',
      budget_planned: c.budget_planned ? String(c.budget_planned) : '',
      budget_spent: String(c.budget_spent || 0),
      leads_generated: String(c.leads_generated || 0),
      clients_acquired: String(c.clients_acquired || 0),
      revenue_attributed: String(c.revenue_attributed || 0),
      offer_description: c.offer_description || '',
      promo_code: c.promo_code || '', notes: c.notes || '',
      is_active: c.is_active,
    });
    setEditId(c.id); setSaved(false); setShowForm(true);
  }

  async function saveCampaign() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(), channel: form.channel, objective: form.objective || null,
      start_date: form.start_date, end_date: form.end_date || null,
      budget_planned: parseFloat(form.budget_planned) || null,
      budget_spent: parseFloat(form.budget_spent) || 0,
      leads_generated: parseInt(form.leads_generated) || 0,
      clients_acquired: parseInt(form.clients_acquired) || 0,
      revenue_attributed: parseFloat(form.revenue_attributed) || 0,
      offer_description: form.offer_description.trim() || null,
      promo_code: form.promo_code.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
    };
    if (editId) {
      await sb().from('marketing_campaigns').update(payload).eq('id', editId);
    } else {
      await sb().from('marketing_campaigns').insert({ ...payload, is_demo: false });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); load(); }, 800);
  }

  // KPI-uri agregate
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget_spent || 0), 0);
  const totalRevenue = campaigns.reduce((s, c) => s + (c.revenue_attributed || 0), 0);
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads_generated || 0), 0);
  const totalClients = campaigns.reduce((s, c) => s + (c.clients_acquired || 0), 0);
  const overallROI = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0;
  const cpa = totalClients > 0 ? totalBudget / totalClients : 0;

  // Analiza surse
  const totalClientsAll = Object.values(sourceCounts).reduce((s, n) => s + n, 0);
  const sourcesSorted = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Marketing</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Campanii & Surse</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{campaigns.length} campanii · ROI total {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(0)}%</p>
        </div>
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Campanie nouă
        </button>
      </div>

      {/* KPI-uri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Buget cheltuit', val: `${totalBudget.toLocaleString('ro-RO')} lei`, icon: DollarSign, color: '#ef4444' },
          { label: 'Revenue atribuit', val: `${totalRevenue.toLocaleString('ro-RO')} lei`, icon: TrendingUp, color: '#22c55e' },
          { label: 'Lead-uri', val: String(totalLeads), icon: Megaphone, color: '#3b82f6' },
          { label: 'Cost/Clientă', val: cpa > 0 ? `${cpa.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei` : '—', icon: Users, color: GOLD },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon size={13} color={color} />
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{label}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-cormorant)' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {([['campaigns', 'Campanii'] as const, ['sources', 'Analiza Surse'] as const]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 20px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', background: tab === t ? TAUPE : 'transparent', color: tab === t ? 'white' : TAUPE_LIGHT, cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'sources' ? (
        /* Analiza surse */
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE, marginBottom: 16 }}>De unde vin clientele tale</p>
          {sourcesSorted.length === 0 ? (
            <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Nicio clientă înregistrată încă.</p>
          ) : sourcesSorted.map(([source, count]) => {
            const pct = totalClientsAll > 0 ? (count / totalClientsAll) * 100 : 0;
            const color = CHANNEL_COLORS[source] || TAUPE_LIGHT;
            return (
              <div key={source} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{source}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{count} cliente</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--beige)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--beige)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: TAUPE_LIGHT }}>Total cliente</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>{totalClientsAll}</span>
          </div>
        </div>
      ) : (
        /* Lista campanii */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT }}>Se încarcă...</div>
          ) : campaigns.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: TAUPE_LIGHT, marginBottom: 12 }}>Nicio campanie înregistrată.</p>
              <button onClick={openAdd} style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Adaugă campanie</button>
            </div>
          ) : campaigns.map(c => {
            const roi = c.budget_spent > 0 ? ((c.revenue_attributed - c.budget_spent) / c.budget_spent) * 100 : 0;
            const budgetUsed = c.budget_planned ? Math.min((c.budget_spent / c.budget_planned) * 100, 100) : null;
            const channelColor = CHANNEL_COLORS[c.channel] || TAUPE_LIGHT;
            return (
              <div key={c.id} style={{ background: 'white', border: '1px solid var(--beige)', borderLeft: `3px solid ${channelColor}`, borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: TAUPE }}>{c.name}</p>
                      {c.is_demo && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#FEF3C7', color: '#92400E' }}>DEMO</span>}
                      {!c.is_active && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'var(--beige)', color: TAUPE_LIGHT }}>ÎNCHISĂ</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: `${channelColor}15`, color: channelColor, fontWeight: 700 }}>{c.channel}</span>
                      {c.objective && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--ivory)', color: TAUPE_LIGHT, fontWeight: 600 }}>{OBJECTIVES.find(o => o.value === c.objective)?.label || c.objective}</span>}
                      <span style={{ fontSize: 11, color: TAUPE_LIGHT }}>{new Date(c.start_date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}{c.end_date ? ` → ${new Date(c.end_date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}` : ''}</span>
                    </div>
                    {c.offer_description && <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 4, fontStyle: 'italic' }}>{c.offer_description}</p>}
                    {c.promo_code && <p style={{ fontSize: 11, color: GOLD, marginTop: 2, fontWeight: 600 }}>Cod promo: {c.promo_code}</p>}
                  </div>
                  <button onClick={() => openEdit(c)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Edit2 size={13} color={TAUPE} />
                  </button>
                </div>

                {/* Budget bar */}
                {budgetUsed !== null && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: TAUPE_LIGHT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Buget utilizat</span>
                      <span style={{ fontSize: 11, color: budgetUsed >= 90 ? '#ef4444' : TAUPE_LIGHT }}>{c.budget_spent.toLocaleString('ro-RO')} / {c.budget_planned?.toLocaleString('ro-RO')} lei ({budgetUsed.toFixed(0)}%)</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--beige)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${budgetUsed}%`, height: '100%', background: budgetUsed >= 90 ? '#ef4444' : channelColor, borderRadius: 2 }} />
                    </div>
                  </div>
                )}

                {/* KPI-uri campanie */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    ['Lead-uri', String(c.leads_generated)],
                    ['Cliente', String(c.clients_acquired)],
                    ['Revenue', `${(c.revenue_attributed || 0).toLocaleString('ro-RO')} lei`],
                    ['ROI', `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--ivory)', borderRadius: 8 }}>
                      <p style={{ fontSize: 9, color: TAUPE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: label === 'ROI' ? (roi >= 0 ? '#22c55e' : '#ef4444') : TAUPE, fontFamily: 'var(--font-cormorant)' }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 580, paddingBottom: 40, maxHeight: '93vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>
              {editId ? 'Editează campanie' : 'Campanie nouă'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NUME CAMPANIE *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Summer Glow 2026, Black Friday..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CANAL</label>
                <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>OBIECTIV</label>
                <select value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {OBJECTIVES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA START *</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA FINAL</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, margin: '16px 0 10px' }}>Buget & rezultate</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                ['Buget planificat (lei)', 'budget_planned', 'ex: 500'],
                ['Buget cheltuit (lei)', 'budget_spent', '0'],
                ['Lead-uri generate', 'leads_generated', '0'],
                ['Cliente dobândite', 'clients_acquired', '0'],
                ['Revenue atribuit (lei)', 'revenue_attributed', '0'],
              ].map(([label, field, placeholder]) => (
                <div key={field}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                  <input type="number" placeholder={placeholder} value={(form as unknown as Record<string, string>)[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>

            {/* Preview ROI */}
            {parseFloat(form.budget_spent) > 0 && parseFloat(form.revenue_attributed) > 0 && (
              <div style={{ background: 'var(--ivory)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>ROI estimat</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: parseFloat(form.revenue_attributed) >= parseFloat(form.budget_spent) ? '#22c55e' : '#ef4444' }}>
                  {(((parseFloat(form.revenue_attributed) - parseFloat(form.budget_spent)) / parseFloat(form.budget_spent)) * 100).toFixed(0)}%
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>OFERTĂ / DESCRIERE</label>
                <input value={form.offer_description} onChange={e => setForm(f => ({ ...f, offer_description: e.target.value }))} placeholder="ex: -20% tratament facial..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>COD PROMO</label>
                <input value={form.promo_code} onChange={e => setForm(f => ({ ...f, promo_code: e.target.value }))} placeholder="ex: SUMMER20"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>OBSERVAȚII</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="opțional..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: GOLD }} />
              <span style={{ fontSize: 13, color: TAUPE }}>Campanie activă</span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveCampaign} disabled={saving || !form.name.trim()}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saved ? '#22c55e' : (!form.name.trim() || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Adaugă campania'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
