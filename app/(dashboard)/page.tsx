import { Suspense } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { DollarSign, Users, Scissors, Target, AlertTriangle, Plus } from 'lucide-react';
import KPICard from '@/components/kpi/KPICard';
import Link from 'next/link';

// ---- Mock data (se inlocuieste cu date din Supabase cand e conectat) ----
const MOCK_TODAY = {
  revenue: 0,
  treatments: 0,
  newClients: 0,
};

const MOCK_MONTH = {
  revenue: 0,
  profit: 0,
  treatments: 0,
  clients: 0,
  targetRevenue: 20000,
  targetProgress: 0,
};

const MOCK_ALERTS: string[] = [];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bună dimineața';
  if (h < 18) return 'Bună ziua';
  return 'Bună seara';
}

function TargetPacingBar({ progress }: { progress: number }) {
  const pct = Math.min(Math.max(progress, 0), 100);
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? 'var(--gold)' : '#f87171';
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--taupe-light)' }}>
          Target lunar
        </span>
        <span className="text-xs font-semibold" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--beige)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: ro });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-light"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--taupe)',
            }}
          >
            {getGreeting()}, Roxana
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--taupe-light)' }}>
            {todayFormatted}
          </p>
        </div>
        <Link
          href="/finance"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{
            background: 'var(--gold)',
            color: 'white',
          }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Adaugă Tratament</span>
          <span className="sm:hidden">+</span>
        </Link>
      </div>

      {/* AZI */}
      <section className="mb-8">
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'var(--gold)' }}
        >
          Astăzi
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <KPICard
            label="Venit"
            value={MOCK_TODAY.revenue}
            isCurrency
            icon={DollarSign}
            isEmpty={MOCK_TODAY.revenue === 0}
          />
          <KPICard
            label="Tratamente"
            value={MOCK_TODAY.treatments}
            icon={Scissors}
            isEmpty={MOCK_TODAY.treatments === 0}
          />
          <KPICard
            label="Clientă nouă"
            value={MOCK_TODAY.newClients}
            icon={Users}
            isEmpty={MOCK_TODAY.newClients === 0}
          />
        </div>
      </section>

      {/* LUNA ACEASTA */}
      <section className="mb-8">
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'var(--gold)' }}
        >
          Luna aceasta
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <KPICard
            label="Venit"
            value={MOCK_MONTH.revenue}
            isCurrency
            icon={DollarSign}
            isEmpty={MOCK_MONTH.revenue === 0}
          />
          <KPICard
            label="Profit"
            value={MOCK_MONTH.profit}
            isCurrency
            icon={Target}
            isEmpty={MOCK_MONTH.profit === 0}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            label="Tratamente"
            value={MOCK_MONTH.treatments}
            icon={Scissors}
            isEmpty={MOCK_MONTH.treatments === 0}
          />
          <KPICard
            label="Clientele"
            value={MOCK_MONTH.clients}
            icon={Users}
            isEmpty={MOCK_MONTH.clients === 0}
          />
        </div>

        {/* Target pacing bar */}
        <div
          className="mt-3 rounded-2xl p-5"
          style={{
            background: 'white',
            border: '1px solid var(--beige)',
            boxShadow: '0 1px 4px rgba(74,64,58,0.05)',
          }}
        >
          <TargetPacingBar progress={MOCK_MONTH.targetProgress} />
        </div>
      </section>

      {/* ALERTE */}
      {MOCK_ALERTS.length > 0 && (
        <section className="mb-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--gold)' }}
          >
            Alerte
          </h2>
          <div className="flex flex-col gap-2">
            {MOCK_ALERTS.map((alert, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}
              >
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <span className="text-sm text-amber-800">{alert}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {MOCK_TODAY.revenue === 0 && MOCK_MONTH.revenue === 0 && (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ border: '1px dashed var(--beige)' }}
        >
          <p
            className="text-4xl mb-4"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--gold)' }}
          >
            ✦
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--taupe)' }}>
            Conectează Supabase pentru a vedea datele reale
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--taupe-light)' }}>
            Configurează .env.local cu URL-ul și cheia ta Supabase
          </p>
          <Link
            href="/settings"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--gold-pale)', color: 'var(--taupe)' }}
          >
            Setări
          </Link>
        </div>
      )}
    </div>
  );
}
