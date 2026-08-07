'use client';

import { useState } from 'react';
import { Scissors, TrendingUp, Clock, Star } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

const DEMO_SERVICES = [
  { id: '1', name: 'Facial Hidratare', category: 'Facial', price: 300, duration: 75, cost: 45, treatments: 24, revenue: 7200, equipment: 'HydraFacial' },
  { id: '2', name: 'Microneedling Față', category: 'Facial', price: 500, duration: 90, cost: 85, treatments: 18, revenue: 9000, equipment: 'Dermapen' },
  { id: '3', name: 'Facial Anti-age', category: 'Facial', price: 400, duration: 90, cost: 70, treatments: 14, revenue: 5600, equipment: null },
  { id: '4', name: 'Epilare Axile', category: 'Epilare', price: 150, duration: 30, cost: 15, treatments: 32, revenue: 4800, equipment: 'Laser Diodă' },
  { id: '5', name: 'Epilare Picioare Integral', category: 'Epilare', price: 400, duration: 60, cost: 30, treatments: 12, revenue: 4800, equipment: 'Laser Diodă' },
  { id: '6', name: 'Epilare Bikini Complet', category: 'Epilare', price: 280, duration: 45, cost: 22, treatments: 20, revenue: 5600, equipment: 'Laser Diodă' },
  { id: '7', name: 'Remodelare Corporală', category: 'Corp', price: 350, duration: 60, cost: 40, treatments: 10, revenue: 3500, equipment: 'LipoShape' },
  { id: '8', name: 'Skin Analyzer', category: 'Analiză', price: 200, duration: 45, cost: 10, treatments: 8, revenue: 1600, equipment: 'Skin Analyzer' },
];

type SortKey = 'revenue' | 'margin' | 'treatments' | 'revenuePerHour';

export default function ServicesPage() {
  const [sortBy, setSortBy] = useState<SortKey>('revenue');
  const [filterCat, setFilterCat] = useState('');

  const categories = [...new Set(DEMO_SERVICES.map(s => s.category))];

  const enriched = DEMO_SERVICES.map(s => {
    const grossProfit = s.revenue - s.cost * s.treatments;
    const margin = s.revenue > 0 ? (grossProfit / s.revenue) * 100 : 0;
    const hoursWorked = (s.treatments * s.duration) / 60;
    const revenuePerHour = hoursWorked > 0 ? s.revenue / hoursWorked : 0;
    const signal = margin >= 70 ? 'Profitabil' : margin >= 50 ? 'De analizat' : 'Slab';
    const signalColor = margin >= 70 ? '#22c55e' : margin >= 50 ? '#f59e0b' : '#ef4444';
    const signalBg = margin >= 70 ? '#F0FDF4' : margin >= 50 ? '#FFFBEB' : '#FEF2F2';
    return { ...s, grossProfit, margin, hoursWorked, revenuePerHour, signal, signalColor, signalBg };
  });

  const sorted = [...enriched]
    .filter(s => !filterCat || s.category === filterCat)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const totalRevenue = enriched.reduce((s, x) => s + x.revenue, 0);
  const totalProfit = enriched.reduce((s, x) => s + x.grossProfit, 0);
  const avgMargin = enriched.reduce((s, x) => s + x.margin, 0) / enriched.length;
  const bestRevenuePerHour = Math.max(...enriched.map(s => s.revenuePerHour));

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
        <KPICard label="Best Revenue/Oră" value={Math.round(bestRevenuePerHour)} isCurrency icon={Clock} sub="cel mai bun serviciu" />
      </div>

      {/* Filtre + Sort */}
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

      {/* Tabel servicii */}
      <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 80px 80px 90px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
          {['Serviciu', 'Revenue', 'Marjă', 'Rev/Oră', 'Tratam.', 'Status'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
          ))}
        </div>
        {sorted.map((s, i) => (
          <div key={s.id}
            style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 80px 80px 90px', gap: 8, padding: '14px 20px', borderBottom: i < sorted.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{s.name}</p>
              <p style={{ fontSize: 11, color: TAUPE_LIGHT, marginTop: 1 }}>{s.category} · {s.duration} min · {s.price} lei</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{s.revenue.toLocaleString('ro-RO')}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: s.margin >= 70 ? '#22c55e' : s.margin >= 50 ? '#f59e0b' : '#ef4444' }}>{s.margin.toFixed(0)}%</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: TAUPE }}>{Math.round(s.revenuePerHour)}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: TAUPE }}>{s.treatments}</span>
            <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.signalBg, color: s.signalColor, whiteSpace: 'nowrap' }}>{s.signal}</span>
          </div>
        ))}
      </div>

      {/* Legendă */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[['#22c55e', '#F0FDF4', 'Profitabil', 'Marjă ≥ 70%'], ['#f59e0b', '#FFFBEB', 'De analizat', 'Marjă 50–70%'], ['#ef4444', '#FEF2F2', 'Slab', 'Marjă < 50%']].map(([color, bg, label, desc]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: TAUPE_LIGHT }}><strong style={{ color: TAUPE }}>{label}</strong> — {desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
