'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Calendar, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import OrderSummaryClean from '@/components/payment/OrderSummaryClean';
import { Button } from '@heroui/react';
import dynamicComponent from 'next/dynamic';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { AddressAutocompleteProps } from '@/components/payment/AddressAutocomplete';
import { calculateDistanceFee } from '@/lib/deliveryFee';
import { ordersApi, paymentApi } from '@/lib/supabaseFunctions';

export const dynamic = 'force-dynamic';

const AddressAutocomplete = dynamicComponent<AddressAutocompleteProps>(
  () => import('@/components/payment/AddressAutocomplete').then(mod => mod.AddressAutocomplete),
  { ssr: false }
);

const isWithinOperatingHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  // 5:30 PM to 12:30 AM
  return (hour === 17 && minute >= 30) || (hour >= 18) || (hour === 0 && minute <= 30);
};

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, getCartTotal, clearCart, fulfillmentMethod, setFulfillmentMethod } = useCart();
  const { scheduledTime: cartScheduledTime, setScheduledTime: setCartScheduledTime } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [canOrderASAP, setCanOrderASAP] = useState(false);
  const [scheduleType, setScheduleType] = useState<'ASAP' | 'scheduled'>('scheduled');
  const [isGoogleAddress, setIsGoogleAddress] = useState(false);
  const [invalidToastShown, setInvalidToastShown] = useState(false);

  const getInitialStartTime = () => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Set today at 5:30 PM
    const today530pm = new Date(); 
    today530pm.setHours(17, 30, 0, 0);
    
    // If it's before 5:30 PM today, return 5:30 PM today
    if (now < today530pm) {
      return today530pm;
    }
    
    // If it's after 5:30 PM, return the later of: 30 minutes from now or 5:30 PM
    const minimumTime = thirtyMinutesFromNow > today530pm ? thirtyMinutesFromNow : today530pm;
    
    // Round to next 30-minute interval
    const minutes = minimumTime.getMinutes();
    if (minutes > 0 && minutes < 30) {
      minimumTime.setMinutes(30, 0, 0);
    } else if (minutes > 30) {
      minimumTime.setHours(minimumTime.getHours() + 1, 0, 0, 0);
    }
    
    return minimumTime;
  };

  const [scheduledTime, setScheduledTime] = useState<Date>(getInitialStartTime());

  useEffect(() => {
    setIsClient(true);
    const canOrderNow = isWithinOperatingHours();
    setCanOrderASAP(canOrderNow);
    if (canOrderNow) setScheduleType('ASAP');
  }, []);

  useEffect(() => {
    if (isClient && cartItems.length === 0) router.push('/cart');
  }, [cartItems.length, router, isClient]);

  useEffect(() => {
    if (scheduleType === 'ASAP' && cartScheduledTime !== 'ASAP') {
      setCartScheduledTime('ASAP');
    } else if (scheduleType !== 'ASAP') {
      const iso = scheduledTime.toISOString();
      if (cartScheduledTime !== iso) setCartScheduledTime(iso);
    }
  }, [scheduleType, scheduledTime, setCartScheduledTime, cartScheduledTime]);

  const filterTime = (time: Date) => {
    const now = new Date();
    const selected = new Date(time);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Must be at least 30 minutes from now
    if (selected < thirtyMinutesFromNow) return false;
    
    const hour = selected.getHours();
    const minute = selected.getMinutes();
    
    // Only allow 30-minute intervals
    if (minute !== 0 && minute !== 30) return false;
    
    // Business hours: 5:30 PM to 12:30 AM
    return (hour === 17 && minute >= 30) || (hour >= 18 && hour <= 23) || (hour === 0 && minute <= 30);
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax + (fulfillmentMethod === 'delivery' && deliveryFee ? deliveryFee : 0);

  // Fallback delivery fee (in USD) when calculation fails
  const FALLBACK_DELIVERY_FEE = 5;

  useEffect(() => {
    // Reset invalid toast when address changes
    setInvalidToastShown(false);
    
    // Only calculate fee for delivery orders
    if (fulfillmentMethod !== 'delivery') {
      setDeliveryFee(null);
      return;
    }

    // Check if we have the required fields
    if (!deliveryAddress.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setDeliveryFee(null);
      return;
    }

    // Validate address format - either from Google suggestions or manually entered with basic validation
    const isValidAddressFormat = isGoogleAddress || 
      (deliveryAddress.includes(',') && 
       deliveryAddress.toLowerCase().includes('tx') && 
       deliveryAddress.length > 20);

    if (!isValidAddressFormat) {
      setDeliveryFee(null);
      if (!invalidToastShown) {
        toast.error('Please enter a complete address including city and state, or select from Google suggestions.');
        setInvalidToastShown(true);
      }
      return;
    }

    // Calculate delivery fee
    setFeeLoading(true);
    const fee = async () => {
      try {
        console.log('Calculating delivery fee for:', { address: deliveryAddress, phone: customerPhone, isGoogleAddress });
        
        const fee = await calculateDistanceFee(deliveryAddress, customerPhone, new Date());
        console.log('Fee calculation response:', fee);
        
        if (typeof fee !== 'number') {
          throw new Error('Fee calculation failed');
        }
        
        return fee;
      } catch (error) {
        console.error('Delivery fee calculation error:', error);
        // Apply fallback fee on error
        return FALLBACK_DELIVERY_FEE;
      } finally {
        setFeeLoading(false);
      }
    };

    fee().then(setDeliveryFee);
  }, [deliveryAddress, customerPhone, fulfillmentMethod, isGoogleAddress, invalidToastShown]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (scheduleType === 'ASAP' && !isWithinOperatingHours()) { 
      toast.error('ASAP orders unavailable', { description: 'Open 5:30 PM to 12:30 AM.' }); 
      setCanOrderASAP(false); 
      setScheduleType('scheduled'); 
      return; 
    }
    
    if ((fulfillmentMethod === 'delivery' && (!deliveryAddress || deliveryFee === null)) || !customerName || !customerEmail || !customerPhone) { 
      toast.error('Please fill in all required fields, including a valid delivery address and phone number.'); 
      return; 
    }
    
    setIsProcessing(true);
    
    try {
      const finalScheduledTime = scheduleType === 'ASAP' ? 'ASAP' : scheduledTime.toISOString();
      
      // Create order first using Supabase Edge Function
      const orderData = {
        cartItems,
        fulfillmentMethod,
        scheduledTime: finalScheduledTime,
        deliveryFee,
        customerInfo: { 
          name: customerName, 
          email: customerEmail, 
          phone: customerPhone, 
          address: deliveryAddress 
        }
      };
      
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const { orderId, error: orderError } = await orderRes.json();
      if (orderError) throw new Error(orderError);
      
      // Create payment link using Supabase Edge Function
      const paymentLinkData = {
        cartItems,
        fulfillmentMethod,
        scheduledTime: finalScheduledTime,
        deliveryFee,
        customerInfo: { 
          name: customerName, 
          email: customerEmail, 
          phone: customerPhone, 
          address: deliveryAddress 
        },
        orderId
      };
      
      console.log('Creating payment link with data:', paymentLinkData);
      
      const { url, error: linkError } = await paymentApi.createPaymentLink(paymentLinkData);
      if (linkError) throw new Error(linkError);
      
      if (url) {
        console.log('Redirecting to payment URL:', url);
        router.push(url);
      }
    } catch (error) { 
      console.error('Checkout error:', error);
      toast.error('Could not proceed to checkout. Please try again.'); 
      setIsProcessing(false); 
    }
  };

  const handleDeliveryAddressChange = (val: string) => {
    setDeliveryAddress(val);
    setIsGoogleAddress(false);
  };

  const handleGoogleAddressSelect = (val: string) => {
    setDeliveryAddress(val);
    setIsGoogleAddress(true);
    setInvalidToastShown(false);
  };

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
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm"
              />
            </div>
            
            {isClient && fulfillmentMethod === 'delivery' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                <AddressAutocomplete 
                  value={deliveryAddress} 
                  onValueChange={handleDeliveryAddressChange} 
                  onAddressSelect={handleGoogleAddressSelect}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={customerEmail} 
                onChange={e => setCustomerEmail(e.target.value)} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value)} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup/Delivery Time</label>
              <div className="flex items-center space-x-4 mb-3">
                <label className={`flex items-center space-x-2 ${canOrderASAP ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input 
                    type="radio" 
                    name="scheduleType" 
                    value="ASAP" 
                    checked={scheduleType === 'ASAP'} 
                    onChange={() => setScheduleType('ASAP')} 
                    className="form-radio text-desi-orange focus:ring-desi-orange" 
                    disabled={!canOrderASAP}
                  />
                  <span>ASAP</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scheduleType" 
                    value="scheduled" 
                    checked={scheduleType === 'scheduled'} 
                    onChange={() => setScheduleType('scheduled')} 
                    className="form-radio text-desi-orange focus:ring-desi-orange"
                  />
                  <span>Schedule for later</span>
                </label>
              </div>
              
              {!canOrderASAP && isClient && (
                <p className="text-xs text-gray-500 -mt-2 mb-3">
                  ASAP orders are only available from 5:30 PM to 12:30 AM.
                </p>
              )}
              
              {scheduleType === 'scheduled' && (
                <div className="relative">
                  <DatePicker 
                    selected={scheduledTime} 
                    onChange={(date: Date | null) => date && setScheduledTime(date)} 
                    showTimeSelect 
                    minDate={new Date()} 
                    filterTime={filterTime} 
                    dateFormat="MMMM d, yyyy h:mm aa" 
                    timeIntervals={30} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm pl-10" 
                    placeholderText="Select a date and time"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={isProcessing || cartItems.length === 0 || (fulfillmentMethod === 'delivery' && (feeLoading || deliveryFee == null))} 
              className="w-full flex items-center justify-center bg-desi-orange hover:bg-desi-orange/90 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" />
                  Proceed to Secure Payment
                </>
              )}
            </Button>
          </div>
          
          {isClient && (
            <div className="lg:col-span-1">
              <OrderSummaryClean />
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default function PaymentPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
} 