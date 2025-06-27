import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lookup = searchParams.get('lookup');

  if (!lookup) {
    return NextResponse.json({ error: 'Lookup parameter is required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // First, find the customer by email or phone
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .or(`email.eq.${lookup},phone.eq.${lookup}`)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get customer's order history with items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        order_type,
        order_items (
          quantity,
          unit_price,
          menu_items (
            name
          )
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Get loyalty points summary
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('customer_loyalty_summary')
      .select('*')
      .eq('customer_id', customer.id)
      .single();

    if (loyaltyError) {
      console.error('Error fetching loyalty data:', loyaltyError);
    }

    // Calculate customer statistics
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const lastOrderDate = orders?.[0]?.created_at || customer.created_at;

    // Determine loyalty tier based on total spent
    let loyaltyTier = 'Bronze';
    if (totalSpent >= 500) loyaltyTier = 'Gold';
    else if (totalSpent >= 200) loyaltyTier = 'Silver';

    // Format order history
    const orderHistory = orders?.map(order => ({
      id: order.id,
      created_at: order.created_at,
      total_amount: Number(order.total_amount),
      status: order.status,
      order_type: order.order_type,
      items: order.order_items?.map(item => ({
        name: (item.menu_items as any)?.name || 'Unknown Item',
        quantity: item.quantity,
        unit_price: Number(item.unit_price)
      })) || []
    })) || [];

    // Calculate available rewards
    const currentPoints = loyaltyData?.current_points || 0;
    const availableRewards = [
      {
        points_required: 100,
        reward_value: 10,
        description: '$10 off your order',
        available: currentPoints >= 100
      },
      {
        points_required: 250,
        reward_value: 25,
        description: '$25 off your order',
        available: currentPoints >= 250
      },
      {
        points_required: 500,
        reward_value: 50,
        description: '$50 off your order',
        available: currentPoints >= 500
      }
    ];

    const customerProfile = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      created_at: customer.created_at,
      loyalty_points: currentPoints,
      loyalty_tier: loyaltyTier,
      total_orders: totalOrders,
      total_spent: totalSpent,
      last_order_date: lastOrderDate,
      order_history: orderHistory,
      available_rewards: availableRewards.filter(reward => reward.available)
    };

    return NextResponse.json(customerProfile);

  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 