'use client';

import { useState, useEffect } from 'react';
import { Scissors, TrendingUp, Clock, Star } from 'lucide-react';
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

type SortKey = 'revenue' | 'margin' | 'treatments' | 'revenuePerHour';

interface ServiceRow {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  target_margin_pct: number;
  service_categories: { name: string } | null;
  treatments: { final_price: number; cost_snapshot: number }[];
}

export default function ServicesPage() {
  const [sortBy, setSortBy] = useState<SortKey>('revenue');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceRow[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase()
      .from('services')
      .select(`id, name, price, duration_minutes, target_margin_pct,
        service_categories(name),
        treatments(final_price, cost_snapshot)`)
      .eq('is_active', true)
      .eq('treatments.status', 'completed');
    setServices(((data as unknown) as ServiceRow[]) || []);
    setLoading(false);
  }

  const enriched = services.map(s => {
    const txList = s.treatments || [];
    const revenue = txList.reduce((sum, t) => sum + t.final_price, 0);
    const totalCost = txList.reduce((sum, t) => sum + t.cost_snapshot, 0);
    const grossProfit = revenue - totalCost;
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const hoursWorked = (txList.length * s.duration_minutes) / 60;
    const revenuePerHour = hoursWorked > 0 ? revenue / hoursWorked : 0;
    const signal = margin >= 70 ? 'Profitabil' : margin >= 50 ? 'De analizat' : 'Slab';
    const signalColor = margin >= 70 ? '#22c55e' : margin >= 50 ? '#f59e0b' : '#ef4444';
    const signalBg = margin >= 70 ? '#F0FDF4' : margin >= 50 ? '#FFFBEB' : '#FEF2F2';
    const category = s.service_categories?.name || 'Altele';
    return { ...s, revenue, grossProfit, margin, hoursWorked, revenuePerHour, signal, signalColor, signalBg, category, treatments_count: txList.length };
  });

  const categories = [...new Set(enriched.map(s => s.category))];

  const sorted = [...enriched]
    .filter(s => !filterCat || s.category === filterCat)
    .sort((a, b) => {
      if (sortBy === 'margin') return b.margin - a.margin;
      if (sortBy === 'revenuePerHour') return b.revenuePerHour - a.revenuePerHour;
      if (sortBy === 'treatments') return b.treatments_count - a.treatments_count;
      return b.revenue - a.revenue;
    });

  const totalRevenue = enriched.reduce((s, x) => s + x.revenue, 0);
  const totalProfit = enriched.reduce((s, x) => s + x.grossProfit, 0);
  const avgMargin = enriched.length > 0 ? enriched.reduce((s, x) => s + x.margin, 0) / enriched.length : 0;
  const bestRPH = enriched.length > 0 ? Math.max(...enriched.map(s => s.revenuePerHour)) : 0;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Analiză</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Profitabilitate Servicii</h1>
        <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>Rankingul serviciilor după rentabilitate</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <KPICard label="Revenue Total Servicii" value={totalRevenue} isCurrency icon={TrendingUp} />
        <KPICard label="Profit Brut Total" value={totalProfit} isCurrency icon={Scissors} />
        <KPICard label="Marjă Medie" value={`${avgMargin.toFixed(1)}%`} icon={Star} />
        <KPICard label="Best Revenue/Oră" value={Math.round(bestRPH)} isCurrency icon={Clock} sub="cel mai bun serviciu" />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilterCat('')}
          style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid var(--beige)', background: !filterCat ? GOLD : 'white', color: !filterCat ? 'white' : TAUPE, cursor: 'pointer' }}>
          Toate
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid var(--beige)', background: filterCat === cat ? TAUPE : 'white', color: filterCat === cat ? 'white' : TAUPE, cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {([['revenue', 'Revenue'], ['margin', 'Marjă %'], ['revenuePerHour', 'Revenue/Oră'], ['treatments', 'Tratamente']] as [SortKey, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setSortBy(k)}
            style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, border: `1px solid ${sortBy === k ? GOLD : 'var(--beige)'}`, background: sortBy === k ? 'var(--gold-pale)' : 'white', color: sortBy === k ? TAUPE : TAUPE_LIGHT, cursor: 'pointer', fontWeight: sortBy === k ? 600 : 400 }}>
            Sortare: {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT, fontSize: 14 }}>Se încarcă...</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 80px 80px 90px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
            {['Serviciu', 'Revenue', 'Marjă', 'Rev/Oră', 'Tratam.', 'Status'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
            ))}
          </div>
          {sorted.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Niciun serviciu găsit.</p>
            </div>
          ) : sorted.map((s, i) => (
            <div key={s.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 80px 80px 90px', gap: 8, padding: '14px 20px', borderBottom: i < sorted.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{s.name}</p>
                <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 1 }}>{s.category} · {s.duration_minutes} min · {s.price} lei</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{s.revenue.toLocaleString('ro-RO')}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.signalColor }}>{s.margin.toFixed(0)}%</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: TAUPE }}>{Math.round(s.revenuePerHour)}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: TAUPE }}>{s.treatments_count}</span>
              <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.signalBg, color: s.signalColor, whiteSpace: 'nowrap' }}>{s.signal}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[['#22c55e', '#F0FDF4', 'Profitabil', 'Marjă ≥ 70%'], ['#f59e0b', '#FFFBEB', 'De analizat', 'Marjă 50–70%'], ['#ef4444', '#FEF2F2', 'Slab', 'Marjă < 50%']].map(([color, , label, desc]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: TAUPE_LIGHT }}><strong style={{ color: TAUPE }}>{label}</strong> — {desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
