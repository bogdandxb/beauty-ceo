import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
} from 'date-fns';

export type PeriodType =
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'custom';

export function getPeriodRange(
  period: PeriodType,
  customStart?: Date,
  customEnd?: Date
) {
  const now = new Date();
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now), label: 'Astăzi' };
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
        label: 'Săptămâna aceasta',
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: 'Luna aceasta',
      };
    case 'quarter':
      return {
        start: startOfQuarter(now),
        end: endOfQuarter(now),
        label: 'Trimestrul acesta',
      };
    case 'year':
      return {
        start: startOfYear(now),
        end: endOfYear(now),
        label: 'Anul acesta',
      };
    case 'last7':
      return {
        start: subDays(now, 7),
        end: now,
        label: 'Ultimele 7 zile',
      };
    case 'last30':
      return {
        start: subDays(now, 30),
        end: now,
        label: 'Ultimele 30 zile',
      };
    case 'last90':
      return {
        start: subDays(now, 90),
        end: now,
        label: 'Ultimele 90 zile',
      };
    case 'custom':
      return {
        start: customStart!,
        end: customEnd!,
        label: 'Perioadă personalizată',
      };
  }
}
