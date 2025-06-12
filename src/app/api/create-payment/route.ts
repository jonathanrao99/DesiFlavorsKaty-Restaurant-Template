/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  // Parse and log request body
  let body: any;
  try {
    body = await req.json();
    console.log('create-payment request body:', body);
  } catch (e) {
    console.error('Failed to parse JSON body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { sourceId, amount, idempotencyKey } = body;
  // Check environment variables
  console.log('Square env presence:', {
    hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
    locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
  });
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID) {
    console.error('Missing Square environment variables');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Process payment with Square SDK
  try {
    const squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!,
      environment: SquareEnvironment.Sandbox,
    });

    // Validate required payment fields
    if (!sourceId || !amount || !idempotencyKey) {
      console.error('Missing required payment fields:', { sourceId, amount, idempotencyKey });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use the Payments resource from the Square client
    const payments = squareClient.payments;
    if (!payments || typeof payments.create !== 'function') {
      console.error('Payments resource create method not available', Object.keys(payments || {}));
      return NextResponse.json({ error: 'Payments API unavailable' }, { status: 500 });
    }
    console.log('createPayment params:', { sourceId, amount, idempotencyKey, locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID });
    // Execute the payment
    const paymentResponse = await payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency: 'USD',
      },
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
    });
    // Debug: log full payment response
    console.log('Square payment response:', paymentResponse);
    // Success: return only the payment ID
    const paymentId = paymentResponse.payment.id;
    return NextResponse.json({ id: paymentId });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 });
  }
} 