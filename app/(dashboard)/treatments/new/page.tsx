'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ChevronLeft, Check } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface Client { id: string; first_name: string; last_name: string; phone: string | null; }
interface Service { id: string; name: string; price: number; duration_minutes: number; category_name: string; }

const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'virement'];

export default function NewTreatmentPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [treatmentTime, setTreatmentTime] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
    loadServices();
  }, []);

  async function loadClients() {
    const { data } = await supabase()
      .from('clients')
      .select('id, first_name, last_name, phone')
      .eq('is_active', true)
      .order('first_name');
    setClients((data as Client[]) || []);
  }

  async function loadServices() {
    const { data } = await supabase()
      .from('services')
      .select('id, name, price, duration_minutes, service_categories(name)')
      .eq('is_active', true)
      .order('name');
    const mapped = ((data as unknown) as { id: string; name: string; price: number; duration_minutes: number; service_categories: { name: string } | null }[])
      ?.map(s => ({ id: s.id, name: s.name, price: s.price, duration_minutes: s.duration_minutes, category_name: s.service_categories?.name || 'Altele' })) || [];
    setServices(mapped);
  }

  function selectClient(c: Client) {
    setSelectedClient(c);
    setClientSearch(`${c.first_name} ${c.last_name}`);
    setShowClientDropdown(false);
  }

  function selectService(s: Service) {
    setSelectedService(s);
    setFinalPrice(String(s.price));
  }

  const filteredClients = clientSearch.length > 0
    ? clients.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(clientSearch.toLowerCase()) || (c.phone || '').includes(clientSearch))
    : clients.slice(0, 6);

  async function saveTreatment() {
    if (!selectedClient || !selectedService || !finalPrice || !treatmentDate) {
      setError('Completează: clientă, serviciu, dată și preț final.');
      return;
    }
    setError('');
    setSaving(true);

    const price = parseFloat(finalPrice);
    const costSnapshot = Math.round(selectedService.price * 0.25);

    const { error: insertError } = await supabase().from('treatments').insert({
      client_id: selectedClient.id,
      service_id: selectedService.id,
      treatment_date: treatmentDate,
      treatment_time: treatmentTime || null,
      service_name_snapshot: selectedService.name,
      price_snapshot: selectedService.price,
      cost_snapshot: costSnapshot,
      duration_snapshot: selectedService.duration_minutes,
      final_price: price,
      discount_value: selectedService.price > price ? selectedService.price - price : 0,
      discount_type: selectedService.price > price ? 'manual' : null,
      payment_method: paymentMethod,
      technician_notes: notes || null,
      status: 'completed',
      is_demo: false,
    });

    if (insertError) {
      setError('Eroare la salvare: ' + insertError.message);
      setSaving(false);
      return;
    }

    // Update client stats
    await supabase().rpc('update_client_stats', { p_client_id: selectedClient.id }).then(() => {});

    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push('/finance'), 1200);
  }

  const categories = [...new Set(services.map(s => s.category_name))];

  if (saved) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ivory)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Check size={32} color="#16a34a" />
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: TAUPE, fontWeight: 300 }}>Tratament salvat!</p>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT, marginTop: 4 }}>Redirecționare către Finanțe...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 60px', background: 'var(--ivory)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--beige)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={18} color={TAUPE} />
        </button>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Înregistrare</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 300, color: TAUPE, margin: 0 }}>Tratament nou</h1>
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>

        {/* 1. Clientă */}
        <Section number="1" title="Clientă">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Caută după nume sau telefon..."
              value={clientSearch}
              onChange={e => { setClientSearch(e.target.value); setSelectedClient(null); setShowClientDropdown(true); }}
              onFocus={() => setShowClientDropdown(true)}
              style={inputStyle}
            />
            {showClientDropdown && filteredClients.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--beige)', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                {filteredClients.map(c => (
                  <div key={c.id} onClick={() => selectClient(c)}
                    style={{ padding: '11px 16px', cursor: 'pointer', borderBottom: '1px solid var(--beige-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--ivory)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'white')}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{c.first_name} {c.last_name}</p>
                      {c.phone && <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{c.phone}</p>}
                    </div>
                    {selectedClient?.id === c.id && <Check size={14} color={GOLD} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedClient && (
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--gold-pale)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>✓ {selectedClient.first_name} {selectedClient.last_name}</span>
              <button onClick={() => { setSelectedClient(null); setClientSearch(''); }} style={{ fontSize: 11, color: TAUPE_LIGHT, background: 'none', border: 'none', cursor: 'pointer' }}>Schimbă</button>
            </div>
          )}
        </Section>

        {/* 2. Serviciu */}
        <Section number="2" title="Serviciu">
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TAUPE_LIGHT, marginBottom: 6 }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {services.filter(s => s.category_name === cat).map(s => (
                  <div key={s.id} onClick={() => selectService(s)}
                    style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${selectedService?.id === s.id ? GOLD : 'var(--beige)'}`, background: selectedService?.id === s.id ? 'var(--gold-pale)' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: selectedService?.id === s.id ? 600 : 400, color: TAUPE }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: TAUPE_LIGHT }}>{s.duration_minutes} min</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: selectedService?.id === s.id ? GOLD : TAUPE, fontFamily: 'var(--font-cormorant)' }}>{s.price.toLocaleString('ro-RO')} lei</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* 3. Dată și oră */}
        <Section number="3" title="Dată și oră">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Data *</label>
              <input type="date" value={treatmentDate} onChange={e => setTreatmentDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ora (opțional)</label>
              <input type="time" value={treatmentTime} onChange={e => setTreatmentTime(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </Section>

        {/* 4. Preț și plată */}
        <Section number="4" title="Preț și modalitate de plată">
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Preț final (lei) *</label>
            <div style={{ position: 'relative' }}>
              <input type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)}
                placeholder={selectedService ? String(selectedService.price) : 'Selectează serviciul mai întâi'}
                style={{ ...inputStyle, paddingRight: 50 }} />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: TAUPE_LIGHT }}>lei</span>
            </div>
            {selectedService && parseFloat(finalPrice) < selectedService.price && parseFloat(finalPrice) > 0 && (
              <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
                ⚠ Discount aplicat: -{(selectedService.price - parseFloat(finalPrice)).toLocaleString('ro-RO')} lei față de prețul standard
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Modalitate plată</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PAYMENT_METHODS.map(pm => (
                <button key={pm} onClick={() => setPaymentMethod(pm)}
                  style={{ padding: '10px 0', borderRadius: 8, border: `1px solid ${paymentMethod === pm ? GOLD : 'var(--beige)'}`, background: paymentMethod === pm ? 'var(--gold-pale)' : 'white', color: paymentMethod === pm ? TAUPE : TAUPE_LIGHT, fontSize: 11, fontWeight: paymentMethod === pm ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {pm}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* 5. Notițe */}
        <Section number="5" title="Notițe (opțional)">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Observații despre tratament, reacții, protocol aplicat..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </Section>

        {/* Sumar */}
        {selectedClient && selectedService && finalPrice && (
          <div style={{ background: TAUPE, borderRadius: 14, padding: '16px 20px', marginBottom: 20, color: 'white' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Sumar tratament</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Clientă</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedClient.first_name} {selectedClient.last_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Serviciu</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedService.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Data</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{new Date(treatmentDate).toLocaleDateString('ro-RO')}</span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Total încasat</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-cormorant)' }}>{parseFloat(finalPrice).toLocaleString('ro-RO')} lei</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
          </div>
        )}

        <button onClick={saveTreatment} disabled={saving || !selectedClient || !selectedService || !finalPrice || !treatmentDate}
          style={{ width: '100%', padding: '16px', border: 'none', borderRadius: 12, background: (!selectedClient || !selectedService || !finalPrice || !treatmentDate || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 15, fontWeight: 600, cursor: (!selectedClient || !selectedService || !finalPrice || !treatmentDate || saving) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-cormorant)', letterSpacing: '0.05em' }}>
          {saving ? 'Se salvează...' : '✓ Salvează tratamentul'}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--beige)',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--taupe)',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--taupe-light)',
  display: 'block',
  marginBottom: 6,
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: '18px 18px 20px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{number}</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--taupe)' }}>{title}</p>
      </div>
      {children}
    </div>
  );
}
