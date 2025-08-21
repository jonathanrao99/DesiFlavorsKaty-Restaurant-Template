import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DoorDashOrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  pickupTime: string;
  deliveryTime: string;
  orderItems?: any[];
  totalAmount: number;
  deliveryFee: number;
  paymentId?: string;
}

interface DoorDashAPIResponse {
  success: boolean;
  doordashOrderId?: string;
  error?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const orderData: DoorDashOrderData = await req.json()
    
    // Validate required fields
    if (!orderData.orderId || !orderData.customerName || !orderData.customerPhone || !orderData.deliveryAddress) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: orderId, customerName, customerPhone, deliveryAddress' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get DoorDash credentials from environment
    const doordashDeveloperId = Deno.env.get('DOORDASH_DEVELOPER_ID')
    const doordashKeyId = Deno.env.get('DOORDASH_KEY_ID')
    
    if (!doordashDeveloperId || !doordashKeyId) {
      console.error('DoorDash credentials not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'DoorDash integration not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format order items for DoorDash
    const formattedItems = orderData.orderItems?.map(item => ({
      name: item.name,
      quantity: item.quantity || 1,
      unit_price: parseFloat(item.price.replace('$', '')) * 100, // Convert to cents
      external_data: item.id?.toString() || ''
    })) || []

    // Create DoorDash order payload
    const doordashPayload = {
      external_delivery_id: orderData.orderId,
      pickup_address: {
        street_address: "123 Main St", // Your restaurant address
        city: "Your City",
        state: "Your State",
        postal_code: "12345",
        country: "US"
      },
      dropoff_address: {
        street_address: orderData.deliveryAddress,
        city: "Customer City", // You might want to parse this from the address
        state: "Customer State",
        postal_code: "Customer Postal Code",
        country: "US"
      },
      pickup_instructions: `Order #${orderData.orderId} - Ready at ${orderData.pickupTime}`,
      dropoff_instructions: `Deliver to ${orderData.customerName} - ${orderData.customerPhone}`,
      pickup_time: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
      dropoff_time: new Date(Date.now() + 40 * 60 * 1000).toISOString(), // 40 minutes from now
      order_value: orderData.totalAmount * 100, // Convert to cents
      tip: 0, // Optional tip
      items: formattedItems,
      customer: {
        first_name: orderData.customerName.split(' ')[0] || orderData.customerName,
        last_name: orderData.customerName.split(' ').slice(1).join(' ') || '',
        phone: orderData.customerPhone,
        email: orderData.customerEmail || ''
      }
    }

    console.log('Creating DoorDash order with payload:', doordashPayload)

    // For now, simulate successful order creation
    // In production, you would make an actual API call to DoorDash
    const mockResponse: DoorDashAPIResponse = {
      success: true,
      doordashOrderId: `dd-${Date.now()}`,
      message: 'DoorDash order created successfully (mock response)'
    }

    // TODO: Implement actual DoorDash API call
    // const response = await fetch('https://openapi.doordash.com/drive/v2/orders', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(`${doordashDeveloperId}:${doordashKeyId}`)}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(doordashPayload)
    // })

    console.log('DoorDash order creation result:', mockResponse)

    return new Response(
      JSON.stringify(mockResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating DoorDash order:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
