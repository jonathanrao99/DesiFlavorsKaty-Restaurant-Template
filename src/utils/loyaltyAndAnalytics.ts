import { supabase } from '@/integrations/supabase/client';

export async function logAnalyticsEvent(event_name: string, event_data: any) {
  try {
    await supabase.from('analytics_events').insert({
      event_name,
      event_data,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    // Optionally log error
  }
}

export async function awardLoyaltyPoints(orderId: number, customerId: number, totalAmount: number) {
  try {
    const points = Math.floor(totalAmount);
    await supabase.from('loyalty_events').insert({
      customer_id: customerId,
      event_type: 'earn',
      points,
      order_id: orderId,
      description: `Earned ${points} points for order #${orderId}`
    });
    await logAnalyticsEvent('loyalty_points_earned', { customer_id: customerId, order_id: orderId, points });
  } catch (e) {
    // Optionally log error
  }
}

export async function redeemLoyaltyPointsIfEligible(orderId: number, customerId: number) {
  try {
    // Fetch current points balance from the summary view
    const { data: summary } = await supabase
      .from('customer_loyalty_summary')
      .select('points_balance')
      .eq('customer_id', customerId)
      .single();
    const points = (summary as any)?.points_balance || 0;
    if (points >= 100) {
      await supabase.from('loyalty_events').insert({
        customer_id: customerId,
        event_type: 'redeem',
        points: -100,
        order_id: orderId,
        description: 'Redeemed 100 points for $10 off'
      });
      await logAnalyticsEvent('loyalty_points_redeemed', { customer_id: customerId, order_id: orderId, points: 100 });
      // TODO: Apply $10 discount to the order in your order logic
    }
  } catch (e) {
    // Optionally log error
  }
} 