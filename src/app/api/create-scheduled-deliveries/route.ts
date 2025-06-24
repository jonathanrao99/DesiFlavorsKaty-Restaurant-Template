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
    console.log('Processing scheduled deliveries...');
    
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Find orders that are scheduled and ready to be processed
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    
    const fetchUrl = `${SUPABASE_URL}/rest/v1/orders?status=eq.scheduled&order_type=eq.delivery&select=*`;
    const fetchRes = await fetch(fetchUrl, {
      headers: {
        apikey: SERVICE_KEY,
        authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    if (!fetchRes.ok) {
      console.error('Failed to fetch scheduled orders:', await fetchRes.text());
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const orders = await fetchRes.json();
    console.log(`Found ${orders.length} scheduled orders`);
    
    const processedOrders = [];
    
    for (const order of orders) {
      if (!order.scheduled_time || order.scheduled_time === 'ASAP') continue;
      
      const scheduledTime = new Date(order.scheduled_time);
      const timeDiffHours = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      console.log(`Order ${order.id}: scheduled for ${scheduledTime.toISOString()}, diff: ${timeDiffHours.toFixed(2)} hours`);
      
      // Create delivery if within 2 hours of scheduled time
      if (timeDiffHours <= 2 && timeDiffHours > -1) { // Allow 1 hour past scheduled time
        try {
          console.log(`Creating DoorDash delivery for scheduled order ${order.id}`);
          
          const ddToken = await generateDoorDashJWT();
          const external_delivery_id = crypto.randomUUID();
          
          const deliveryPayload = {
            external_delivery_id,
            locale: 'en-US',
            order_fulfillment_method: 'standard',
            pickup_address: '1989 North Fry Rd, Katy, TX 77494',
            pickup_business_name: 'Desi Flavors Hub',
            pickup_phone_number: '+12814010758',
            pickup_instructions: `Order #${order.id} - ${order.customer_name}`,
            dropoff_address: order.delivery_address,
            dropoff_business_name: order.customer_name,
            dropoff_phone_number: order.customer_phone,
            dropoff_instructions: `Delivery for ${order.customer_name}`,
            order_value: Math.round(order.total_amount * 100),
            deliver_at: scheduledTime.toISOString(),
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
            console.error(`DoorDash delivery creation failed for order ${order.id}:`, ddResult);
          } else {
            console.log(`DoorDash delivery created for order ${order.id}:`, ddResult);
            
            // Update order with external delivery ID and change status to pending
            const updateUrl = `${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`;
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
            
            processedOrders.push({
              orderId: order.id,
              deliveryId: external_delivery_id,
              scheduledTime: scheduledTime.toISOString()
            });
          }
        } catch (error) {
          console.error(`Error creating delivery for order ${order.id}:`, error);
        }
      }
    }
    
    console.log(`Processed ${processedOrders.length} scheduled deliveries`);
    
    return NextResponse.json({ 
      success: true, 
      processedOrders,
      totalScheduled: orders.length 
    });
    
  } catch (error: any) {
    console.error('Error processing scheduled deliveries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 