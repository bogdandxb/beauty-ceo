export interface Treatment {
  id: string;
  final_price: number;
  cost_snapshot: number;
  duration_snapshot: number;
  treatment_date: string;
  status: string;
  client_id: string;
  service_id: string;
  equipment_id?: string;
  discount_value?: number;
  price_snapshot: number;
}

export interface Expense {
  id: string;
  amount: number;
  expense_date: string;
  category: string;
}

export function calculateRevenue(treatments: Treatment[]): number {
  return treatments
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.final_price, 0);
}

export function calculateCOGS(treatments: Treatment[]): number {
  return treatments
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.cost_snapshot, 0);
}

export function calculateGrossProfit(treatments: Treatment[]): number {
  return calculateRevenue(treatments) - calculateCOGS(treatments);
}

export function calculateGrossProfitMargin(treatments: Treatment[]): number {
  const revenue = calculateRevenue(treatments);
  const gp = calculateGrossProfit(treatments);
  return revenue > 0 ? (gp / revenue) * 100 : 0;
}

export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calculateOperatingProfit(
  treatments: Treatment[],
  expenses: Expense[]
): number {
  return calculateGrossProfit(treatments) - calculateTotalExpenses(expenses);
}

export function calculateRevenuePerHour(treatments: Treatment[]): number {
  const completed = treatments.filter((t) => t.status === 'completed');
  const totalHours = completed.reduce(
    (sum, t) => sum + t.duration_snapshot / 60,
    0
  );
  const revenue = calculateRevenue(completed);
  return totalHours > 0 ? revenue / totalHours : 0;
}

export function calculateAverageTicket(treatments: Treatment[]): number {
  const completed = treatments.filter((t) => t.status === 'completed');
  return completed.length > 0
    ? calculateRevenue(completed) / completed.length
    : 0;
}

export function calculateDiscountImpact(treatments: Treatment[]): number {
  return treatments
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.price_snapshot - t.final_price), 0);
}
