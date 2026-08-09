'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Save, Trash2, AlertTriangle, Check } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const TABS = ['Business', 'Financiar', 'Targete', 'Clientele', 'Inventar', 'Demo'];
const MONTH_NAMES = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
const DAY_LABELS: Record<string, string> = { mon: 'Lun', tue: 'Mar', wed: 'Mie', thu: 'Joi', fri: 'Vin', sat: 'Sâm', sun: 'Dum' };

interface Settings {
  id: string; salon_name: string; owner_name: string; currency: string; currency_symbol: string;
  vat_registered: boolean; vat_rate: number; address: string; phone: string; email: string;
  working_days: Record<string, boolean>; open_time: string; close_time: string;
  operator_cost_per_hour: number; demo_mode: boolean;
  low_stock_threshold_pct: number; expiry_warning_days_1: number; expiry_warning_days_2: number; expiry_warning_days_3: number;
}
interface Target {
  id?: string; period_type: string; period_year: number; period_number: number;
  target_revenue: number; target_profit: number; target_clients: number; target_treatments: number;
  target_new_clients: number; target_avg_ticket: number; target_occupancy_pct: number;
}
interface SegmentRule {
  segment: string; label_ro: string; min_visits: number; max_visits: number | null;
  min_days_since_last_visit: number; max_days_since_last_visit: number | null; color: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}
function Inp({ value, onChange, type = 'text', placeholder = '' }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none', boxSizing: 'border-box' }} />;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD, marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  );
}
function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: saved ? '#22c55e' : GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
      {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : <><Save size={14} /> Salvează</>}
    </button>
  );
}

function TargetFields({ t, onChange }: { t: Target; onChange: (t: Target) => void }) {
  const fields: [keyof Target, string][] = [
    ['target_revenue', 'Revenue target (lei)'], ['target_profit', 'Profit target (lei)'],
    ['target_clients', 'Clientele unice'], ['target_treatments', 'Tratamente'],
    ['target_new_clients', 'Clientele noi'], ['target_avg_ticket', 'Ticket mediu (lei)'],
    ['target_occupancy_pct', 'Grad ocupare (%)'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {fields.map(([field, label]) => (
        <div key={field}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>{label}</label>
          <input type="number" value={(t[field] as number) || ''} placeholder="0"
            onChange={e => onChange({ ...t, [field]: parseFloat(e.target.value) || 0 })}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      ))}
    </div>
  );
}

function RecurringExpensesList() {
  const [list, setList] = useState<{ id: string; name: string; category: string; amount: number; frequency: string; vendor: string | null; is_active: boolean }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Chirie', amount: '', frequency: 'monthly', vendor: '', start_date: new Date().toISOString().slice(0, 10) });
  const FREQ: Record<string, string> = { monthly: 'Lunar', weekly: 'Săptămânal', quarterly: 'Trimestrial', yearly: 'Anual' };
  const CATS = ['Chirie', 'Utilități', 'Contabilitate', 'Software', 'Salarii', 'Marketing', 'Taxe', 'Altele'];

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await sb().from('recurring_expenses').select('id, name, category, amount, frequency, vendor, is_active').order('category');
    setList((data as typeof list) || []);
  }
  async function save() {
    if (!form.name || !form.amount) return;
    await sb().from('recurring_expenses').insert({ name: form.name, category: form.category, amount: parseFloat(form.amount), frequency: form.frequency, vendor: form.vendor || null, start_date: form.start_date, expense_type: 'fixed', is_demo: false });
    setShowAdd(false);
    setForm({ name: '', category: 'Chirie', amount: '', frequency: 'monthly', vendor: '', start_date: new Date().toISOString().slice(0, 10) });
    load();
  }
  async function toggle(id: string, current: boolean) {
    await sb().from('recurring_expenses').update({ is_active: !current }).eq('id', id);
    load();
  }
  return (
    <div>
      {list.length === 0 && !showAdd && <p style={{ fontSize: 13, color: TAUPE_LIGHT, marginBottom: 12 }}>Nicio cheltuială recurentă setată.</p>}
      {list.map(r => (
        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--beige-light)', opacity: r.is_active ? 1 : 0.5 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{r.name}</p>
            <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{r.category} · {FREQ[r.frequency] || r.frequency}{r.vendor ? ` · ${r.vendor}` : ''}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>{r.amount.toLocaleString('ro-RO')} lei</span>
            <button onClick={() => toggle(r.id, r.is_active)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--beige)', background: 'white', color: TAUPE_LIGHT, cursor: 'pointer' }}>
              {r.is_active ? 'Dezactivează' : 'Activează'}
            </button>
          </div>
        </div>
      ))}
      {showAdd ? (
        <div style={{ background: 'var(--ivory)', borderRadius: 10, padding: 14, marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[['Denumire *', 'name', 'text', 'ex: Chirie salon'], ['Sumă (lei) *', 'amount', 'number', 'ex: 2500'], ['Furnizor', 'vendor', 'text', 'ex: Proprietar'], ['Data start', 'start_date', 'date', '']].map(([label, field, type, ph]) => (
              <div key={field}>
                <label style={{ fontSize: 10, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 3 }}>{label}</label>
                <input type={type} value={(form as Record<string, string>)[field]} placeholder={ph} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 3 }}>Categorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, background: 'white', outline: 'none' }}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 3 }}>Frecvență</label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, background: 'white', outline: 'none' }}>
                {Object.entries(FREQ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 9, border: '1px solid var(--beige)', borderRadius: 8, background: 'white', fontSize: 12, color: TAUPE, cursor: 'pointer' }}>Anulează</button>
            <button onClick={save} style={{ flex: 2, padding: 9, border: 'none', borderRadius: 8, background: GOLD, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Salvează</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{ marginTop: 12, padding: '8px 16px', border: '1px dashed var(--gold)', borderRadius: 8, background: 'var(--gold-pale)', color: 'var(--gold)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Adaugă cheltuială recurentă
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('Business');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [segments, setSegments] = useState<SegmentRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const emptyTarget = (type: string, num: number): Target => ({ period_type: type, period_year: year, period_number: num, target_revenue: 0, target_profit: 0, target_clients: 0, target_treatments: 0, target_new_clients: 0, target_avg_ticket: 0, target_occupancy_pct: 0 });
  const [monthTarget, setMonthTarget] = useState<Target>(emptyTarget('month', month));
  const [yearTarget, setYearTarget] = useState<Target>(emptyTarget('year', year));
  const [selMonth, setSelMonth] = useState(month);
  const [selYear, setSelYear] = useState(year);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadMonthTarget(selMonth, selYear); }, [selMonth, selYear]);

  async function loadAll() {
    const [{ data: s }, { data: seg }, { data: yt }] = await Promise.all([
      sb().from('business_settings').select('*').single(),
      sb().from('segment_rules').select('*').order('sort_order'),
      sb().from('targets').select('*').eq('period_type', 'year').eq('period_year', year).eq('period_number', year).single(),
    ]);
    if (s) setSettings(s as Settings);
    if (seg) setSegments(seg as SegmentRule[]);
    if (yt) setYearTarget(yt as Target);
    await loadMonthTarget(month, year);
  }
  async function loadMonthTarget(m: number, y: number) {
    const { data } = await sb().from('targets').select('*').eq('period_type', 'month').eq('period_year', y).eq('period_number', m).single();
    setMonthTarget(data ? (data as Target) : emptyTarget('month', m));
  }

  function set(field: keyof Settings, value: unknown) { setSettings(s => s ? { ...s, [field]: value } : s); setSaved(false); }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    await sb().from('business_settings').update({
      salon_name: settings.salon_name, owner_name: settings.owner_name, currency: settings.currency,
      currency_symbol: settings.currency_symbol, vat_registered: settings.vat_registered, vat_rate: settings.vat_rate,
      address: settings.address, phone: settings.phone, email: settings.email,
      working_days: settings.working_days, open_time: settings.open_time, close_time: settings.close_time,
      operator_cost_per_hour: settings.operator_cost_per_hour, low_stock_threshold_pct: settings.low_stock_threshold_pct,
      expiry_warning_days_1: settings.expiry_warning_days_1, expiry_warning_days_2: settings.expiry_warning_days_2,
      expiry_warning_days_3: settings.expiry_warning_days_3,
    }).eq('id', settings.id);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function saveTarget(t: Target) {
    setSaving(true);
    await sb().from('targets').upsert({ period_type: t.period_type, period_year: t.period_year, period_number: t.period_number, target_revenue: t.target_revenue || 0, target_profit: t.target_profit || 0, target_clients: t.target_clients || 0, target_treatments: t.target_treatments || 0, target_new_clients: t.target_new_clients || 0, target_avg_ticket: t.target_avg_ticket || 0, target_occupancy_pct: t.target_occupancy_pct || 0 }, { onConflict: 'period_type,period_year,period_number' });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function saveSegments() {
    setSaving(true);
    for (const seg of segments) {
      await sb().from('segment_rules').update({ min_visits: seg.min_visits, max_visits: seg.max_visits, min_days_since_last_visit: seg.min_days_since_last_visit, max_days_since_last_visit: seg.max_days_since_last_visit }).eq('segment', seg.segment);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  async function deleteDemoData() {
    if (deleteText !== 'STERGE DEMO') return;
    setDeleting(true);
    await sb().rpc('delete_all_demo_data');
    setDeleting(false); setShowDeleteConfirm(false); setDeleteText('');
    window.location.reload();
  }

  if (!settings) return <div style={{ padding: 60, textAlign: 'center', color: TAUPE_LIGHT }}>Se încarcă setările...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Administrare</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Setări</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Configurează toate datele business-ului tău</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--beige)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === t ? `2px solid ${GOLD}` : '2px solid transparent', color: tab === t ? TAUPE : TAUPE_LIGHT, whiteSpace: 'nowrap', marginBottom: -1 }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Business' && (
        <div>
          <Card title="Informații salon">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nume salon"><Inp value={settings.salon_name} onChange={v => set('salon_name', v)} /></Field>
              <Field label="Proprietar"><Inp value={settings.owner_name} onChange={v => set('owner_name', v)} /></Field>
              <Field label="Telefon"><Inp value={settings.phone || ''} onChange={v => set('phone', v)} /></Field>
              <Field label="Email"><Inp value={settings.email || ''} onChange={v => set('email', v)} type="email" /></Field>
            </div>
            <Field label="Adresă"><Inp value={settings.address || ''} onChange={v => set('address', v)} /></Field>
          </Card>
          <Card title="Program de lucru">
            <Field label="Zile lucrătoare">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => set('working_days', { ...settings.working_days, [key]: !settings.working_days[key] })}
                    style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${settings.working_days[key] ? GOLD : 'var(--beige)'}`, background: settings.working_days[key] ? 'var(--gold-pale)' : 'white', color: settings.working_days[key] ? TAUPE : TAUPE_LIGHT, cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Oră deschidere"><input type="time" value={settings.open_time} onChange={e => set('open_time', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} /></Field>
              <Field label="Oră închidere"><input type="time" value={settings.close_time} onChange={e => set('close_time', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} /></Field>
            </div>
          </Card>
          <Card title="Monedă & TVA">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Monedă"><Inp value={settings.currency} onChange={v => set('currency', v)} placeholder="RON" /></Field>
              <Field label="Simbol"><Inp value={settings.currency_symbol} onChange={v => set('currency_symbol', v)} placeholder="lei" /></Field>
            </div>
            <Field label="TVA înregistrat">
              <div style={{ display: 'flex', gap: 8 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => set('vat_registered', v)}
                    style={{ padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${settings.vat_registered === v ? GOLD : 'var(--beige)'}`, background: settings.vat_registered === v ? 'var(--gold-pale)' : 'white', color: settings.vat_registered === v ? TAUPE : TAUPE_LIGHT, cursor: 'pointer' }}>
                    {v ? 'Da' : 'Nu'}
                  </button>
                ))}
              </div>
            </Field>
            {settings.vat_registered && <Field label="Cotă TVA (%)"><Inp value={settings.vat_rate} onChange={v => set('vat_rate', parseFloat(v) || 0)} type="number" /></Field>}
          </Card>
          <SaveBtn onClick={saveSettings} saving={saving} saved={saved} />
        </div>
      )}

      {tab === 'Financiar' && (
        <div>
          <Card title="Cost operator">
            <Field label="Cost / oră operator (lei)">
              <Inp value={settings.operator_cost_per_hour} onChange={v => set('operator_cost_per_hour', parseFloat(v) || 0)} type="number" placeholder="ex: 50" />
              <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 4 }}>Folosit pentru calculul automat al costului pe tratament în funcție de durată.</p>
            </Field>
          </Card>
          <Card title="Cheltuieli recurente (fixe lunare)">
            <RecurringExpensesList />
          </Card>
          <SaveBtn onClick={saveSettings} saving={saving} saved={saved} />
        </div>
      )}

      {tab === 'Targete' && (
        <div>
          <Card title="Target lunar">
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                style={{ width: 100, padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <TargetFields t={monthTarget} onChange={t => { setMonthTarget(t); setSaved(false); }} />
            <SaveBtn onClick={() => saveTarget(monthTarget)} saving={saving} saved={saved} />
          </Card>
          <Card title={`Target anual ${year}`}>
            <TargetFields t={yearTarget} onChange={t => { setYearTarget(t); setSaved(false); }} />
            <SaveBtn onClick={() => saveTarget(yearTarget)} saving={saving} saved={saved} />
          </Card>
        </div>
      )}

      {tab === 'Clientele' && (
        <div>
          <Card title="Reguli segmentare clientele">
            <p style={{ fontSize: 12, color: TAUPE_LIGHT, marginBottom: 16 }}>Definește criteriile de clasificare a clientelelor în segmente.</p>
            {segments.map((seg, i) => (
              <div key={seg.segment} style={{ padding: '14px 0', borderBottom: i < segments.length - 1 ? '1px solid var(--beige-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: seg.color + '20', color: seg.color }}>{seg.label_ro}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                  {[
                    ['Min vizite', 'min_visits', seg.min_visits],
                    ['Max vizite', 'max_visits', seg.max_visits],
                    ['Min zile inactiv', 'min_days_since_last_visit', seg.min_days_since_last_visit],
                    ['Max zile inactiv', 'max_days_since_last_visit', seg.max_days_since_last_visit],
                  ].map(([label, field, val]) => (
                    <div key={String(field)}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 3 }}>{String(label)}</label>
                      <input type="number" value={val ?? ''} placeholder="∞"
                        onChange={e => setSegments(ss => ss.map((s, j) => j === i ? { ...s, [String(field)]: e.target.value ? parseInt(e.target.value) : null } : s))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <SaveBtn onClick={saveSegments} saving={saving} saved={saved} />
          </Card>
        </div>
      )}

      {tab === 'Inventar' && (
        <div>
          <Card title="Praguri alerte stoc">
            <Field label="Alertă stoc scăzut (% față de minim)">
              <Inp value={settings.low_stock_threshold_pct} onChange={v => set('low_stock_threshold_pct', parseFloat(v) || 0)} type="number" placeholder="20" />
            </Field>
          </Card>
          <Card title="Alerte expirare (zile înainte de expirare)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Alertă 1 (zile)"><Inp value={settings.expiry_warning_days_1} onChange={v => set('expiry_warning_days_1', parseInt(v) || 0)} type="number" placeholder="90" /></Field>
              <Field label="Alertă 2 (zile)"><Inp value={settings.expiry_warning_days_2} onChange={v => set('expiry_warning_days_2', parseInt(v) || 0)} type="number" placeholder="60" /></Field>
              <Field label="Alertă 3 (zile)"><Inp value={settings.expiry_warning_days_3} onChange={v => set('expiry_warning_days_3', parseInt(v) || 0)} type="number" placeholder="30" /></Field>
            </div>
          </Card>
          <SaveBtn onClick={saveSettings} saving={saving} saved={saved} />
        </div>
      )}

      {tab === 'Demo' && (
        <div>
          <Card title="Stare date demo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: settings.demo_mode ? '#f59e0b' : '#22c55e', flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>
                {settings.demo_mode ? 'Demo Mode ACTIV — există date de test în aplicație' : 'Lucrezi cu date reale'}
              </p>
            </div>
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.7 }}>
                <strong>Atenție:</strong> Ștergerea datelor demo este <strong>ireversibilă</strong>.<br />
                Vor fi șterse toate clientele, tratamentele, serviciile, aparatura, cheltuielile marcate ca DEMO.<br />
                Datele introduse de tine <strong>nu vor fi afectate</strong>.
              </p>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#FEF2F2', color: '#dc2626', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Trash2 size={14} /> Șterge toate datele DEMO
            </button>
          </Card>

          {showDeleteConfirm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <AlertTriangle size={22} color="#dc2626" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: TAUPE, fontFamily: 'var(--font-cormorant)' }}>Confirmare ștergere</h2>
                </div>
                <p style={{ fontSize: 13, color: TAUPE_LIGHT, marginBottom: 16, lineHeight: 1.6 }}>
                  Scrie <strong style={{ color: TAUPE }}>STERGE DEMO</strong> pentru a confirma ștergerea permanentă a datelor demo.
                </p>
                <input type="text" value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="STERGE DEMO"
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #FECACA', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                    style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer' }}>
                    Anulează
                  </button>
                  <button onClick={deleteDemoData} disabled={deleteText !== 'STERGE DEMO' || deleting}
                    style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: deleteText === 'STERGE DEMO' ? '#dc2626' : '#f3f4f6', color: deleteText === 'STERGE DEMO' ? 'white' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: deleteText === 'STERGE DEMO' ? 'pointer' : 'not-allowed' }}>
                    {deleting ? 'Se șterge...' : 'Șterge definitiv'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
