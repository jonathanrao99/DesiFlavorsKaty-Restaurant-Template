import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const url = `${SUPABASE_URL}/rest/v1/orders?select=id,created_at,customer_name,customer_phone,order_type,total_amount,status,delivery_address&order=created_at.desc&limit=50`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, fulfillmentMethod, scheduledTime, deliveryFee, customerInfo } = await req.json();

    // Calculate total amount (subtotal + tax + delivery fee)
    const subtotal = cartItems.reduce((acc: number, item: any) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      const qty = parseInt(item.quantity, 10);
      return acc + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
    }, 0);
    const tax = subtotal * 0.0825;
    const total = subtotal + tax + (fulfillmentMethod === 'delivery' ? (deliveryFee || 0) : 0);

    // Insert into Supabase orders table
    const insertResult = await supabase
      .from('orders')
      .insert({
        items: cartItems,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        order_type: fulfillmentMethod,
        delivery_address: fulfillmentMethod === 'delivery' ? customerInfo.address : null,
        scheduled_time: scheduledTime,
        total_amount: total,
      })
      .select('id')
      .single();
    if (insertResult.error) {
      console.error('Error inserting order:', insertResult.error);
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
    }
    const newOrder = insertResult.data as any;
    return NextResponse.json({ orderId: newOrder.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 