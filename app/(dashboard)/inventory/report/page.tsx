'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Check, Printer, ChevronLeft, ChevronRight, Save, Package } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

const MONTHS_RO = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

interface Product {
  id: string; name: string; brand: string | null; unit: string;
  current_stock: number; cost_per_unit: number | null; category: string | null;
}

interface SnapshotRow {
  id: string;
  product_id: string;
  snapshot_year: number;
  snapshot_month: number;
  stock_start: number;
  stock_end: number;
  qty_purchased: number;
  qty_used: number;
  qty_wasted: number;
  cost_purchased: number;
  cost_used: number;
  product_name_snapshot: string;
  brand_snapshot: string | null;
  unit_snapshot: string;
  cost_per_unit_snapshot: number | null;
  notes: string | null;
}

interface RowState {
  stock_start: string;
  stock_end: string;
  qty_purchased: string;
  qty_used: string;
  qty_wasted: string;
  cost_purchased: string;
  notes: string;
  saved: boolean;
  saving: boolean;
  existingId: string | null;
}

export default function InventoryReportPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [products, setProducts] = useState<Product[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [saveAll, setSaveAll] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [historyMode, setHistoryMode] = useState(false);
  const [historySnapshots, setHistorySnapshots] = useState<(SnapshotRow & { months_available: { year: number; month: number }[] })[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: snaps }] = await Promise.all([
      sb().from('products').select('id, name, brand, unit, current_stock, cost_per_unit, category').eq('is_active', true).eq('product_type', 'professional').order('category').order('name'),
      sb().from('inventory_monthly_snapshots').select('*').eq('snapshot_year', year).eq('snapshot_month', month),
    ]);
    const prodList = (prods as Product[]) || [];
    const snapList = (snaps as SnapshotRow[]) || [];
    setProducts(prodList);
    setSnapshots(snapList);

    const newRows: Record<string, RowState> = {};
    prodList.forEach(p => {
      const snap = snapList.find(s => s.product_id === p.id);
      if (snap) {
        newRows[p.id] = {
          stock_start: String(snap.stock_start),
          stock_end: String(snap.stock_end),
          qty_purchased: String(snap.qty_purchased),
          qty_used: String(snap.qty_used),
          qty_wasted: String(snap.qty_wasted),
          cost_purchased: String(snap.cost_purchased),
          notes: snap.notes || '',
          saved: true, saving: false, existingId: snap.id,
        };
      } else {
        newRows[p.id] = {
          stock_start: '', stock_end: String(p.current_stock),
          qty_purchased: '0', qty_used: '0', qty_wasted: '0',
          cost_purchased: '0', notes: '',
          saved: false, saving: false, existingId: null,
        };
      }
    });
    setRows(newRows);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  function updateRow(productId: string, field: keyof RowState, value: string) {
    setRows(r => ({ ...r, [productId]: { ...r[productId], [field]: value, saved: false } }));
  }

  async function saveRow(p: Product) {
    const r = rows[p.id];
    if (!r) return;
    setRows(prev => ({ ...prev, [p.id]: { ...prev[p.id], saving: true } }));

    const costPerUnit = p.cost_per_unit || 0;
    const qtyUsed = parseFloat(r.qty_used) || 0;
    const payload = {
      product_id: p.id,
      snapshot_year: year,
      snapshot_month: month,
      stock_start: parseFloat(r.stock_start) || 0,
      stock_end: parseFloat(r.stock_end) || 0,
      qty_purchased: parseFloat(r.qty_purchased) || 0,
      qty_used: qtyUsed,
      qty_wasted: parseFloat(r.qty_wasted) || 0,
      cost_purchased: parseFloat(r.cost_purchased) || 0,
      cost_used: qtyUsed * costPerUnit,
      product_name_snapshot: p.name,
      brand_snapshot: p.brand || null,
      unit_snapshot: p.unit,
      cost_per_unit_snapshot: costPerUnit,
      notes: r.notes.trim() || null,
    };

    if (r.existingId) {
      await sb().from('inventory_monthly_snapshots').update(payload).eq('id', r.existingId);
    } else {
      const { data } = await sb().from('inventory_monthly_snapshots').insert(payload).select('id').single();
      const newId = (data as { id: string } | null)?.id || null;
      setRows(prev => ({ ...prev, [p.id]: { ...prev[p.id], existingId: newId } }));
    }
    setRows(prev => ({ ...prev, [p.id]: { ...prev[p.id], saving: false, saved: true } }));
  }

  async function saveAllRows() {
    setSavingAll(true);
    for (const p of products) {
      await saveRow(p);
    }
    setSavingAll(false);
    setSaveAll(true);
    setTimeout(() => setSaveAll(false), 2000);
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  // Totaluri
  const totalCostUsed = products.reduce((s, p) => {
    const r = rows[p.id];
    if (!r) return s;
    return s + (parseFloat(r.qty_used) || 0) * (p.cost_per_unit || 0);
  }, 0);
  const totalCostPurchased = products.reduce((s, p) => s + (parseFloat(rows[p.id]?.cost_purchased) || 0), 0);
  const totalWasted = products.reduce((s, p) => {
    const r = rows[p.id];
    if (!r) return s;
    return s + (parseFloat(r.qty_wasted) || 0) * (p.cost_per_unit || 0);
  }, 0);
  const savedCount = Object.values(rows).filter(r => r.saved).length;

  const categories = [...new Set(products.map(p => p.category || 'Altele'))];

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 1100, margin: '0 auto' }} id="print-area">
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Inventar Profesional</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Control Lunar Produse</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{savedCount}/{products.length} produse completate · {MONTHS_RO[month - 1]} {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setHistoryMode(!historyMode)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: historyMode ? TAUPE : 'white', color: historyMode ? 'white' : TAUPE, border: `1px solid ${historyMode ? TAUPE : 'var(--beige)'}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Package size={14} /> {historyMode ? 'Formular' : 'Istoric'}
          </button>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'white', color: TAUPE, border: '1px solid var(--beige)', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Printer size={14} /> Print
          </button>
          <button onClick={saveAllRows} disabled={savingAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: saveAll ? '#22c55e' : GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {saveAll ? <><Check size={14} /> Salvat!</> : savingAll ? 'Se salvează...' : <><Save size={14} /> Salvează tot</>}
          </button>
        </div>
      </div>

      {/* Selector perioadă */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: '12px 16px', width: 'fit-content' }}>
        <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={15} color={TAUPE} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: TAUPE, minWidth: 160, textAlign: 'center' }}>{MONTHS_RO[month - 1]} {year}</span>
        <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronRight size={15} color={TAUPE} />
        </button>
      </div>

      {/* KPI-uri sumar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Cost produse folosite', val: `${totalCostUsed.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`, color: TAUPE },
          { label: 'Achiziții luna aceasta', val: `${totalCostPurchased.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`, color: '#3b82f6' },
          { label: 'Pierderi / risipă', val: `${totalWasted.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`, color: totalWasted > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Produse completate', val: `${savedCount}/${products.length}`, color: savedCount === products.length ? '#22c55e' : GOLD },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-cormorant)' }}>{val}</p>
          </div>
        ))}
      </div>

      {historyMode ? (
        <HistoryView year={year} month={month} />
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT }}>Se încarcă...</div>
      ) : products.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Niciun produs profesional în inventar.</p>
          <p style={{ fontSize: 12, color: TAUPE_LIGHT, marginTop: 6 }}>Adaugă produse din pagina Inventar → Stoc Cabină.</p>
        </div>
      ) : (
        <div>
          {categories.map(cat => {
            const catProds = products.filter(p => (p.category || 'Altele') === cat);
            return (
              <div key={cat} style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TAUPE_LIGHT, marginBottom: 10, paddingLeft: 4 }}>{cat}</p>

                {/* Header tabel */}
                <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 80px 80px 80px 80px 90px 90px 1fr 36px', gap: 6, padding: '8px 16px', background: 'var(--ivory)', borderBottom: '1px solid var(--beige)' }}>
                    {['Produs', 'Stoc inițial', 'Cumpărat', 'Folosit', 'Risipit', 'Cost folosit', 'Stoc final', 'Obs.', ''].map(h => (
                      <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
                    ))}
                  </div>

                  {catProds.map((p, i) => {
                    const r = rows[p.id];
                    if (!r) return null;
                    const costUsed = (parseFloat(r.qty_used) || 0) * (p.cost_per_unit || 0);
                    const isLast = i === catProds.length - 1;
                    return (
                      <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 80px 80px 80px 80px 90px 90px 1fr 36px', gap: 6, padding: '10px 16px', borderBottom: isLast ? 'none' : '1px solid var(--beige-light)', alignItems: 'center', background: r.saved ? 'white' : 'white' }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: TAUPE }}>{p.name}</p>
                          <p style={{ fontSize: 10, color: TAUPE_LIGHT }}>{p.brand || '—'} · {p.unit} · {p.cost_per_unit ? `${p.cost_per_unit.toFixed(2)} lei/${p.unit}` : 'cost necunoscut'}</p>
                        </div>
                        {(['stock_start', 'qty_purchased', 'qty_used', 'qty_wasted'] as const).map(field => (
                          <input key={field} type="number" value={r[field]}
                            onChange={e => updateRow(p.id, field, e.target.value)}
                            placeholder="0"
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} />
                        ))}
                        <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: costUsed > 0 ? '#ef4444' : TAUPE_LIGHT, fontFamily: 'var(--font-cormorant)' }}>
                          {costUsed > 0 ? `-${costUsed.toLocaleString('ro-RO', { maximumFractionDigits: 2 })} lei` : '—'}
                        </div>
                        <input type="number" value={r.stock_end}
                          onChange={e => updateRow(p.id, 'stock_end', e.target.value)}
                          placeholder={String(p.current_stock)}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 12, color: TAUPE, outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} />
                        <input value={r.notes}
                          onChange={e => updateRow(p.id, 'notes', e.target.value)}
                          placeholder="obs..."
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--beige)', borderRadius: 6, fontSize: 11, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
                        <button onClick={() => saveRow(p)} title="Salvează rândul"
                          style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${r.saved ? '#bbf7d0' : 'var(--beige)'}`, background: r.saved ? '#F0FDF4' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {r.saving ? <span style={{ fontSize: 10 }}>...</span> : <Check size={13} color={r.saved ? '#16a34a' : TAUPE_LIGHT} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Sumar final */}
          <div style={{ background: TAUPE, borderRadius: 14, padding: '20px 24px', color: 'white', marginTop: 8 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Sumar {MONTHS_RO[month - 1]} {year}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                ['Cost total produse folosite', `${totalCostUsed.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`],
                ['Achiziții noi', `${totalCostPurchased.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`],
                ['Pierderi / Risipă', `${totalWasted.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`],
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'var(--font-cormorant)' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
          input { border: none !important; background: transparent !important; }
        }
      `}</style>
    </div>
  );
}

function HistoryView({ year, month }: { year: number; month: number }) {
  const [history, setHistory] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Ultimele 6 luni de snapshot-uri
      const { data } = await sb()
        .from('inventory_monthly_snapshots')
        .select('*')
        .order('snapshot_year', { ascending: false })
        .order('snapshot_month', { ascending: false })
        .limit(200);
      setHistory((data as SnapshotRow[]) || []);
      setLoading(false);
    }
    load();
  }, [year, month]);

  const periods = [...new Set(history.map(s => `${s.snapshot_year}-${String(s.snapshot_month).padStart(2, '0')}`))].sort().reverse().slice(0, 6);
  const productNames = [...new Set(history.map(s => s.product_name_snapshot))].sort();

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: TAUPE_LIGHT }}>Se încarcă istoricul...</div>;
  if (history.length === 0) return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 14, color: TAUPE_LIGHT }}>Niciun raport salvat încă.</p>
      <p style={{ fontSize: 12, color: TAUPE_LIGHT, marginTop: 6 }}>Completează și salvează primul raport lunar.</p>
    </div>
  );

  return (
    <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--ivory)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, borderBottom: '1px solid var(--beige)', whiteSpace: 'nowrap' }}>Produs</th>
              {periods.map(p => {
                const [y, m] = p.split('-');
                return (
                  <th key={p} colSpan={3} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, borderBottom: '1px solid var(--beige)', borderLeft: '1px solid var(--beige)', whiteSpace: 'nowrap' }}>
                    {MONTHS_RO[parseInt(m) - 1].slice(0, 3)} {y}
                  </th>
                );
              })}
            </tr>
            <tr style={{ background: 'var(--ivory)' }}>
              <th style={{ padding: '6px 16px', borderBottom: '2px solid var(--beige)' }} />
              {periods.map(p => (
                ['Folosit', 'Cumpărat', 'Risipit'].map(label => (
                  <th key={`${p}-${label}`} style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9, fontWeight: 600, color: TAUPE_LIGHT, borderBottom: '2px solid var(--beige)', borderLeft: label === 'Folosit' ? '1px solid var(--beige)' : 'none', whiteSpace: 'nowrap' }}>{label}</th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {productNames.map((name, i) => {
              const isEven = i % 2 === 0;
              return (
                <tr key={name} style={{ background: isEven ? 'white' : 'var(--ivory)' }}>
                  <td style={{ padding: '10px 16px', color: TAUPE, fontWeight: 600, borderBottom: '1px solid var(--beige-light)', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: 12 }}>{name}</p>
                    {history.find(s => s.product_name_snapshot === name)?.brand_snapshot && (
                      <p style={{ fontSize: 10, color: TAUPE_LIGHT }}>{history.find(s => s.product_name_snapshot === name)?.brand_snapshot}</p>
                    )}
                  </td>
                  {periods.map(p => {
                    const [y, m] = p.split('-');
                    const snap = history.find(s => s.product_name_snapshot === name && s.snapshot_year === parseInt(y) && s.snapshot_month === parseInt(m));
                    const unit = snap?.unit_snapshot || '';
                    return (
                      ['qty_used', 'qty_purchased', 'qty_wasted'].map((field, fi) => (
                        <td key={`${p}-${field}`} style={{ padding: '10px 8px', textAlign: 'right', color: snap ? (field === 'qty_wasted' && (snap[field as keyof SnapshotRow] as number) > 0 ? '#ef4444' : TAUPE) : TAUPE_LIGHT, borderBottom: '1px solid var(--beige-light)', borderLeft: fi === 0 ? '1px solid var(--beige)' : 'none', fontFamily: 'var(--font-cormorant)', fontWeight: snap ? 600 : 400, fontSize: 13 }}>
                          {snap ? `${snap[field as keyof SnapshotRow]} ${unit}` : '—'}
                        </td>
                      ))
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
