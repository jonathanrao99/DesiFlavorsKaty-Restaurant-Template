// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const body = await req.json();
    console.log('ShipDay webhook received:', body);

    // Validate webhook signature if needed
    // const signature = req.headers.get('x-shipday-signature');
    // if (signature) {
    //   // Verify signature logic here
    // }

    const { 
      external_delivery_id, 
      status, 
      tracking_url, 
      estimated_delivery_time,
      driver_name,
      driver_phone,
      notes 
    } = body;

    if (!external_delivery_id || !status) {
      throw new Error('Missing required fields: external_delivery_id or status');
    }

    // Update order in Supabase based on delivery status
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    // Map ShipDay status to order status
    const statusMapping = {
      'pending': 'pending',
      'assigned': 'assigned',
      'picked_up': 'picked_up',
      'delivered': 'delivered',
      'failed': 'failed',
      'cancelled': 'cancelled'
    };

    const orderStatus = statusMapping[status] || status;

    // Update order with delivery status and tracking info
    const updatePayload = {
      delivery_status: orderStatus,
      tracking_url: tracking_url || null,
      estimated_delivery_time: estimated_delivery_time || null,
      driver_name: driver_name || null,
      driver_phone: driver_phone || null,
      delivery_notes: notes || null,
      updated_at: new Date().toISOString()
    };

    // Find order by external_delivery_id and update
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?external_delivery_id=eq.${external_delivery_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateRes.ok) {
      console.error('Failed to update order:', await updateRes.text());
      throw new Error('Failed to update order in database');
    }

    const updatedOrder = await updateRes.json();
    console.log('Order updated successfully:', updatedOrder[0]?.id);

    // Send notifications based on status
    if (status === 'delivered') {
      // Send delivery confirmation notification
      console.log('Delivery completed for order:', external_delivery_id);
      
      // You can add SMS/email notifications here
      // Example: Send SMS to customer
      // await sendDeliveryConfirmationSMS(updatedOrder[0]);
    } else if (status === 'picked_up') {
      // Send pickup notification
      console.log('Order picked up for delivery:', external_delivery_id);
      
      // You can add SMS/email notifications here
      // Example: Send SMS to customer
      // await sendPickupNotificationSMS(updatedOrder[0]);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      order_id: updatedOrder[0]?.id,
      status: orderStatus
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('ShipDay webhook error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error occurred'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}); 