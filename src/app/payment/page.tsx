'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Calendar, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import OrderSummary from '@/components/payment/OrderSummary';
import { Button } from '@heroui/react';
import dynamicComponent from 'next/dynamic';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { AddressAutocompleteProps } from '@/components/payment/AddressAutocomplete';

export const dynamic = 'force-dynamic';

const AddressAutocomplete = dynamicComponent<AddressAutocompleteProps>(
  () => import('@/components/payment/AddressAutocomplete').then(mod => mod.AddressAutocomplete),
  { ssr: false }
);

const isWithinOperatingHours = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 17 || hour < 1;
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

  const getInitialStartTime = () => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const today5pm = new Date(); today5pm.setHours(17,0,0,0);
    if (now.getHours() >= 1 && now.getHours() < 17) {
      return today5pm;
    }
    return thirtyMinutesFromNow > today5pm ? thirtyMinutesFromNow : today5pm;
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
    if (scheduleType === 'ASAP') setCartScheduledTime('ASAP');
    else setCartScheduledTime(scheduledTime.toISOString());
  }, [scheduleType, scheduledTime, setCartScheduledTime]);

  const filterTime = (time: Date) => {
    const now = new Date();
    const selected = new Date(time);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    if (selected < thirtyMinutesFromNow) return false;
    const hour = selected.getHours();
    return hour >= 17 || hour < 1;
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax + (fulfillmentMethod === 'delivery' && deliveryFee ? deliveryFee : 0);

  useEffect(() => {
    if (
      fulfillmentMethod !== 'delivery' ||
      !deliveryAddress.trim() ||
      customerPhone.replace(/\D/g, '').length < 10
    ) {
      setDeliveryFee(null);
      return;
    }
    if (!isGoogleAddress) {
      setDeliveryFee(null);
      toast.error('The delivery address is in invalid format. Please select an address from the suggestions.');
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
          body: JSON.stringify({ address: deliveryAddress, dropoffPhoneNumber: customerPhone.replace(/\D/g, '') }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fee calculation error');
        setDeliveryFee(data.fee);
      } catch {
        toast.error("Sorry, we can't deliver to that address yet.");
        setDeliveryFee(null);
      } finally {
        setFeeLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [deliveryAddress, customerPhone, fulfillmentMethod, isGoogleAddress]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleType==='ASAP' && !isWithinOperatingHours()) { toast.error('ASAP orders unavailable',{description:'Open 5 PM to 1 AM.'}); setCanOrderASAP(false); setScheduleType('scheduled'); return; }
    if ((fulfillmentMethod==='delivery' && !deliveryAddress) || !customerName || !customerEmail || !customerPhone) { toast.error('Please fill in all required fields.'); return; }
    setIsProcessing(true);
    try {
      const finalScheduledTime = scheduleType === 'ASAP' ? 'ASAP' : scheduledTime.toISOString();
      const orderRes = await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cartItems,fulfillmentMethod,scheduledTime:finalScheduledTime,deliveryFee,customerInfo:{name:customerName,email:customerEmail,phone:customerPhone,address:deliveryAddress}})});
      const {orderId,error:orderError} = await orderRes.json(); if(orderError) throw new Error(orderError);
      const linkRes = await fetch('/api/create-payment-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cartItems,fulfillmentMethod,scheduledTime:finalScheduledTime,customerInfo:{name:customerName,email:customerEmail,phone:customerPhone,address:deliveryAddress},orderId})});
      const {url,error:linkError} = await linkRes.json(); if(linkError) throw new Error(linkError);
      if(url) router.push(url);
    } catch { toast.error('Could not proceed to checkout. Please try again.'); setIsProcessing(false); }
  };

  const handleDeliveryAddressChange = (val: string) => {
    setDeliveryAddress(val);
    setIsGoogleAddress(false);
  };

  const handleGoogleAddressSelect = (val: string) => {
    setDeliveryAddress(val);
    setIsGoogleAddress(true);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 pt-4">
        <button onClick={()=>router.push('/cart')} className="flex items-center font-semibold text-desi-orange hover:text-black transition-colors mb-8 text-base"><ArrowLeft size={16} className="mr-1"/><span>Back to Cart</span></button>
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold font-display mb-4">Customer Information</h2>
            <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" id="name" value={customerName} onChange={e=>setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm"/></div>
            {isClient&&fulfillmentMethod==='delivery'&&<div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label><AddressAutocomplete value={deliveryAddress} onValueChange={handleDeliveryAddressChange} onAddressSelect={handleGoogleAddressSelect}/></div>}
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" id="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm"/></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label><input type="tel" id="phone" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Pickup/Delivery Time</label><div className="flex items-center space-x-4 mb-3"><label className={`flex items-center space-x-2 ${canOrderASAP?'cursor-pointer':'cursor-not-allowed opacity-50'}`}><input type="radio" name="scheduleType" value="ASAP" checked={scheduleType==='ASAP'} onChange={()=>setScheduleType('ASAP')} className="form-radio text-desi-orange focus:ring-desi-orange" disabled={!canOrderASAP}/><span>ASAP</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="scheduleType" value="scheduled" checked={scheduleType==='scheduled'} onChange={()=>setScheduleType('scheduled')} className="form-radio text-desi-orange focus:ring-desi-orange"/><span>Schedule for later</span></label></div>{!canOrderASAP&&isClient&&<p className="text-xs text-gray-500 -mt-2 mb-3">ASAP orders are only available from 5 PM to 1 AM.</p>}{scheduleType==='scheduled'&&<div className="relative"><DatePicker selected={scheduledTime} onChange={(date: Date | null) => date && setScheduledTime(date)} showTimeSelect minDate={new Date()} filterTime={filterTime} dateFormat="MMMM d, yyyy h:mm aa" timeIntervals={30} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm pl-10" placeholderText="Select a date and time"/><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/></div>}</div><Button type="submit" disabled={isProcessing||cartItems.length===0||(fulfillmentMethod==='delivery'&&(feeLoading||deliveryFee===null))} className="w-full flex items-center justify-center bg-desi-orange hover:bg-desi-orange/90 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70">{isProcessing?'Redirecting...':<><Lock size={16} className="mr-2"/>Proceed to Secure Payment</>}</Button></div>{isClient&&<div className="lg:col-span-1"><OrderSummary subtotal={subtotal} tax={tax} deliveryFee={fulfillmentMethod==='delivery'?deliveryFee:0} total={total} feeLoading={feeLoading}/></div>}</form></div></main>
  );
}

export default function PaymentPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-20 bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
} 