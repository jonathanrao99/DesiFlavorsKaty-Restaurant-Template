import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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

// Submit order to database
export const submitOrder = async (orderData: OrderData) => {
  try {
    const formatted = { 
      ...orderData,
      items: JSON.stringify(orderData.items) as Json,
      total_amount: Number(orderData.total_amount.toFixed(2)),
      pickup_time: orderData.pickup_time || null
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert(formatted)
      .select();
    
    if (error || !data?.[0]) throw error || new Error('No data returned');

    // Directly invoke your Edge Function:
    console.log('Submitting order record to process-order Edge Function:', data[0]);
    const processRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/process-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        body: JSON.stringify({ record: data[0] }),
      }
    );
    console.log('process-order response status:', processRes.status);
    return { success: true, orderId: data[0].id };
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
    return { success: true, order: data };
    
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error };
  }
};
