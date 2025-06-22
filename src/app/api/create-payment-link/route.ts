import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square/legacy';
import { v4 as uuidv4 } from 'uuid';

const client = new Client({
  bearerAuthCredentials: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  },
  environment:
    process.env.SQUARE_ENVIRONMENT?.toLowerCase() === 'production'
      ? Environment.Production
      : Environment.Sandbox,
});

export async function POST(req: NextRequest) {
  try {
    const { cartItems, fulfillmentMethod, scheduledTime, customerInfo, orderId } = await req.json();

    if (!cartItems?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let formattedPhone = undefined;
    if (customerInfo?.phone) {
      const phoneDigits = customerInfo.phone.replace(/\D/g, '');
      if (phoneDigits.length === 10) {
        formattedPhone = `+1${phoneDigits}`;
      } else if (phoneDigits.length === 11 && phoneDigits.startsWith('1')) {
        formattedPhone = `+${phoneDigits}`;
      }
    }

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: uuidv4(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: cartItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: BigInt(Math.round(parseFloat(item.price.replace(/[^0-9.]/g, '')) * 100)),
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
            ...(fulfillmentMethod === 'pickup' && {
              pickupDetails: {
                recipient: {
                  displayName: customerInfo.name,
                  phoneNumber: formattedPhone,
                },
                scheduleType: scheduledTime === 'ASAP' ? 'ASAP' : 'SCHEDULED',
                ...(scheduledTime !== 'ASAP' && { pickupAt: scheduledTime }),
                note: `Customer: ${customerInfo.name}`,
              },
            }),
            ...(fulfillmentMethod === 'delivery' && {
              deliveryDetails: {
                recipient: {
                  displayName: customerInfo.name,
                  phoneNumber: formattedPhone,
                },
                ...(scheduledTime !== 'ASAP' && { deliverAt: scheduledTime }),
              },
            }),
          },
        ],
        referenceId: orderId.toString(),
      },
      checkoutOptions: {
        allowTipping: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
        askForShippingAddress: fulfillmentMethod === 'delivery',
      },
    });

    const responseData = JSON.parse(JSON.stringify(response.result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({
      url: responseData.paymentLink?.url || responseData.paymentLink?.longUrl,
      paymentLink: responseData.paymentLink
    });
  } catch (e: any) {
    console.error('Square API error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to create payment link' },
      { status: 500 },
    );
  }
}
