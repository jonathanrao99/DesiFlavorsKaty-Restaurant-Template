'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import OrderSummary from '@/components/payment/OrderSummary';
import PaymentSuccessPage from '@/components/payment/PaymentSuccessPage';
import { Button } from '@heroui/react';
import { AddressAutocomplete } from '@/components/payment/AddressAutocomplete';

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, getCartTotal, clearCart, fulfillmentMethod, scheduledTime, setScheduledTime } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Calculate order totals
  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax + (fulfillmentMethod === 'delivery' && deliveryFee ? deliveryFee : 0);

  useEffect(() => {
    setIsClient(true);
    // Check for success status from redirect
    if (searchParams.get('status') === 'success') {
      setPaymentSuccess(true);
      clearCart();
    }
  }, [searchParams, clearCart]);

  useEffect(() => {
    // Redirect if cart is empty and not on a success page
    if (cartItems.length === 0 && !paymentSuccess) {
      router.push('/cart');
    }
  }, [cartItems.length, router, paymentSuccess]);

  // Effect to calculate delivery fee
  useEffect(() => {
    if (fulfillmentMethod !== 'delivery' || !deliveryAddress.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setDeliveryFee(null);
      return;
    }

    setFeeLoading(true);
    const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/calculate-fee`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            body: JSON.stringify({ address: deliveryAddress }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Fee calculation error');
          setDeliveryFee(data.fee);
        } catch (err: any) {
          toast.error("Sorry, we can't deliver to that address yet.");
          setDeliveryFee(null);
        } finally {
          setFeeLoading(false);
        }
    }, 1500); // Debounce for 1.5s

    return () => clearTimeout(timer);
  }, [deliveryAddress, customerPhone, fulfillmentMethod]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((fulfillmentMethod === 'delivery' && !deliveryAddress) || !customerName || !customerEmail || !customerPhone) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsProcessing(true);

    try {
      // 1. Create order in our database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          fulfillmentMethod,
          scheduledTime,
          deliveryFee,
          customerInfo: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: deliveryAddress,
          },
        }),
      });
      const { orderId, error: orderError } = await orderRes.json();
      if (orderError) throw new Error(orderError);

      // 2. Create a Square payment link for that order
      const linkRes = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          fulfillmentMethod,
          scheduledTime,
          customerInfo: { name: customerName, email: customerEmail, phone: customerPhone, address: deliveryAddress },
          orderId,
        }),
      });
      const { url, error: linkError } = await linkRes.json();
       
      if (linkError) throw new Error(linkError);
      if (url) router.push(url);

    } catch (error) {
      toast.error('Could not proceed to checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return <PaymentSuccessPage deliveryMethod={fulfillmentMethod} />;
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 pt-4">
        <button 
          onClick={() => router.push('/cart')}
          className="flex items-center font-semibold text-desi-orange hover:text-black transition-colors mb-8 text-base"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Cart</span>
        </button>
        
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold font-display mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm" />
              </div>
            </div>
            {/* Scheduling Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup/Delivery Time</label>
              <div className="flex items-center space-x-4 mb-2">
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="schedule"
                    value="ASAP"
                    checked={scheduledTime === 'ASAP'}
                    onChange={() => setScheduledTime('ASAP')}
                    className="form-radio"
                  />
                  <span>ASAP</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="schedule"
                    value="scheduled"
                    checked={scheduledTime !== 'ASAP'}
                    onChange={() => setScheduledTime(new Date().toISOString().slice(0,16))}
                    className="form-radio"
                  />
                  <span>Scheduled</span>
                </label>
              </div>
              {scheduledTime !== 'ASAP' && (
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm"
                />
              )}
            </div>
            {fulfillmentMethod === 'delivery' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                <AddressAutocomplete onAddressSelect={setDeliveryAddress} />
              </div>
            )}
             <Button
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                className="w-full flex items-center justify-center bg-desi-orange hover:bg-desi-orange/90 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                {isProcessing ? 'Redirecting...' : (
                  <>
                    <Lock size={16} className="mr-2" />
                    Proceed to Secure Payment
                  </>
                )}
              </Button>
          </div>
          {isClient && (
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                tax={tax}
                deliveryFee={fulfillmentMethod === 'delivery' ? deliveryFee : 0}
                total={total}
                feeLoading={feeLoading}
              />
            </div>
          )}
        </form>
      </div>
    </main>
  );
};

export default PaymentPage;