import { differenceInDays } from 'date-fns';

export type ClientSegment =
  | 'new'
  | 'returning'
  | 'loyal'
  | 'inactive'
  | 'lapsed';

export function calculateClientSegment(client: {
  total_visits: number;
  last_visit_date: string | null;
  created_at: string;
}): ClientSegment {
  const daysSinceLastVisit = client.last_visit_date
    ? differenceInDays(new Date(), new Date(client.last_visit_date))
    : differenceInDays(new Date(), new Date(client.created_at));

  if (daysSinceLastVisit > 180) return 'lapsed';
  if (daysSinceLastVisit > 90) return 'inactive';
  if (client.total_visits >= 6) return 'loyal';
  if (client.total_visits >= 2) return 'returning';
  return 'new';
}

export const SEGMENT_LABELS: Record<ClientSegment, string> = {
  new: 'Nouă',
  returning: 'Recurentă',
  loyal: 'Loială',
  inactive: 'Inactivă',
  lapsed: 'Pierdută',
};

export const SEGMENT_COLORS: Record<ClientSegment, string> = {
  new: '#C6A769',
  returning: '#B8A090',
  loyal: '#4A403A',
  inactive: '#D4C4B8',
  lapsed: '#E8E1D8',
};
