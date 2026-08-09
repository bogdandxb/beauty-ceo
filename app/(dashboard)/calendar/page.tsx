'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ChevronLeft, ChevronRight, Plus, Check, X, Clock } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

interface Appointment {
  id: string;
  client_id: string | null;
  service_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  status: string;
  client_name_manual: string | null;
  service_name_manual: string | null;
  price_estimate: number | null;
  notes: string | null;
  clients: { first_name: string; last_name: string; phone: string | null } | null;
  services: { name: string; price: number; duration_minutes: number } | null;
}

interface Client { id: string; first_name: string; last_name: string; phone: string | null; }
interface Service { id: string; name: string; price: number; duration_minutes: number; }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled:  { label: 'Programată',  color: '#3b82f6', bg: '#EFF6FF' },
  confirmed:  { label: 'Confirmată',  color: '#22c55e', bg: '#F0FDF4' },
  completed:  { label: 'Finalizată',  color: TAUPE,     bg: 'var(--beige)' },
  cancelled:  { label: 'Anulată',     color: '#ef4444', bg: '#FEF2F2' },
  no_show:    { label: 'No-show',     color: '#f59e0b', bg: '#FFFBEB' },
};

const DAYS_RO = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
const MONTHS_RO = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

const EMPTY_FORM = {
  client_id: '', client_name_manual: '',
  service_id: '', service_name_manual: '',
  appointment_date: new Date().toISOString().slice(0, 10),
  start_time: '09:00', duration_minutes: '60',
  price_estimate: '', notes: '', status: 'scheduled',
};

function calcEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + durationMin;
  return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppts, setMonthAppts] = useState<Record<string, number>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDrop, setShowClientDrop] = useState(false);

  const loadDay = useCallback(async (date: string) => {
    setLoading(true);
    const { data } = await sb()
      .from('appointments')
      .select('*, clients(first_name, last_name, phone), services(name, price, duration_minutes)')
      .eq('appointment_date', date)
      .order('start_time');
    setAppointments((data as unknown as Appointment[]) || []);
    setLoading(false);
  }, []);

  const loadMonth = useCallback(async (year: number, month: number) => {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    const { data } = await sb()
      .from('appointments')
      .select('appointment_date')
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .neq('status', 'cancelled');
    const counts: Record<string, number> = {};
    ((data as { appointment_date: string }[]) || []).forEach(a => {
      counts[a.appointment_date] = (counts[a.appointment_date] || 0) + 1;
    });
    setMonthAppts(counts);
  }, []);

  useEffect(() => {
    loadDay(selectedDate);
    Promise.all([
      sb().from('clients').select('id, first_name, last_name, phone').eq('is_active', true).order('first_name'),
      sb().from('services').select('id, name, price, duration_minutes').eq('is_active', true).neq('is_archived', true).order('name'),
    ]).then(([{ data: c }, { data: s }]) => {
      setClients((c as Client[]) || []);
      setServices((s as Service[]) || []);
    });
  }, [loadDay]);

  useEffect(() => { loadMonth(viewYear, viewMonth); }, [viewYear, viewMonth, loadMonth]);
  useEffect(() => { loadDay(selectedDate); }, [selectedDate, loadDay]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function openAdd(date?: string) {
    setForm({ ...EMPTY_FORM, appointment_date: date || selectedDate });
    setEditId(null); setSaved(false); setClientSearch(''); setShowForm(true);
  }

  function openEdit(a: Appointment) {
    const clientName = a.clients ? `${a.clients.first_name} ${a.clients.last_name}` : a.client_name_manual || '';
    setClientSearch(clientName);
    setForm({
      client_id: a.client_id || '',
      client_name_manual: a.client_name_manual || '',
      service_id: a.service_id || '',
      service_name_manual: a.service_name_manual || '',
      appointment_date: a.appointment_date,
      start_time: a.start_time.slice(0, 5),
      duration_minutes: String(a.duration_minutes),
      price_estimate: a.price_estimate ? String(a.price_estimate) : '',
      notes: a.notes || '',
      status: a.status,
    });
    setEditId(a.id); setSaved(false); setShowForm(true);
  }

  async function saveAppointment() {
    if (!form.appointment_date || !form.start_time) return;
    setSaving(true);
    const dur = parseInt(form.duration_minutes) || 60;
    const payload = {
      client_id: form.client_id || null,
      client_name_manual: !form.client_id ? (clientSearch.trim() || null) : null,
      service_id: form.service_id || null,
      service_name_manual: !form.service_id ? (form.service_name_manual.trim() || null) : null,
      appointment_date: form.appointment_date,
      start_time: form.start_time,
      end_time: calcEndTime(form.start_time, dur),
      duration_minutes: dur,
      price_estimate: parseFloat(form.price_estimate) || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };
    if (editId) {
      await sb().from('appointments').update(payload).eq('id', editId);
    } else {
      await sb().from('appointments').insert({ ...payload, is_demo: false });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => {
      setSaved(false); setShowForm(false);
      loadDay(form.appointment_date);
      loadMonth(viewYear, viewMonth);
    }, 800);
  }

  async function updateStatus(id: string, status: string) {
    await sb().from('appointments').update({ status }).eq('id', id);
    loadDay(selectedDate);
  }

  async function deleteAppt(id: string) {
    await sb().from('appointments').delete().eq('id', id);
    loadDay(selectedDate);
    loadMonth(viewYear, viewMonth);
  }

  const days = getMonthDays(viewYear, viewMonth);
  const todayStr = today.toISOString().slice(0, 10);
  const filteredClients = clientSearch.length > 0
    ? clients.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(clientSearch.toLowerCase()) || (c.phone || '').includes(clientSearch)).slice(0, 6)
    : clients.slice(0, 5);

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDayName = DAYS_RO[selectedDateObj.getDay() === 0 ? 6 : selectedDateObj.getDay() - 1];

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Programări</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Calendar</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{MONTHS_RO[viewMonth]} {viewYear}</p>
        </div>
        <button onClick={() => openAdd()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Programare nouă
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>

        {/* Calendar mini */}
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={16} color={TAUPE} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: TAUPE }}>{MONTHS_RO[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={16} color={TAUPE} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS_RO.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: TAUPE_LIGHT, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {days.map((day, i) => {
              if (!day) return <div key={i} />;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const count = monthAppts[dateStr] || 0;
              return (
                <button key={i} onClick={() => setSelectedDate(dateStr)}
                  style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 8, border: `1px solid ${isSelected ? GOLD : isToday ? 'var(--beige)' : 'transparent'}`, background: isSelected ? GOLD : isToday ? 'var(--gold-pale)' : 'transparent', color: isSelected ? 'white' : TAUPE, fontSize: 12, fontWeight: isToday || isSelected ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                  {day}
                  {count > 0 && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : GOLD }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Azi buton */}
          <button onClick={() => { setSelectedDate(todayStr); setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
            style={{ width: '100%', marginTop: 12, padding: '8px 0', borderRadius: 8, border: '1px solid var(--beige)', background: 'white', fontSize: 12, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
            Azi
          </button>

          {/* Legendă status */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                <span style={{ fontSize: 11, color: TAUPE_LIGHT }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ziua selectată */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>
                {selectedDayName}, {new Date(selectedDate + 'T00:00:00').getDate()} {MONTHS_RO[new Date(selectedDate + 'T00:00:00').getMonth()]}
              </p>
              <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{appointments.length} programări</p>
            </div>
            <button onClick={() => openAdd(selectedDate)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'white', border: `1px solid ${GOLD}`, borderRadius: 9, fontSize: 12, fontWeight: 600, color: GOLD, cursor: 'pointer' }}>
              <Plus size={12} /> Adaugă
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: TAUPE_LIGHT }}>Se încarcă...</div>
          ) : appointments.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: TAUPE_LIGHT, marginBottom: 12 }}>Nicio programare în această zi.</p>
              <button onClick={() => openAdd(selectedDate)}
                style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Adaugă programare
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appointments.map(a => {
                const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;
                const clientName = a.clients
                  ? `${a.clients.first_name} ${a.clients.last_name}`
                  : a.client_name_manual || 'Clientă necunoscută';
                const serviceName = a.services?.name || a.service_name_manual || '—';
                return (
                  <div key={a.id} style={{ background: 'white', border: `1px solid var(--beige)`, borderLeft: `3px solid ${st.color}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Clock size={13} color={TAUPE_LIGHT} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: TAUPE }}>{a.start_time.slice(0, 5)}</span>
                          {a.end_time && <span style={{ fontSize: 11, color: TAUPE_LIGHT }}>→ {a.end_time.slice(0, 5)}</span>}
                          <span style={{ fontSize: 11, color: TAUPE_LIGHT }}>· {a.duration_minutes} min</span>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: st.bg, color: st.color, fontWeight: 700 }}>{st.label}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: TAUPE, marginBottom: 2 }}>{clientName}</p>
                        <p style={{ fontSize: 12, color: TAUPE_LIGHT }}>{serviceName}{a.price_estimate ? ` · ${a.price_estimate.toLocaleString('ro-RO')} lei` : ''}</p>
                        {a.notes && <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 4, fontStyle: 'italic' }}>{a.notes}</p>}
                        {a.clients?.phone && <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 2 }}>📞 {a.clients.phone}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginLeft: 10 }}>
                        {a.status === 'scheduled' && (
                          <button onClick={() => updateStatus(a.id, 'confirmed')} title="Confirmă"
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbf7d0', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Check size={13} color="#16a34a" />
                          </button>
                        )}
                        {(a.status === 'scheduled' || a.status === 'confirmed') && (
                          <button onClick={() => updateStatus(a.id, 'cancelled')} title="Anulează"
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={13} color="#ef4444" />
                          </button>
                        )}
                        <button onClick={() => openEdit(a)} title="Editează"
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: TAUPE }}>
                          ✏
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 560, paddingBottom: 40, maxHeight: '93vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>
              {editId ? 'Editează programare' : 'Programare nouă'}
            </h2>

            {/* Clientă */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CLIENTĂ</label>
              <div style={{ position: 'relative' }}>
                <input value={clientSearch} onChange={e => { setClientSearch(e.target.value); setForm(f => ({ ...f, client_id: '' })); setShowClientDrop(true); }}
                  onFocus={() => setShowClientDrop(true)}
                  placeholder="Caută clientă sau scrie un nume..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
                {showClientDrop && filteredClients.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--beige)', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 50, marginTop: 4, maxHeight: 200, overflowY: 'auto' }}>
                    {filteredClients.map(c => (
                      <div key={c.id} onClick={() => { setForm(f => ({ ...f, client_id: c.id })); setClientSearch(`${c.first_name} ${c.last_name}`); setShowClientDrop(false); }}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--beige-light)', display: 'flex', justifyContent: 'space-between' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--ivory)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'white')}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.first_name} {c.last_name}</p>
                          {c.phone && <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{c.phone}</p>}
                        </div>
                        {form.client_id === c.id && <Check size={14} color={GOLD} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {form.client_id && <p style={{ fontSize: 11, color: '#22c55e', marginTop: 3 }}>✓ Clientă selectată din baza de date</p>}
            </div>

            {/* Serviciu */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SERVICIU</label>
              <select value={form.service_id} onChange={e => {
                const s = services.find(s => s.id === e.target.value);
                setForm(f => ({ ...f, service_id: e.target.value, duration_minutes: s ? String(s.duration_minutes) : f.duration_minutes, price_estimate: s ? String(s.price) : f.price_estimate }));
              }} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                <option value="">— selectează sau scrie mai jos —</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.price.toLocaleString('ro-RO')} lei · {s.duration_minutes} min</option>)}
              </select>
              {!form.service_id && (
                <input value={form.service_name_manual} onChange={e => setForm(f => ({ ...f, service_name_manual: e.target.value }))}
                  placeholder="sau scrie manual serviciul..."
                  style={{ marginTop: 6, width: '100%', padding: '9px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>

            {/* Dată, oră, durată */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DATA *</label>
                <input type="date" value={form.appointment_date} onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ORA *</label>
                <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DURATĂ (min)</label>
                <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Preview oră terminare */}
            {form.start_time && form.duration_minutes && (
              <div style={{ background: 'var(--ivory)', borderRadius: 8, padding: '8px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>Oră terminare estimată</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: TAUPE }}>{calcEndTime(form.start_time, parseInt(form.duration_minutes) || 60)}</span>
              </div>
            )}

            {/* Preț estimat + status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PREȚ ESTIMAT (lei)</label>
                <input type="number" value={form.price_estimate} onChange={e => setForm(f => ({ ...f, price_estimate: e.target.value }))} placeholder="opțional"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>STATUS</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>OBSERVAȚII</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="opțional..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>
                Anulează
              </button>
              <button onClick={saveAppointment} disabled={saving || !form.appointment_date || !form.start_time}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saved ? '#22c55e' : (!form.appointment_date || !form.start_time || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Adaugă programarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
