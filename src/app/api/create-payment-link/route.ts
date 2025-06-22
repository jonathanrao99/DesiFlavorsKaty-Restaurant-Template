import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square';
import { v4 as uuidv4 } from 'uuid';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.NODE_ENV === 'production'
      ? Environment.Production
      : Environment.Sandbox,
});
const { checkoutApi } = squareClient;

export async function POST(req: NextRequest) {
  try {
    const { cartItems, fulfillmentMethod, scheduledTime, customerInfo } = await req.json();

    if (!cartItems?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const response = await checkoutApi.createPaymentLink({
      idempotencyKey: uuidv4(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: cartItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: BigInt(Math.round(item.price * 100)),
            currency: 'USD',
          },
        })),
        taxes: [
          {
            name: 'Sales Tax',
            percentage: '8.25',
            scope: 'ORDER',
          },
        ],
        fulfillments: [
          {
            type: fulfillmentMethod === 'delivery' ? 'DELIVERY' : 'PICKUP',
            state: 'PROPOSED',
            pickupDetails: {
              pickupAt: scheduledTime,
              note: `Customer: ${customerInfo.name}`
            },
          },
        ]
      },
      checkoutOptions: {
        allowTipping: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
        askForShippingAddress: fulfillmentMethod === 'delivery',
      },
      prePopulatedData: {
        buyerEmail: customerInfo.email,
        buyerPhoneNumber: customerInfo.phone,
      },
    });

    return NextResponse.json(response.result);
  } catch (e: any) {
    console.error('Square API error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to create payment link' },
      { status: 500 },
    );
  }
}
