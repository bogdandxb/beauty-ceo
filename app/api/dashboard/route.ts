import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const todayStart = format(startOfDay(now), 'yyyy-MM-dd');
    const todayEnd = format(endOfDay(now), 'yyyy-MM-dd');
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Tratamente AZI
    const { data: todayTreatments } = await supabase
      .from('treatments')
      .select('final_price, status, client_id')
      .gte('treatment_date', todayStart)
      .lte('treatment_date', todayEnd)
      .eq('status', 'completed');

    const revenueToday = todayTreatments?.reduce(
      (sum, t) => sum + t.final_price,
      0
    ) ?? 0;
    const treatmentsToday = todayTreatments?.length ?? 0;

    // Clientele noi azi
    const { count: newClientsToday } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd + 'T23:59:59');

    // Tratamente LUNA
    const { data: monthTreatments } = await supabase
      .from('treatments')
      .select('final_price, cost_snapshot, status, client_id')
      .gte('treatment_date', monthStart)
      .lte('treatment_date', monthEnd)
      .eq('status', 'completed');

    const revenueMonth =
      monthTreatments?.reduce((sum, t) => sum + t.final_price, 0) ?? 0;
    const cogsMonth =
      monthTreatments?.reduce((sum, t) => sum + t.cost_snapshot, 0) ?? 0;
    const treatmentsMonth = monthTreatments?.length ?? 0;

    // Cheltuieli LUNA
    const { data: monthExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd);

    const expensesMonth =
      monthExpenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    const grossProfit = revenueMonth - cogsMonth;
    const operatingProfit = grossProfit - expensesMonth;

    // Clientele unice luna
    const uniqueClients = new Set(
      monthTreatments?.map((t) => t.client_id) ?? []
    ).size;

    // Target luna
    const { data: target } = await supabase
      .from('targets')
      .select('target_revenue, target_profit, target_treatments')
      .eq('period_type', 'month')
      .eq('period_year', currentYear)
      .eq('period_number', currentMonth)
      .single();

    const targetProgress =
      target?.target_revenue
        ? (revenueMonth / target.target_revenue) * 100
        : 0;

    // Alerte stoc redus
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('name, current_stock, min_stock_alert')
      .lt('current_stock', supabase.rpc as unknown as never)
      .eq('is_active', true);

    // Simplu: preluam produse si filtram in JS
    const { data: allProducts } = await supabase
      .from('products')
      .select('name, current_stock, min_stock_alert')
      .eq('is_active', true);

    const stockAlerts =
      allProducts
        ?.filter(
          (p) =>
            p.min_stock_alert !== null &&
            p.current_stock !== null &&
            p.current_stock <= p.min_stock_alert
        )
        .map((p) => `Stoc redus: ${p.name} (${p.current_stock} unități rămase)`) ?? [];

    return NextResponse.json({
      today: {
        revenue: revenueToday,
        treatments: treatmentsToday,
        newClients: newClientsToday ?? 0,
      },
      month: {
        revenue: revenueMonth,
        grossProfit,
        operatingProfit,
        treatments: treatmentsMonth,
        clients: uniqueClients,
        targetRevenue: target?.target_revenue ?? null,
        targetProgress,
      },
      alerts: stockAlerts,
    });
  } catch (err) {
    console.error('Dashboard route error:', err);
    return NextResponse.json(
      { error: 'Eroare la incarcarea datelor' },
      { status: 500 }
    );
  }
}
