'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Edit2, Check, Repeat } from 'lucide-react';

const GOLD = 'var(--gold)';
const TAUPE = 'var(--taupe)';
const TAUPE_LIGHT = 'var(--taupe-light)';

function sb() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

const CATEGORIES = ['Chirie', 'Utilități', 'Contabilitate', 'Software', 'Salarii', 'Marketing', 'Produse', 'Consumabile', 'Service aparat', 'Training', 'Taxe', 'Aparatură', 'Altele'];
const EXPENSE_TYPES = [{ value: 'fixed', label: 'Fixă' }, { value: 'variable', label: 'Variabilă' }, { value: 'investment', label: 'Investiție' }];
const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'virement'];

interface Expense {
  id: string; name: string; category: string; expense_type: string;
  amount: number; expense_date: string; payment_method: string | null;
  vendor: string | null; invoice_number: string | null; is_tax_deductible: boolean;
  is_recurring: boolean; notes: string | null; is_demo: boolean;
}

const EMPTY_FORM = { name: '', category: 'Chirie', expense_type: 'fixed', amount: '', expense_date: new Date().toISOString().slice(0, 10), payment_method: 'transfer', vendor: '', invoice_number: '', is_tax_deductible: true, is_recurring: false, notes: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => { load(filterMonth, filterYear); }, [filterMonth, filterYear]);

  async function load(month: number, year: number) {
    setLoading(true);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const { data } = await sb().from('expenses').select('*').gte('expense_date', start).lte('expense_date', end).order('expense_date', { ascending: false });
    setExpenses((data as Expense[]) || []);
    setLoading(false);
  }

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setSaved(false); }
  function openEdit(e: Expense) {
    setForm({ name: e.name, category: e.category, expense_type: e.expense_type, amount: String(e.amount), expense_date: e.expense_date, payment_method: e.payment_method || 'transfer', vendor: e.vendor || '', invoice_number: e.invoice_number || '', is_tax_deductible: e.is_tax_deductible, is_recurring: e.is_recurring, notes: e.notes || '' });
    setEditId(e.id); setShowForm(true); setSaved(false);
  }

  async function saveExpense() {
    if (!form.name || !form.amount || !form.expense_date) return;
    setSaving(true);
    const payload = { name: form.name.trim(), category: form.category, expense_type: form.expense_type, amount: parseFloat(form.amount), expense_date: form.expense_date, payment_method: form.payment_method, vendor: form.vendor.trim() || null, invoice_number: form.invoice_number.trim() || null, is_tax_deductible: form.is_tax_deductible, is_recurring: form.is_recurring, notes: form.notes.trim() || null };
    if (editId) {
      await sb().from('expenses').update(payload).eq('id', editId);
    } else {
      await sb().from('expenses').insert({ ...payload, is_demo: false });
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); load(filterMonth, filterYear); }, 800);
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byType = { fixed: expenses.filter(e => e.expense_type === 'fixed').reduce((s, e) => s + e.amount, 0), variable: expenses.filter(e => e.expense_type === 'variable').reduce((s, e) => s + e.amount, 0), investment: expenses.filter(e => e.expense_type === 'investment').reduce((s, e) => s + e.amount, 0) };
  const MONTH_NAMES = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = new Date().getFullYear();

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD }}>Finanțe</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: TAUPE, margin: '2px 0' }}>Cheltuieli</h1>
          <p style={{ fontSize: 13, color: TAUPE_LIGHT }}>{MONTH_NAMES[filterMonth - 1]} {filterYear} · {expenses.length} înregistrări</p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Cheltuială nouă
        </button>
      </div>

      {/* Filtre perioadă */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {MONTH_NAMES.map((m, i) => (
          <button key={i} onClick={() => setFilterMonth(i + 1)}
            style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${filterMonth === i + 1 ? GOLD : 'var(--beige)'}`, background: filterMonth === i + 1 ? 'var(--gold-pale)' : 'white', color: filterMonth === i + 1 ? TAUPE : TAUPE_LIGHT, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {m}
          </button>
        ))}
        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, border: '1px solid var(--beige)', background: 'white', color: TAUPE, outline: 'none', cursor: 'pointer' }}>
          {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI sumar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[['Total', total, TAUPE], ['Fixe', byType.fixed, '#3b82f6'], ['Variabile', byType.variable, '#f59e0b'], ['Investiții', byType.investment, GOLD]].map(([label, val, color]) => (
          <div key={String(label)} style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT, marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: String(color), fontFamily: 'var(--font-cormorant)' }}>{(val as number).toLocaleString('ro-RO')} lei</p>
          </div>
        ))}
      </div>

      {/* Lista cheltuieli */}
      <div style={{ background: 'white', border: '1px solid var(--beige)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 90px 80px 40px', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--beige-light)', background: 'var(--ivory)' }}>
          {['Cheltuială', 'Categorie', 'Data', 'Furnizor', 'Sumă', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TAUPE_LIGHT }}>{h}</span>
          ))}
        </div>
        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: TAUPE_LIGHT }}>Se încarcă...</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: TAUPE_LIGHT, marginBottom: 12 }}>Nicio cheltuială în {MONTH_NAMES[filterMonth - 1]} {filterYear}.</p>
            <button onClick={openAdd} style={{ padding: '10px 20px', background: GOLD, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Adaugă cheltuială</button>
          </div>
        ) : expenses.map((e, i) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 90px 80px 40px', gap: 8, padding: '12px 20px', borderBottom: i < expenses.length - 1 ? '1px solid var(--beige-light)' : 'none', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>{e.name}</p>
                {e.is_recurring && <Repeat size={11} color={TAUPE_LIGHT} />}
                {e.is_demo && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#FEF3C7', color: '#92400E' }}>DEMO</span>}
              </div>
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: e.expense_type === 'fixed' ? '#EFF6FF' : e.expense_type === 'investment' ? 'var(--gold-pale)' : '#FFFBEB', color: e.expense_type === 'fixed' ? '#3b82f6' : e.expense_type === 'investment' ? GOLD : '#f59e0b', fontWeight: 600 }}>
                {EXPENSE_TYPES.find(t => t.value === e.expense_type)?.label || e.expense_type}
              </span>
            </div>
            <span style={{ fontSize: 11, color: TAUPE_LIGHT }}>{e.category}</span>
            <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{new Date(e.expense_date).toLocaleDateString('ro-RO')}</span>
            <span style={{ fontSize: 12, color: TAUPE_LIGHT }}>{e.vendor || '—'}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-cormorant)' }}>-{e.amount.toLocaleString('ro-RO')} lei</span>
            <button onClick={() => openEdit(e)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--beige)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Edit2 size={12} color={TAUPE} />
            </button>
          </div>
        ))}
        {expenses.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '2px solid var(--beige)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TAUPE }}>Total {MONTH_NAMES[filterMonth - 1]} {filterYear}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-cormorant)' }}>-{total.toLocaleString('ro-RO')} lei</span>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,64,58,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 560, paddingBottom: 40, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 400, color: TAUPE, marginBottom: 20 }}>
              {editId ? 'Editează cheltuială' : 'Cheltuială nouă'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>DENUMIRE *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Chirie salon mai 2026"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>CATEGORIE</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, background: 'white', outline: 'none' }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>TIP COST</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {EXPENSE_TYPES.map(t => (
                    <button key={t.value} onClick={() => setForm(f => ({ ...f, expense_type: t.value }))}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 7, fontSize: 11, fontWeight: 600, border: `1px solid ${form.expense_type === t.value ? GOLD : 'var(--beige)'}`, background: form.expense_type === t.value ? 'var(--gold-pale)' : 'white', color: form.expense_type === t.value ? TAUPE : TAUPE_LIGHT, cursor: 'pointer' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>SUMĂ (lei) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="ex: 2500"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>DATA *</label>
                <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>MODALITATE PLATĂ</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm} onClick={() => setForm(f => ({ ...f, payment_method: pm }))}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 10, fontWeight: 600, border: `1px solid ${form.payment_method === pm ? GOLD : 'var(--beige)'}`, background: form.payment_method === pm ? 'var(--gold-pale)' : 'white', color: form.payment_method === pm ? TAUPE : TAUPE_LIGHT, cursor: 'pointer', textTransform: 'capitalize' }}>
                      {pm}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>FURNIZOR</label>
                <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="ex: Proprietar"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>NR. FACTURĂ / CHITANȚĂ</label>
                <input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="opțional"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: TAUPE_LIGHT, display: 'block', marginBottom: 4 }}>OBSERVAȚII</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="opțional..."
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--beige)', borderRadius: 8, fontSize: 13, color: TAUPE, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[['is_tax_deductible', 'Deductibilă fiscal'], ['is_recurring', 'Recurentă (se repetă)']].map(([field, label]) => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={(form as unknown as Record<string, boolean>)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: GOLD }} />
                  <span style={{ fontSize: 13, color: TAUPE }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--beige)', borderRadius: 10, background: 'white', fontSize: 13, color: TAUPE, cursor: 'pointer', fontWeight: 500 }}>Anulează</button>
              <button onClick={saveExpense} disabled={saving || !form.name || !form.amount || !form.expense_date}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: saved ? '#22c55e' : (!form.name || !form.amount || saving) ? 'var(--beige)' : GOLD, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saved ? <><Check size={14} /> Salvat!</> : saving ? 'Se salvează...' : editId ? 'Salvează modificările' : 'Adaugă cheltuiala'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
