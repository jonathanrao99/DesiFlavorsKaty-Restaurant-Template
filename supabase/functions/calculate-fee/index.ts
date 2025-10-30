// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with"
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (error.message.includes('rate limited') || error.message.includes('Too many requests')) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await delay(delayMs);
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Simple distance-based fee calculation as fallback
function calculateFallbackFee(address: string): number {
  // Basic fallback fee calculation based on address keywords
  const lowerAddress = address.toLowerCase();
  
  // If it's in Katy area, use a reasonable fee
  if (lowerAddress.includes('katy')) {
    return 4.50;
  }
  
  // If it's a longer distance (has specific keywords), charge more
  if (lowerAddress.includes('houston') || lowerAddress.includes('cypress') || lowerAddress.includes('spring')) {
    return 6.50;
  }
  
  // Default fee for unknown areas
  return 5.00;
}

serve(async (req) => {
  console.log('=== CALCULATE-FEE FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const { address, dropoffPhoneNumber } = await req.json();
    console.log('calculate-fee received body:', {
      address,
      dropoffPhoneNumber
    });
    console.log('Received request for address:', address);

    if (!address) {
      throw new Error('No address provided');
    }

    // For now, use fallback calculation since we don't want to create orders during payment
    // The actual order will be created after successful Square payment
    console.log('Using fallback calculation for payment page estimate');
    const fallbackFee = calculateFallbackFee(address);
    
    return new Response(JSON.stringify({
      fee: fallbackFee,
      usedShipday: false,
      fallback: true,
      message: 'Using fallback fee calculation. Order will be created after successful payment.',
      address: address
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Delivery fee calculation error:', error.message);
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