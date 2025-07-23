// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with"
};

serve(async (req) => {
  console.log('=== ESTIMATE-DELIVERY-FEE FUNCTION CALLED ===');
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
      deliveryAddress, 
      orderValue = 0 
    } = await req.json();
    
    console.log('Estimating delivery fee for:', { 
      deliveryAddress, 
      orderValue 
    });

    if (!deliveryAddress) {
      throw new Error('Missing required field: deliveryAddress');
    }

    // Call the Python SDK service for estimation
    const estimateData = {
      delivery_address: deliveryAddress,
      order_value: parseFloat(orderValue) || 0
    };

    console.log('Calling Python SDK service for estimation:', estimateData);
    
    const response = await fetch(`${ORDER_SERVICE_URL}/delivery/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estimateData),
    });
    
    const responseText = await response.text();
    console.log('Python SDK service response status:', response.status);
    console.log('Python SDK service response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Python SDK service error: ${responseText}`);
    }
    
    const result = JSON.parse(responseText);
    
    if (result.success) {
      console.log('✅ Delivery fee estimated successfully:', result.delivery_fee);
      
      return new Response(JSON.stringify({
        success: true,
        delivery_fee: result.delivery_fee,
        estimated_delivery_time: result.estimated_delivery_time,
        preparation_time: result.preparation_time,
        total_time: result.total_time,
        message: result.message,
        fallback: result.fallback || false
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } else {
      throw new Error(result.error || 'Failed to estimate delivery fee');
    }

  } catch (error) {
    console.error('Estimate delivery fee error:', error.message);
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