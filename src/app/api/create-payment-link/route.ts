import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, Environment as SquareEnvironment } from 'square';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Square client
const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

export async function POST(req: NextRequest) {
  try {
    const { cartItems, fulfillmentMethod, scheduledTime, customerInfo } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const line_items = cartItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      base_price_money: {
        amount: Math.round(parseFloat(item.price.replace('$', '')) * 100),
        currency: 'USD',
      },
      note: item.specialInstructions || undefined,
    }));

    const fulfillmentNote = `Fulfillment: ${fulfillmentMethod} at ${scheduledTime}. Customer: ${customerInfo.name}, ${customerInfo.email}, ${customerInfo.phone}. Address: ${customerInfo.address || 'N/A'}`;

    const response = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey: uuidv4(),
      order: {
        locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
        lineItems: line_items,
        note: fulfillmentNote,
        metadata: {
          fulfillmentMethod,
          scheduledTime,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          deliveryAddress: customerInfo.address || '',
        }
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?status=success`,
        allowTipping: true,
        tipSettings: {
          showCustomTipField: true,
          tipPercentages: [10, 15, 20],
        },
        customFields: [
          {
            title: 'Fulfillment Details',
            placement: 'ABOVE_LINE_ITEMS',
          },
        ],
      },
    });

    const paymentLink = response.result.paymentLink;
    if (paymentLink && paymentLink.url) {
      return NextResponse.json({ url: paymentLink.url });
    } else {
      return NextResponse.json({ error: 'Could not create payment link.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json({ error: 'Failed to create payment link.' }, { status: 500 });
  }
} 