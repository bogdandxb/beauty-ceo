import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/demo/delete
// Sterge TOATE inregistrarile cu is_demo = TRUE in ordinea corecta pentru FK
export async function DELETE() {
  const supabase = await createClient();

  const tables = [
    'treatment_products_used',
    'product_stock_movements',
    'marketing_campaigns',
    'treatments',
    'packages',
    'service_ingredients',
    'services',
    'expenses',
    'recurring_expenses',
    'targets',
    'clients',
    'products',
    'equipment',
  ];

  const results: Record<string, number> = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('is_demo', true);

    if (error) {
      console.error(`Error deleting demo from ${table}:`, error.message);
      results[table] = -1;
    } else {
      results[table] = count ?? 0;
    }
  }

  return NextResponse.json({
    success: true,
    deleted: results,
    message: 'Datele demo au fost șterse cu succes.',
  });
}
