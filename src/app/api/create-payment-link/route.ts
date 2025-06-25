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
    const { cartItems, fulfillmentMethod, scheduledTime, customerInfo, orderId, deliveryFee } = await req.json();

    console.log('create-payment-link received:', {
      fulfillmentMethod,
      deliveryFee,
      deliveryFeeType: typeof deliveryFee,
      cartItemsCount: cartItems?.length
    });

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

    // Build line items starting with cart items
    const lineItems = cartItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      basePriceMoney: {
        amount: BigInt(Math.round(parseFloat(item.price.replace(/[^0-9.]/g, '')) * 100)),
        currency: 'USD',
      },
    }));

    // Add delivery fee as a separate line item if present
    if (fulfillmentMethod === 'delivery') {
      // Use provided fee or default to 0
      const feeAmount = typeof deliveryFee === 'number' && deliveryFee > 0 ? deliveryFee : 0;
      console.log('Adding delivery fee line item:', feeAmount);
      lineItems.push({
        name: 'Delivery Fee',
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(Math.round(feeAmount * 100)),
          currency: 'USD',
        },
      });
    }

    console.log('Final line items:', lineItems.map(item => ({ name: item.name, amount: item.basePriceMoney.amount.toString() })));

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: uuidv4(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems,
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
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        askForShippingAddress: fulfillmentMethod === 'delivery',
      },
    });

    const responseData = JSON.parse(JSON.stringify(response.result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    console.log('Square payment link created successfully');

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
