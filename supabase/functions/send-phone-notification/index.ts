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
    console.log('send-phone-notification received body:', JSON.stringify(body, null, 2));

    const {
      orderId,
      customerName,
      customerPhone,
      fulfillmentMethod,
      totalAmount,
      orderItems
    } = body;

    // Validate required fields
    if (!orderId || !customerName || !customerPhone || !fulfillmentMethod || !totalAmount) {
      throw new Error('Missing required fields');
    }

    // Calculate pickup time (25 minutes from now)
    const now = new Date();
    const pickupTime = new Date(now.getTime() + (25 * 60 * 1000));
    const pickupTimeFormatted = pickupTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Format order items for phone call
    const itemsSummary = orderItems.slice(0, 3).map((item: any) => 
      `${item.quantity}x ${item.name}`
    ).join(', ');
    
    const moreItems = orderItems.length > 3 ? ` plus ${orderItems.length - 3} more items` : '';

    // Create phone call message
    const phoneMessage = `NEW ORDER RECEIVED. Order number ${orderId}. ${fulfillmentMethod.toUpperCase()} ORDER. Customer ${customerName}. Phone number ${customerPhone}. Total amount $${totalAmount.toFixed(2)}. Items include ${itemsSummary}${moreItems}. Ready for ${fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery'} at ${pickupTimeFormatted}.`;

    console.log('Phone Call Message to send:', phoneMessage);

    // TODO: Implement actual phone call logic here
    // You can integrate with Twilio Voice, AWS Connect, or other phone services
    
    // Example Twilio Voice integration (uncomment and configure):
    /*
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: '+13468244212',
        From: TWILIO_PHONE_NUMBER,
        Twiml: `<Response><Say>${phoneMessage}</Say></Response>`,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Phone call failed: ${await response.text()}`);
    }
    */

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Phone call notification prepared successfully',
      phoneMessage: phoneMessage,
      orderId: orderId
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error in send-phone-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 