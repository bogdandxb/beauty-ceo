'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Trash2, Check, Upload, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  unit: string;
  current_stock: number;
  cost_per_package: number | null;
}

interface InvoiceItem {
  product_id: string;
  quantity: string;
  unit_price: string;
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  supplier: string;
  invoice_date: string;
  total_amount: number | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  purchase_invoice_items: { quantity: number; product_id: string; products: { name: string } }[];
}

const SUPPLIERS = ['Smart Derma', 'Geneceutica', 'Altul'];

export default function FacturiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [supplier, setSupplier] = useState('Smart Derma');
  const [customSupplier, setCustomSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ product_id: '', quantity: '', unit_price: '' }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: prods }, { data: invs }] = await Promise.all([
      sb().from('products').select('id, name, brand, category, unit, current_stock, cost_per_package').eq('is_active', true).order('name'),
      sb().from('purchase_invoices').select('*, purchase_invoice_items(quantity, product_id, products(name))').order('invoice_date', { ascending: false }).limit(50),
    ]);
    setProducts((prods as Product[]) || []);
    setInvoices((invs as Invoice[]) || []);
    setLoading(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function addItem() {
    setItems(prev => [...prev, { product_id: '', quantity: '', unit_price: '' }]);
    setSearchTerms(prev => [...prev, '']);
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
    setSearchTerms(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof InvoiceItem, value: string) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function selectProduct(i: number, product: Product) {
    setItems(prev => prev.map((item, idx) => idx === i ? {
      ...item,
      product_id: product.id,
      unit_price: product.cost_per_package ? String(product.cost_per_package) : item.unit_price,
    } : item));
    setSearchTerms(prev => prev.map((t, idx) => idx === i ? product.name : t));
    setOpenDropdown(null);
  }

  function getFilteredProducts(term: string) {
    if (!term) return products.slice(0, 20);
    const t = term.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(t) || (p.brand || '').toLowerCase().includes(t)).slice(0, 20);
  }

  function calcTotal() {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
  }

  async function save() {
    const validItems = items.filter(it => it.product_id && it.quantity);
    if (!validItems.length) return;
    setSaving(true);

    let imageUrl: string | null = null;

    // Upload imagine dacă există
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `facturi/${Date.now()}.${ext}`;
      const { data: uploadData } = await sb().storage.from('invoices').upload(path, imageFile, { upsert: true });
      if (uploadData) {
        const { data: urlData } = sb().storage.from('invoices').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const finalSupplier = supplier === 'Altul' ? customSupplier : supplier;
    const total = calcTotal();

    // Inserează factura
    const { data: inv } = await sb().from('purchase_invoices').insert({
      invoice_number: invoiceNumber.trim() || null,
      supplier: finalSupplier,
      invoice_date: invoiceDate,
      total_amount: total || null,
      image_url: imageUrl,
      notes: notes.trim() || null,
    }).select('id').single();

    if (!inv) { setSaving(false); return; }

    // Inserează liniile
    const invoiceItems = validItems.map(it => ({
      invoice_id: inv.id,
      product_id: it.product_id,
      quantity: parseFloat(it.quantity),
      unit_price: parseFloat(it.unit_price) || null,
      total_price: (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0) || null,
    }));
    await sb().from('purchase_invoice_items').insert(invoiceItems);

    // Actualizează stocul pentru fiecare produs
    for (const it of validItems) {
      await sb().rpc('adjust_stock', {
        p_product_id: it.product_id,
        p_movement_type: 'purchase',
        p_quantity: parseFloat(it.quantity),
        p_cost: parseFloat(it.unit_price) || null,
        p_notes: `Factura ${invoiceNumber || finalSupplier} / ${invoiceDate}`,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      resetForm();
      loadAll();
    }, 1000);
  }

  function resetForm() {
    setSupplier('Smart Derma');
    setCustomSupplier('');
    setInvoiceNumber('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setItems([{ product_id: '', quantity: '', unit_price: '' }]);
    setSearchTerms(['']);
    setImageFile(null);
    setImagePreview(null);
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Inventar</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Facturi Achiziție</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{invoices.length} facturi înregistrate</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/inventory" style={{ padding: '10px 16px', border: '1px solid var(--beige)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: TAUPE, textDecoration: 'none' }}>
            ← Inventar
          </Link>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Factură nouă
          </button>
        </div>
      </div>

      {/* Form factură nouă */}
      {showForm && (
        <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>Factură nouă</h2>

          {/* Info factură */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Furnizor</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none' }}>
                {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {supplier === 'Altul' && (
                <input value={customSupplier} onChange={e => setCustomSupplier(e.target.value)}
                  placeholder="Nume furnizor"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', marginTop: 8, boxSizing: 'border-box' as const }} />
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nr. factură</label>
              <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="ex: FA-2024-001"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Data facturii</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
          </div>

          {/* Upload poză */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Poză factură (opțional)</label>
            <div onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--beige)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', background: imagePreview ? 'transparent' : '#fafafa' }}>
              {imagePreview ? (
                <img src={imagePreview} alt="factură" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
              ) : (
                <div style={{ color: TAUPE_LIGHT }}>
                  <Upload size={28} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Click pentru a încărca poza facturii</p>
                  <p style={{ fontSize: 11, margin: '4px 0 0' }}>JPG, PNG, PDF</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleImageChange} style={{ display: 'none' }} />
            {imagePreview && (
              <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                style={{ marginTop: 8, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                Șterge poza
              </button>
            )}
          </div>

          {/* Produse din factură */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Produse din factură</label>

            {/* Header coloane */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 32px', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: TAUPE_LIGHT, fontWeight: 600 }}>PRODUS</span>
              <span style={{ fontSize: 11, color: TAUPE_LIGHT, fontWeight: 600 }}>CANTITATE</span>
              <span style={{ fontSize: 11, color: TAUPE_LIGHT, fontWeight: 600 }}>PREȚ/BUC (lei)</span>
              <span />
            </div>

            {items.map((item, i) => {
              const selectedProduct = products.find(p => p.id === item.product_id);
              const filtered = getFilteredProducts(searchTerms[i]);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 32px', gap: 8, marginBottom: 8, position: 'relative' }}>
                  {/* Search produs */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--beige)', borderRadius: 8, overflow: 'hidden' }}>
                      <input
                        value={searchTerms[i]}
                        onChange={e => {
                          setSearchTerms(prev => prev.map((t, idx) => idx === i ? e.target.value : t));
                          if (!e.target.value) updateItem(i, 'product_id', '');
                          setOpenDropdown(i);
                        }}
                        onFocus={() => setOpenDropdown(i)}
                        placeholder="Caută produs..."
                        style={{ flex: 1, padding: '10px 12px', border: 'none', fontSize: 13, color: TAUPE, outline: 'none' }}
                      />
                      <ChevronDown size={14} style={{ marginRight: 10, color: TAUPE_LIGHT, flexShrink: 0 }} />
                    </div>
                    {openDropdown === i && filtered.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--beige)', borderRadius: 8, zIndex: 100, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                        {filtered.map(p => (
                          <div key={p.id} onMouseDown={() => selectProduct(i, p)}
                            style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--beige)', fontSize: 13 }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                            <div style={{ fontWeight: 500, color: TAUPE }}>{p.name}</div>
                            {p.brand && <div style={{ fontSize: 11, color: TAUPE_LIGHT }}>{p.brand} · stoc curent: {p.current_stock} {p.unit}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cantitate */}
                  <input type="number" min="0" step="0.01"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder={selectedProduct?.unit || 'buc'}
                    style={{ padding: '10px 12px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', textAlign: 'center' }} />

                  {/* Preț */}
                  <input type="number" min="0" step="0.01"
                    value={item.unit_price}
                    onChange={e => updateItem(i, 'unit_price', e.target.value)}
                    placeholder="0.00"
                    style={{ padding: '10px 12px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', textAlign: 'right' }} />

                  {/* Șterge rând */}
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            <button onClick={addItem}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px dashed var(--beige)', borderRadius: 8, background: 'none', color: TAUPE_LIGHT, fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
              <Plus size={13} /> Adaugă produs
            </button>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Note (opțional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Observații despre această factură..."
              rows={2}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }} />
          </div>

          {/* Total + Butoane */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--beige)', paddingTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TAUPE }}>
              Total: <span style={{ color: GOLD }}>{calcTotal().toFixed(2)} lei</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowForm(false); resetForm(); }}
                style={{ padding: '10px 20px', border: '1px solid var(--beige)', borderRadius: 10, background: 'none', fontSize: 13, color: TAUPE, cursor: 'pointer' }}>
                Anulează
              </button>
              <button onClick={save} disabled={saving || saved}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: saved ? '#22c55e' : GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : 'Salvează și actualizează stoc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista facturi */}
      {loading ? (
        <p style={{ color: TAUPE_LIGHT, textAlign: 'center', padding: 40 }}>Se încarcă...</p>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: TAUPE_LIGHT }}>
          <p style={{ fontSize: 15 }}>Nicio factură înregistrată încă.</p>
          <p style={{ fontSize: 13 }}>Apasă "Factură nouă" pentru a înregistra prima achiziție.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Poza factură thumbnail */}
              {inv.image_url && (
                <a href={inv.image_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                  <img src={inv.image_url} alt="factură" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--beige)' }} />
                </a>
              )}
              {!inv.image_url && (
                <div style={{ width: 64, height: 64, background: 'var(--beige)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 24 }}>🧾</span>
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: TAUPE, margin: 0, fontSize: 14 }}>
                      {inv.supplier} {inv.invoice_number && <span style={{ color: TAUPE_LIGHT, fontWeight: 400 }}>· {inv.invoice_number}</span>}
                    </p>
                    <p style={{ fontSize: 12, color: TAUPE_LIGHT, margin: '2px 0 8px' }}>
                      {new Date(inv.invoice_date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {inv.total_amount && (
                    <p style={{ fontWeight: 700, color: GOLD, margin: 0, fontSize: 15 }}>{inv.total_amount.toFixed(2)} lei</p>
                  )}
                </div>

                {/* Produse din factură */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {inv.purchase_invoice_items?.map((it, idx) => (
                    <span key={idx} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--beige)', borderRadius: 20, color: TAUPE }}>
                      {it.products?.name} × {it.quantity}
                    </span>
                  ))}
                </div>

                {inv.notes && <p style={{ fontSize: 12, color: TAUPE_LIGHT, margin: '8px 0 0', fontStyle: 'italic' }}>{inv.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
