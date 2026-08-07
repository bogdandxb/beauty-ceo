import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface KPICardProps {
  label: string;
  value: number | string;
  sub?: string;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  isCurrency?: boolean;
  color?: string;
  isEmpty?: boolean;
}

export default function KPICard({
  label,
  value,
  sub,
  trend,
  trendLabel,
  icon: Icon,
  isCurrency = false,
  color = 'var(--gold)',
  isEmpty = false,
}: KPICardProps) {
  const displayValue =
    isEmpty
      ? '—'
      : isCurrency && typeof value === 'number'
      ? formatCurrency(value)
      : String(value);

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend === 0;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'white',
        border: '1px solid var(--beige)',
        boxShadow: '0 1px 4px rgba(74,64,58,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--taupe-light)' }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gold-pale)' }}
          >
            <Icon size={14} style={{ color }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className="text-2xl font-semibold"
          style={{
            color: 'var(--taupe)',
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.75rem',
          }}
        >
          {displayValue}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--taupe-light)' }}>
            {sub}
          </p>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trendPositive && <TrendingUp size={12} className="text-green-500" />}
          {trendNegative && <TrendingDown size={12} className="text-red-400" />}
          {trendNeutral && <Minus size={12} style={{ color: 'var(--taupe-light)' }} />}
          <span
            className="text-xs font-medium"
            style={{
              color: trendPositive
                ? '#22c55e'
                : trendNegative
                ? '#f87171'
                : 'var(--taupe-light)',
            }}
          >
            {trendPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs" style={{ color: 'var(--taupe-light)' }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
