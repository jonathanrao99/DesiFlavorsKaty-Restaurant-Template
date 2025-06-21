import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Square Webhook received:', JSON.stringify(body, null, 2));

    // TODO:
    // 1. Verify the webhook signature from the 'x-square-hmacsha256-signature' header
    // 2. Process the event type (e.g., 'payment.updated')
    // 3. If payment is COMPLETED, retrieve the order using body.data.object.payment.order_id
    // 4. From the order metadata, check fulfillmentMethod
    // 5. If delivery, call DoorDash Drive API
    // 6. You can also create a final Order in Square's Orders API here if needed

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Square webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 