import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const clientId = searchParams.get('client_id');

  let query = supabase
    .from('treatments')
    .select(
      `id, client_id, service_id, equipment_id, treatment_date, treatment_time,
       service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot,
       discount_type, discount_value, discount_reason, final_price,
       status, payment_method, technician_notes, client_feedback, is_demo,
       created_at`
    )
    .order('treatment_date', { ascending: false });

  if (start) query = query.gte('treatment_date', start);
  if (end) query = query.lte('treatment_date', end);
  if (clientId) query = query.eq('client_id', clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    client_id,
    service_id,
    final_price,
    discount_type,
    discount_value,
    discount_reason,
    payment_method,
    treatment_date,
    treatment_time,
    technician_notes,
  } = body;

  // 1. Preluam serviciul pentru snapshot
  const { data: service, error: serviceErr } = await supabase
    .from('services')
    .select('name, price, duration_minutes, equipment_id')
    .eq('id', service_id)
    .single();

  if (serviceErr || !service) {
    return NextResponse.json({ error: 'Serviciu negasit' }, { status: 404 });
  }

  // 2. Calculam cost_snapshot din ingrediente
  const { data: ingredients } = await supabase
    .from('service_ingredients')
    .select('quantity, products(cost_per_package, package_size)')
    .eq('service_id', service_id);

  let costSnapshot = 0;
  if (ingredients) {
    for (const ing of ingredients as any[]) {
      const product = ing.products;
      if (product?.cost_per_package && product?.package_size && product.package_size > 0) {
        const costPerUnit = product.cost_per_package / product.package_size;
        costSnapshot += costPerUnit * ing.quantity;
      }
    }
  }

  // 3. Salvam tratamentul
  const { data: treatment, error: treatmentErr } = await supabase
    .from('treatments')
    .insert({
      client_id,
      service_id,
      equipment_id: service.equipment_id ?? null,
      treatment_date,
      treatment_time: treatment_time || null,
      service_name_snapshot: service.name,
      price_snapshot: service.price,
      cost_snapshot: Math.round(costSnapshot * 100) / 100,
      duration_snapshot: service.duration_minutes,
      discount_type: discount_type || null,
      discount_value: discount_value || 0,
      discount_reason: discount_reason || null,
      final_price,
      payment_method,
      status: 'completed',
      technician_notes: technician_notes || null,
    })
    .select()
    .single();

  if (treatmentErr) {
    return NextResponse.json({ error: treatmentErr.message }, { status: 500 });
  }

  // 4. Actualizam statisticile clientei
  const { data: clientData } = await supabase
    .from('clients')
    .select('total_visits, total_spent')
    .eq('id', client_id)
    .single();

  if (clientData) {
    const newTotalVisits = clientData.total_visits + 1;
    const newTotalSpent = clientData.total_spent + final_price;
    const newAvgOrder = newTotalSpent / newTotalVisits;

    let segment = 'new';
    if (newTotalVisits >= 6) segment = 'loyal';
    else if (newTotalVisits >= 2) segment = 'returning';

    await supabase
      .from('clients')
      .update({
        total_visits: newTotalVisits,
        total_spent: newTotalSpent,
        average_order_value: Math.round(newAvgOrder * 100) / 100,
        last_visit_date: treatment_date,
        segment,
      })
      .eq('id', client_id);
  }

  return NextResponse.json(treatment, { status: 201 });
}
