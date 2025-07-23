// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with"
};

serve(async (req) => {
  console.log('=== CREATE-SHIPDAY-ORDER FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY');
    const STORE_ADDRESS = Deno.env.get('STORE_ADDRESS');
    
    console.log('Environment check:', {
      hasShipDayApiKey: !!SHIPDAY_API_KEY,
      hasStoreAddress: !!STORE_ADDRESS,
      shipDayApiKeyLength: SHIPDAY_API_KEY?.length || 0,
      storeAddressLength: STORE_ADDRESS?.length || 0
    });
    
    if (!SHIPDAY_API_KEY || !STORE_ADDRESS) {
      throw new Error(`Missing environment variables: SHIPDAY_API_KEY=${!!SHIPDAY_API_KEY}, STORE_ADDRESS=${!!STORE_ADDRESS}`);
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
    
    console.log('Creating Shipday order with:', { 
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

    // Use the pickup and delivery times passed from the frontend
    const pickupTimeFormatted = pickupTime;
    const deliveryTimeFormatted = deliveryTime;

    console.log('Using provided times:', {
      pickupTime: pickupTimeFormatted,
      deliveryTime: deliveryTimeFormatted
    });

    // Format order items for Shipday API
    const formattedItems = orderItems ? orderItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      note: item.specialInstructions || undefined
    })) : [];

    // Create order in Shipday with proper field mapping
    const createOrderUrl = 'https://api.shipday.com/orders';
    const orderBody = {
      pickupAddress: STORE_ADDRESS,
      dropoffAddress: deliveryAddress,
      orderNumber: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail || '',
      pickupTime: pickupTimeFormatted,
      deliveryTime: deliveryTimeFormatted,
      amount: totalAmount,
      deliveryFee: deliveryFee,
      items: formattedItems,
      // Add additional fields that might be required
      referenceId: paymentId,
      deliveryInstructions: `Order placed at ${new Date().toLocaleTimeString()}. Please deliver to ${customerName} at ${deliveryAddress}.`
    };
    
    console.log('Shipday order body:', JSON.stringify(orderBody, null, 2));
    
    const createOrderResp = await fetch(createOrderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${SHIPDAY_API_KEY}`,
      },
      body: JSON.stringify(orderBody),
    });
    
    const createOrderText = await createOrderResp.text();
    console.log('Create order response status:', createOrderResp.status);
    console.log('Create order response:', createOrderText);
    
    if (!createOrderResp.ok) {
      if (createOrderText.includes('Too many requests')) {
        throw new Error('Shipday API rate limited. Please try again in a moment.');
      }
      throw new Error(`Failed to create order: ${createOrderText}`);
    }
    
    // Parse the response to get the Shipday order ID
    let createOrderData;
    try {
      createOrderData = JSON.parse(createOrderText);
    } catch (e) {
      throw new Error(`Invalid JSON response from create order: ${createOrderText}`);
    }
    
    const shipdayOrderId = createOrderData.orderId || createOrderData.order_id;
    console.log('Shipday order created successfully with ID:', shipdayOrderId);
    
    return new Response(JSON.stringify({
      success: true,
      shipdayOrderId: shipdayOrderId,
      message: 'Order created successfully in Shipday',
      pickupTime: pickupTimeFormatted,
      deliveryTime: deliveryTimeFormatted,
      customerName: customerName,
      customerPhone: customerPhone,
      deliveryAddress: deliveryAddress,
      totalAmount: totalAmount,
      deliveryFee: deliveryFee,
      shipday: createOrderData
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Create Shipday order error:', error.message);
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