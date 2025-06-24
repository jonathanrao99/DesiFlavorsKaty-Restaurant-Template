import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

// Helper to generate DoorDash JWT
async function generateDoorDashJWT() {
  const developer_id = process.env.DOORDASH_DRIVE_DEVELOPER_ID;
  const key_id = process.env.DOORDASH_DRIVE_KEY_ID;
  const signing_secret = process.env.DOORDASH_DRIVE_SIGNING_SECRET;
  if (!developer_id || !key_id || !signing_secret) throw new Error('Missing DoorDash credentials');
  
  const header = { alg: 'HS256', typ: 'JWT', 'dd-ver': 'DD-JWT-V1' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 300;
  const payload = { aud: 'doordash', iss: developer_id, kid: key_id, iat, exp };
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const dataToSign = `${headerB64}.${payloadB64}`;
  const signature = createHmac('sha256', Buffer.from(signing_secret, 'base64'))
    .update(dataToSign)
    .digest('base64url');
  return `${dataToSign}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Square Webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get('x-square-hmacsha256-signature');
    if (signature && process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
      const expectedSignature = createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)
        .update(JSON.stringify(body))
        .digest('base64');
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Process payment completion
    if (body.type === 'payment.updated' && body.data?.object?.payment) {
      const payment = body.data.object.payment;
      
      // Only process completed payments
      if (payment.status !== 'COMPLETED') {
        console.log('Payment not completed, status:', payment.status);
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
      }

      const orderId = payment.reference_id;
      const paymentId = payment.id;
      
      if (!orderId) {
        console.error('No reference_id (orderId) found in payment');
        return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
      }

      console.log('Processing completed payment for order:', orderId);

      // Update order in Supabase with payment information
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      // First, fetch the order details
      const fetchUrl = `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`;
      const fetchRes = await fetch(fetchUrl, {
        headers: {
          apikey: SERVICE_KEY,
          authorization: `Bearer ${SERVICE_KEY}`
        }
      });

      if (!fetchRes.ok) {
        console.error('Failed to fetch order:', await fetchRes.text());
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const orders = await fetchRes.json();
      const order = orders[0];

      if (!order) {
        console.error('Order not found in database:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      console.log('Found order:', order);

      // Update order with payment ID and set status to confirmed
      const updateUrl = `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`;
      const updateRes = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          payment_id: paymentId,
          status: 'confirmed'
        })
      });

      if (!updateRes.ok) {
        console.error('Failed to update order:', await updateRes.text());
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      console.log('Order updated with payment ID');

      // If it's a delivery order, create DoorDash delivery
      if (order.order_type === 'delivery' && order.delivery_address) {
        try {
          console.log('Creating DoorDash delivery for order:', orderId);
          
          const ddToken = await generateDoorDashJWT();
          const external_delivery_id = crypto.randomUUID();
          
          // Parse scheduled time
          let deliverAt = undefined;
          if (order.scheduled_time && order.scheduled_time !== 'ASAP') {
            deliverAt = new Date(order.scheduled_time).toISOString();
          }

                     const deliveryPayload = {
             external_delivery_id,
             locale: 'en-US',
             order_fulfillment_method: 'standard',
             pickup_address: '1989 North Fry Rd, Katy, TX 77494',
             pickup_business_name: 'Desi Flavors Hub',
             pickup_phone_number: '+12814010758',
             pickup_instructions: `Order #${orderId} - ${order.customer_name}`,
             dropoff_address: order.delivery_address,
             dropoff_business_name: order.customer_name,
             dropoff_phone_number: order.customer_phone,
             dropoff_instructions: `Delivery for ${order.customer_name}`,
             order_value: Math.round(order.total_amount * 100), // Convert to cents
             ...(deliverAt && { deliver_at: deliverAt }),
           };

          console.log('DoorDash delivery payload:', deliveryPayload);

          const ddRes = await fetch('https://openapi.doordash.com/drive/v2/deliveries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ddToken}`,
            },
            body: JSON.stringify(deliveryPayload),
          });

          const ddResult = await ddRes.json();
          
          if (!ddRes.ok) {
            console.error('DoorDash delivery creation failed:', ddResult);
            // Don't fail the webhook, just log the error
            // The order is still valid, just no delivery assigned
          } else {
            console.log('DoorDash delivery created:', ddResult);
            
            // Update order with external delivery ID
            await fetch(updateUrl, {
              method: 'PATCH',
              headers: {
                apikey: SERVICE_KEY,
                authorization: `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                external_delivery_id: external_delivery_id,
                status: 'pending'
              })
            });
          }
        } catch (ddError) {
          console.error('Error creating DoorDash delivery:', ddError);
          // Don't fail the webhook, order is still valid
        }
      }

      console.log('Payment processing completed successfully');
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Square webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 