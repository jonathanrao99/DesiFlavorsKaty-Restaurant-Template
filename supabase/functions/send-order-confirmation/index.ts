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
    console.log('send-order-confirmation received body:', JSON.stringify(body, null, 2));

    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      fulfillmentMethod,
      orderItems,
      subtotal,
      deliveryFee,
      taxAmount,
      totalAmount,
      scheduledTime
    } = body;

    // Validate required fields
    if (!orderId || !customerName || !customerEmail || !orderItems) {
      throw new Error('Missing required fields: orderId, customerName, customerEmail, orderItems');
    }

    // Format order items for email
    const itemsList = orderItems.map((item: any) => 
      `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    // Calculate pickup/delivery time
    const now = new Date();
    const pickupTime = new Date(now.getTime() + (25 * 60 * 1000)); // 25 minutes from now
    const pickupTimeFormatted = pickupTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const deliveryTime = fulfillmentMethod === 'delivery' 
      ? new Date(pickupTime.getTime() + (30 * 60 * 1000)) // 30 minutes after pickup
      : null;

    const deliveryTimeFormatted = deliveryTime 
      ? deliveryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : null;

    // Customer Email Template
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Desi Flavors Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .order-details { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
          .items-list { margin: 15px 0; }
          .total-section { border-top: 2px solid #eee; padding-top: 15px; margin-top: 15px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍛 Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="order-details">
            <h2>Order #${orderId}</h2>
            <p><strong>Order Date:</strong> ${now.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            
            <div class="highlight">
              <h3>${fulfillmentMethod === 'pickup' ? 'Pickup Information' : 'Delivery Information'}</h3>
              <p><strong>${fulfillmentMethod === 'pickup' ? 'Ready for pickup at:' : 'Estimated delivery time:'}</strong></p>
              <p><strong>${fulfillmentMethod === 'pickup' ? pickupTimeFormatted : deliveryTimeFormatted}</strong></p>
              ${fulfillmentMethod === 'delivery' ? `<p><strong>Delivery Address:</strong><br>${deliveryAddress}</p>` : ''}
            </div>

            <h3>Order Items:</h3>
            <div class="items-list">
              ${itemsList}
            </div>

            <div class="total-section">
              <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
              <p><strong>Tax:</strong> $${taxAmount.toFixed(2)}</p>
              ${deliveryFee > 0 ? `<p><strong>Delivery Fee:</strong> $${deliveryFee.toFixed(2)}</p>` : ''}
              <h3><strong>Total:</strong> $${totalAmount.toFixed(2)}</h3>
            </div>

            <div class="highlight">
              <p><strong>Customer Information:</strong></p>
              <p>Name: ${customerName}</p>
              <p>Phone: ${customerPhone}</p>
              <p>Email: ${customerEmail}</p>
            </div>
          </div>

          <div class="footer">
            <p>Desi Flavors Hub</p>
            <p>1989 North Fry Rd, Katy, TX 77449</p>
            <p>Phone: +1 (346) 824-4212</p>
            <p>Thank you for choosing us!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Business Notification Email Template
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received - Desi Flavors Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .order-details { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
          .urgent { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .items-list { margin: 15px 0; }
          .total-section { border-top: 2px solid #eee; padding-top: 15px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 NEW ORDER RECEIVED</h1>
            <p>Order #${orderId}</p>
          </div>
          
          <div class="order-details">
            <div class="urgent">
              <h2>${fulfillmentMethod.toUpperCase()} ORDER</h2>
              <p><strong>Order Type:</strong> ${fulfillmentMethod === 'pickup' ? 'PICKUP' : 'DELIVERY'}</p>
              <p><strong>Order Time:</strong> ${now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
              })}</p>
              <p><strong>Ready Time:</strong> ${pickupTimeFormatted}</p>
              ${fulfillmentMethod === 'delivery' ? `<p><strong>Delivery Time:</strong> ${deliveryTimeFormatted}</p>` : ''}
            </div>

            <h3>Customer Information:</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            ${fulfillmentMethod === 'delivery' ? `<p><strong>Delivery Address:</strong><br>${deliveryAddress}</p>` : ''}

            <h3>Order Items:</h3>
            <div class="items-list">
              ${itemsList}
            </div>

            <div class="total-section">
              <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
              <p><strong>Tax:</strong> $${taxAmount.toFixed(2)}</p>
              ${deliveryFee > 0 ? `<p><strong>Delivery Fee:</strong> $${deliveryFee.toFixed(2)}</p>` : ''}
              <h3><strong>Total:</strong> $${totalAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send customer confirmation email
    const customerEmailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Order Confirmation #${orderId} - Desi Flavors Hub`,
        html: customerEmailHtml
      })
    });

    if (!customerEmailResponse.ok) {
      console.error('Failed to send customer email:', await customerEmailResponse.text());
    }

    // Send business notification email
    const businessEmailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'orders@desiflavorskaty.com',
        subject: `NEW ORDER #${orderId} - ${fulfillmentMethod.toUpperCase()}`,
        html: businessEmailHtml
      })
    });

    if (!businessEmailResponse.ok) {
      console.error('Failed to send business email:', await businessEmailResponse.text());
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
        fulfillmentMethod: fulfillmentMethod,
        totalAmount: totalAmount,
        orderItems: orderItems
      })
    });

    if (!smsResponse.ok) {
      console.error('Failed to send SMS notification:', await smsResponse.text());
    } else {
      console.log('SMS notification sent successfully');
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
        fulfillmentMethod: fulfillmentMethod,
        totalAmount: totalAmount,
        orderItems: orderItems
      })
    });

    if (!phoneResponse.ok) {
      console.error('Failed to send phone notification:', await phoneResponse.text());
    } else {
      console.log('Phone notification sent successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order confirmation emails sent successfully',
      orderId: orderId
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error in send-order-confirmation:', error);
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 