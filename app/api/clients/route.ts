import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const segment = searchParams.get('segment');

  let query = supabase
    .from('clients')
    .select(
      `id, first_name, last_name, phone, email, segment,
       last_visit_date, total_visits, total_spent, average_order_value,
       acquisition_source, acquisition_date, accepts_marketing, is_active, created_at`
    )
    .eq('is_active', true)
    .order('last_visit_date', { ascending: false });

  if (segment) query = query.eq('segment', segment);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...body,
      segment: 'new',
      total_visits: 0,
      total_spent: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
