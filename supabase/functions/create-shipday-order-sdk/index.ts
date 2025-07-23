// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with"
};

serve(async (req) => {
  console.log('=== CREATE-SHIPDAY-ORDER-SDK FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const ORDER_SERVICE_URL = Deno.env.get('ORDER_SERVICE_URL') || 'http://localhost:8000';
    
    console.log('Environment check:', {
      orderServiceUrl: ORDER_SERVICE_URL
    });
    
    if (!ORDER_SERVICE_URL) {
      throw new Error('Missing ORDER_SERVICE_URL environment variable');
    }

    // Parse request body
    const { 
      orderId, 
      customerName, 
      customerPhone, 
      customerEmail, 
      deliveryAddress, 
      pickupTime, 
      deliveryTime,
      orderItems,
      totalAmount,
      deliveryFee,
      paymentId
    } = await req.json();
    
    console.log('Creating Shipday order with SDK:', { 
      orderId, 
      customerName, 
      customerPhone, 
      deliveryAddress, 
      pickupTime, 
      deliveryTime,
      totalAmount,
      deliveryFee
    });

    if (!orderId || !customerName || !customerPhone || !deliveryAddress) {
      throw new Error('Missing required fields: orderId, customerName, customerPhone, deliveryAddress');
    }

    // Call the Python SDK service
    const orderData = {
      orderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      deliveryAddress,
      pickupTime,
      deliveryTime,
      orderItems: orderItems || [],
      totalAmount,
      deliveryFee,
      paymentId
    };

    console.log('Calling Python SDK service with:', orderData);
    
    const response = await fetch(`${ORDER_SERVICE_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const responseText = await response.text();
    console.log('Python SDK service response status:', response.status);
    console.log('Python SDK service response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Python SDK service error: ${responseText}`);
    }
    
    const result = JSON.parse(responseText);
    
    if (result.success) {
      console.log('✅ Shipday order created successfully via SDK:', result.shipdayOrderId);
      
      return new Response(JSON.stringify({
        success: true,
        shipdayOrderId: result.shipdayOrderId,
        message: result.message || 'Order created successfully in Shipday',
        pickupTime,
        deliveryTime,
        customerName,
        customerPhone,
        deliveryAddress,
        totalAmount,
        deliveryFee,
        shipday: result.orderData
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } else {
      throw new Error(result.error || 'Failed to create order via SDK');
    }

  } catch (error) {
    console.error('Create Shipday order SDK error:', error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}); 