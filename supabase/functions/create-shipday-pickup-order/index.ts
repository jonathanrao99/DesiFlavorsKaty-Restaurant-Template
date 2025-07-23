// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
    }

    const body = await req.json();
    console.log('create-shipday-pickup-order received body:', JSON.stringify(body, null, 2));

    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      orderItems,
      subtotal,
      taxAmount,
      totalAmount
    } = body;

    // Validate required fields
    if (!orderId || !customerName || !customerPhone || !orderItems) {
      throw new Error('Missing required fields: orderId, customerName, customerPhone, orderItems');
    }

    const ORDER_SERVICE_URL = Deno.env.get('ORDER_SERVICE_URL') || 'http://localhost:8000';

    // Prepare order data for pickup
    const orderData = {
      orderId: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail || '',
      deliveryAddress: '1989 North Fry Rd, Katy, TX 77449', // Store address for pickup
      orderItems: orderItems,
      subtotal: subtotal || 0,
      deliveryFee: 0, // No delivery fee for pickup
      taxAmount: taxAmount || 0,
      totalAmount: totalAmount || 0
    };

    console.log('Sending pickup order data to Python service:', orderData);

    // Call Python service to create pickup order
    const response = await fetch(`${ORDER_SERVICE_URL}/orders/create-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python service error:', errorText);
      throw new Error(`Python service error: ${errorText}`);
    }

    const result = await response.json();
    console.log('Pickup order creation result:', result);

    // Send order confirmation emails and notifications
    if (result.success) {
      try {
        const notificationData = {
          orderId: orderId,
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          deliveryAddress: '1989 North Fry Rd, Katy, TX 77449', // Store address for pickup
          fulfillmentMethod: 'pickup',
          orderItems: orderItems,
          subtotal: subtotal || 0,
          deliveryFee: 0, // No delivery fee for pickup
          taxAmount: taxAmount || 0,
          totalAmount: totalAmount || 0,
          scheduledTime: 'ASAP'
        };

        console.log('Sending pickup order notifications:', notificationData);
        
        // Send email confirmations
        const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-confirmation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationData)
        });

        if (!emailResponse.ok) {
          console.error('Failed to send pickup order emails:', await emailResponse.text());
        } else {
          console.log('Pickup order emails sent successfully');
        }

        // Send SMS notification
        const smsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: orderId,
            customerName: customerName,
            customerPhone: customerPhone,
            fulfillmentMethod: 'pickup',
            totalAmount: totalAmount || 0,
            orderItems: orderItems
          })
        });

        if (!smsResponse.ok) {
          console.error('Failed to send pickup order SMS:', await smsResponse.text());
        } else {
          console.log('Pickup order SMS sent successfully');
        }

        // Send phone call notification
        const phoneResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-phone-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: orderId,
            customerName: customerName,
            customerPhone: customerPhone,
            fulfillmentMethod: 'pickup',
            totalAmount: totalAmount || 0,
            orderItems: orderItems
          })
        });

        if (!phoneResponse.ok) {
          console.error('Failed to send pickup order phone call:', await phoneResponse.text());
        } else {
          console.log('Pickup order phone call sent successfully');
        }

      } catch (notificationError) {
        console.error('Error sending pickup order notifications:', notificationError);
      }
    }

    return new Response(JSON.stringify(result), { headers: corsHeaders });

  } catch (error) {
    console.error('Error in create-shipday-pickup-order:', error);
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 