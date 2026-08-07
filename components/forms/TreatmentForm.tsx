'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const schema = z.object({
  client_id: z.string().min(1, 'Selectează o clientă'),
  service_id: z.string().min(1, 'Selectează un serviciu'),
  final_price: z.coerce.number().positive('Prețul trebuie să fie pozitiv'),
  discount_type: z.enum(['percent', 'fixed', '']).optional(),
  discount_value: z.coerce.number().min(0).optional(),
  discount_reason: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'transfer', 'pachet']).default('cash'),
  treatment_date: z.string().min(1, 'Selectează data'),
  treatment_time: z.string().optional(),
  technician_notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category?: { name: string };
}

interface TreatmentFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  clients?: Client[];
  services?: Service[];
}

const STEPS = ['Clientă', 'Serviciu', 'Plată', 'Detalii'];

export default function TreatmentForm({
  onClose,
  onSuccess,
  clients = [],
  services = [],
}: TreatmentFormProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      treatment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    },
  });

  const watchClientId = watch('client_id');
  const watchFinalPrice = watch('final_price');

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Eroare la salvare');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 0) return !!watchClientId;
    if (step === 1) return !!selectedService;
    if (step === 2) return !!watchFinalPrice;
    return true;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(74,64,58,0.5)' }}
    >
      <div
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--ivory)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-medium"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--taupe)',
            }}
          >
            Adaugă Tratament
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={18} style={{ color: 'var(--taupe-light)' }} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={{
                    background:
                      i < step
                        ? 'var(--gold)'
                        : i === step
                        ? 'var(--taupe)'
                        : 'var(--beige)',
                    color:
                      i <= step ? 'white' : 'var(--taupe-light)',
                  }}
                >
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className="text-[10px] font-medium hidden sm:block"
                  style={{
                    color:
                      i === step ? 'var(--taupe)' : 'var(--taupe-light)',
                  }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mb-4"
                  style={{
                    background: i < step ? 'var(--gold)' : 'var(--beige)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 0 — Clientă */}
          {step === 0 && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Caută clientă (nume sau telefon)..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: 'white',
                  border: '1px solid var(--beige)',
                  color: 'var(--taupe)',
                }}
              />
              {clients.length === 0 && (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Nu există clientele în baza de date.
                  <br />
                  <span className="text-xs">Adaugă întâi o clientă.</span>
                </p>
              )}
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setValue('client_id', c.id);
                    }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background:
                        watchClientId === c.id ? 'var(--gold-pale)' : 'white',
                      border:
                        watchClientId === c.id
                          ? '1px solid var(--gold)'
                          : '1px solid var(--beige)',
                      color: 'var(--taupe)',
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {c.first_name} {c.last_name}
                      </p>
                      {c.phone && (
                        <p
                          className="text-xs"
                          style={{ color: 'var(--taupe-light)' }}
                        >
                          {c.phone}
                        </p>
                      )}
                    </div>
                    {watchClientId === c.id && (
                      <Check size={14} style={{ color: 'var(--gold)' }} />
                    )}
                  </button>
                ))}
              </div>
              {errors.client_id && (
                <p className="text-xs text-red-400">{errors.client_id.message}</p>
              )}
            </div>
          )}

          {/* STEP 1 — Serviciu */}
          {step === 1 && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {services.length === 0 && (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Nu există servicii configurate.
                </p>
              )}
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(s);
                    setValue('service_id', s.id);
                    setValue('final_price', s.price);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background:
                      selectedService?.id === s.id ? 'var(--gold-pale)' : 'white',
                    border:
                      selectedService?.id === s.id
                        ? '1px solid var(--gold)'
                        : '1px solid var(--beige)',
                    color: 'var(--taupe)',
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--taupe-light)' }}
                    >
                      {s.duration_minutes} min
                      {s.category ? ` · ${s.category.name}` : ''}
                    </p>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--gold)' }}
                  >
                    {s.price} lei
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — Plată */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Preț final (lei)
                </label>
                <input
                  type="number"
                  {...register('final_price')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: 'white',
                    border: '1px solid var(--beige)',
                    color: 'var(--taupe)',
                  }}
                />
                {errors.final_price && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.final_price.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Metodă de plată
                </label>
                <select
                  {...register('payment_method')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                  style={{
                    background: 'white',
                    border: '1px solid var(--beige)',
                    color: 'var(--taupe)',
                  }}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer bancar</option>
                  <option value="pachet">Pachet prepaid</option>
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Discount (opțional)
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('discount_type')}
                    className="px-3 py-3 rounded-xl text-sm outline-none appearance-none w-32"
                    style={{
                      background: 'white',
                      border: '1px solid var(--beige)',
                      color: 'var(--taupe)',
                    }}
                  >
                    <option value="">Fără</option>
                    <option value="percent">%</option>
                    <option value="fixed">lei</option>
                  </select>
                  <input
                    type="number"
                    {...register('discount_value')}
                    placeholder="0"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: 'white',
                      border: '1px solid var(--beige)',
                      color: 'var(--taupe)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Detalii */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Data tratamentului
                </label>
                <input
                  type="date"
                  {...register('treatment_date')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: 'white',
                    border: '1px solid var(--beige)',
                    color: 'var(--taupe)',
                  }}
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Ora (opțional)
                </label>
                <input
                  type="time"
                  {...register('treatment_time')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: 'white',
                    border: '1px solid var(--beige)',
                    color: 'var(--taupe)',
                  }}
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--taupe-light)' }}
                >
                  Note (opțional)
                </label>
                <textarea
                  {...register('technician_notes')}
                  rows={3}
                  placeholder="Note despre tratament, reacții, observații..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: 'white',
                    border: '1px solid var(--beige)',
                    color: 'var(--taupe)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'var(--beige)',
                  color: 'var(--taupe)',
                }}
              >
                <ChevronLeft size={16} />
                Înapoi
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canGoNext() && setStep(step + 1)}
                disabled={!canGoNext()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{
                  background: 'var(--taupe)',
                  color: 'white',
                }}
              >
                Continuă
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{
                  background: 'var(--gold)',
                  color: 'white',
                }}
              >
                {loading ? 'Se salvează...' : 'Salvează Tratamentul'}
                {!loading && <Check size={16} />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
