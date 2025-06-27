import { supabase } from "@/integrations/supabase/client";
import { logAnalyticsEvent, awardLoyaltyPoints, redeemLoyaltyPointsIfEligible } from '@/utils/loyaltyAndAnalytics';

// Define order types
export interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  specialInstructions?: string;
}

export interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  delivery_address?: string;
  pickup_time?: string; // Changed from Date to string
  special_instructions?: string;
  order_type: 'pickup' | 'delivery';
  payment_id?: string;
}

interface OrderRecord extends OrderData {
  id: number;
  created_at: string;
}

// Submit order to database
export const submitOrder = async (orderData: OrderData) => {
  try {
    const formatted = { 
      ...orderData,
      items: JSON.stringify(orderData.items),
      total_amount: Number(orderData.total_amount.toFixed(2)),
      pickup_time: orderData.pickup_time || null
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert(formatted)
      .select();
    
    if (error || !data?.[0]) throw error || new Error('No data returned');

    const typedData = data as unknown as OrderRecord[];
    const orderId = typedData[0].id;
    // TODO: If customer_id is not present in OrderRecord, get it from orderData
    const customerId = (typedData[0] as any).customer_id || (orderData as any).customer_id;
    // Award loyalty points
    if (customerId) {
      await awardLoyaltyPoints(orderId, customerId, formatted.total_amount);
      await redeemLoyaltyPointsIfEligible(orderId, customerId);
    }
    // Log analytics event
    await logAnalyticsEvent('order_placed', {
      order_id: orderId,
      customer_id: customerId,
      total_amount: formatted.total_amount,
      order_type: formatted.order_type
    });
    return { success: true, orderId };
  } catch (error) {
    console.error('Error submitting order:', error);
    return { success: false, error };
  }
};

// Function to get order by ID (for order confirmation)
export const getOrderById = async (orderId: number) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return { success: true, order: data as unknown as OrderRecord };
    
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error };
  }
};
