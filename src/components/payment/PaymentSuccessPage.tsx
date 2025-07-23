'use client';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { deliveryApi } from '@/lib/supabaseFunctions';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const { clearCart, cartItems, getCartTotal } = useCart();
  const searchParams = useSearchParams();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<string>('');
  
  useEffect(() => {
    clearCart();
    // Get fulfillment method from localStorage
    const storedFulfillmentMethod = localStorage.getItem('fulfillmentMethod');
    setFulfillmentMethod(storedFulfillmentMethod || '');
    
    console.log('PaymentSuccessPage loaded');
    console.log('Fulfillment method from localStorage:', storedFulfillmentMethod);
    console.log('All localStorage data:', {
      fulfillmentMethod: localStorage.getItem('fulfillmentMethod'),
      customerName: localStorage.getItem('customerName'),
      customerPhone: localStorage.getItem('customerPhone'),
      customerEmail: localStorage.getItem('customerEmail'),
      deliveryAddress: localStorage.getItem('deliveryAddress'),
      deliveryFee: localStorage.getItem('deliveryFee'),
      totalAmount: localStorage.getItem('totalAmount'),
      orderId: localStorage.getItem('orderId')
    });

    // Countdown timer and auto-redirect
    let countdown = 10;
    const countdownElement = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownElement) {
        countdownElement.textContent = countdown.toString();
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        window.location.href = 'https://desiflavorskaty.com';
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [clearCart]);

  useEffect(() => {
    const createShipdayOrder = async () => {
      try {
        setIsCreatingOrder(true);
        
        // Get order details from URL params or localStorage
        const orderId = searchParams.get('orderId') || `order-${Date.now()}`;
        const customerName = searchParams.get('customerName') || localStorage.getItem('customerName');
        const customerPhone = searchParams.get('customerPhone') || localStorage.getItem('customerPhone');
        const customerEmail = searchParams.get('customerEmail') || localStorage.getItem('customerEmail');
        const deliveryAddress = searchParams.get('deliveryAddress') || localStorage.getItem('deliveryAddress');
        const deliveryFee = parseFloat(searchParams.get('deliveryFee') || localStorage.getItem('deliveryFee') || '0');
        const totalAmount = parseFloat(searchParams.get('totalAmount') || localStorage.getItem('totalAmount') || '0');
        
        console.log('Creating Shipday order with:', {
          orderId,
          customerName,
          customerPhone,
          customerEmail,
          deliveryAddress,
          deliveryFee,
          totalAmount,
          fulfillmentMethod
        });

        if (!customerName || !customerPhone) {
          console.error('Missing required customer information');
          return;
        }

        // For pickup orders, we don't need delivery address
        if (fulfillmentMethod === 'delivery' && !deliveryAddress) {
          console.error('Missing delivery address for delivery order');
          return;
        }

        // Calculate proper pickup time with cooking buffer (25 minutes from now)
        const now = new Date();
        const pickupTimeDate = new Date(now.getTime() + (25 * 60 * 1000)); // 25 minutes from now
        
        // Format pickup time as HH:MM AM/PM
        const pickupTimeFormatted = pickupTimeDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Calculate delivery time (pickup time + 15 minutes for delivery)
        const deliveryTimeDate = new Date(pickupTimeDate.getTime() + (15 * 60 * 1000)); // 15 minutes after pickup
        const deliveryTimeFormatted = deliveryTimeDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        if (fulfillmentMethod === 'delivery') {
          // Create Shipday order for delivery
          const orderData = {
            orderId: orderId,
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            deliveryAddress: deliveryAddress,
            pickupTime: pickupTimeFormatted,
            deliveryTime: deliveryTimeFormatted,
            orderItems: cartItems,
            totalAmount: totalAmount,
            deliveryFee: deliveryFee,
            paymentId: `payment-${Date.now()}`
          };

          console.log('Sending delivery order data to Shipday:', orderData);
          
          const result = await deliveryApi.createShipdayOrder(orderData);
          console.log('Shipday order creation result:', result);
          
          if (result.success) {
            console.log('✅ Shipday order created successfully:', result.shipdayOrderId);
            toast.success('Order confirmed! Your food will be ready in 25 minutes.');
          } else {
            console.error('❌ Failed to create Shipday order:', result.error);
            toast.error('Order received but there was an issue with delivery setup.');
          }
        } else {
          // For pickup orders, create Shipday order (no delivery driver)
          const pickupOrderData = {
            orderId: orderId,
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            orderItems: cartItems,
            subtotal: parseFloat(localStorage.getItem('subtotal') || '0'),
            taxAmount: parseFloat(localStorage.getItem('taxAmount') || '0'),
            totalAmount: totalAmount
          };

          console.log('Creating Shipday pickup order:', pickupOrderData);
          
          const pickupResult = await deliveryApi.createShipdayPickupOrder(pickupOrderData);
          console.log('Pickup order creation result:', pickupResult);
          
          if (pickupResult.success) {
            console.log('✅ Shipday pickup order created successfully:', pickupResult.shipdayOrderId);
            toast.success('Order confirmed! Your food will be ready for pickup in 25 minutes.');
          } else {
            console.error('❌ Failed to create Shipday pickup order:', pickupResult.error);
            toast.success('Order confirmed! Your food will be ready for pickup in 25 minutes.');
          }
        }

        // Send order confirmation emails
        try {
          const emailData = {
            orderId: orderId,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            deliveryAddress: deliveryAddress || '',
            fulfillmentMethod: fulfillmentMethod,
            orderItems: cartItems,
            subtotal: parseFloat(localStorage.getItem('subtotal') || '0'),
            deliveryFee: deliveryFee,
            taxAmount: parseFloat(localStorage.getItem('taxAmount') || '0'),
            totalAmount: totalAmount,
            scheduledTime: localStorage.getItem('scheduledTime') || 'ASAP'
          };

          console.log('Sending order confirmation emails:', emailData);
          
          const emailResult = await deliveryApi.sendOrderConfirmation(emailData);
          console.log('Email confirmation result:', emailResult);
          
          if (emailResult.success) {
            console.log('✅ Order confirmation emails sent successfully');
          } else {
            console.error('❌ Failed to send order confirmation emails:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Error sending order confirmation emails:', emailError);
        }
        
        // Clear localStorage after successful order processing
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerPhone');
        localStorage.removeItem('customerEmail');
        localStorage.removeItem('deliveryAddress');
        localStorage.removeItem('deliveryFee');
        localStorage.removeItem('totalAmount');
        localStorage.removeItem('orderId');
        localStorage.removeItem('fulfillmentMethod');
        localStorage.removeItem('subtotal');
        localStorage.removeItem('taxAmount');
        localStorage.removeItem('scheduledTime');
        
      } catch (error) {
        console.error('Error creating Shipday order:', error);
        toast.error('Order received but there was an issue with delivery setup.');
      } finally {
        setIsCreatingOrder(false);
      }
    };

    // Process order for both delivery and pickup
    if (fulfillmentMethod) {
      createShipdayOrder();
    }
  }, [searchParams, fulfillmentMethod, cartItems]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank you!</h1>
        <p className="text-gray-600 mb-4">Your order is processing</p>
        <p className="text-lg font-semibold text-gray-800 mb-2">
          Order Number: {localStorage.getItem('orderId') || 'N/A'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You will receive an email confirmation shortly
        </p>
        <div className="space-y-4">
          {isCreatingOrder && (
            <p className="text-sm text-blue-600">
              {fulfillmentMethod === 'pickup' 
                ? 'Processing your pickup order...'
                : 'Setting up your delivery...'
              }
            </p>
          )}
          <p className="text-sm text-gray-500">
            Redirecting to homepage in <span id="countdown">10</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
