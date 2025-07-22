'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Calendar, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import OrderSummaryClean from '@/components/payment/OrderSummaryClean';
import { Button } from '@/components/ui/button';
import { calculateDistanceFee } from '@/lib/deliveryFee';
import { ordersApi, paymentApi } from '@/lib/supabaseFunctions';
import { supabase } from '@/integrations/supabase/client';
import { AddressAutocomplete } from '@/components/payment/AddressAutocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const dynamic = 'force-dynamic';

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
  const invalidToastShownRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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


  // State for tracking if user has triggered validation
  const [addressValidationTriggered, setAddressValidationTriggered] = useState(false);
  const [lastValidatedAddress, setLastValidatedAddress] = useState('');

  useEffect(() => {
    // Reset invalid toast when address changes
    invalidToastShownRef.current = false;
    
    console.log('Fulfillment method:', fulfillmentMethod);
    
    // Auto-set to delivery if there's a delivery address
    if (deliveryAddress.trim() && fulfillmentMethod === 'pickup') {
      setFulfillmentMethod('delivery');
      return;
    }
    
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

    // Only proceed if validation was triggered by user action
    if (!addressValidationTriggered) {
      return;
    }

    // Clear the trigger flag
    setAddressValidationTriggered(false);

    // Validate address format - manually entered with basic validation
    const isValidAddressFormat = deliveryAddress.length > 10 && 
      (deliveryAddress.toLowerCase().includes('tx') || 
       deliveryAddress.toLowerCase().includes('texas') || 
       deliveryAddress.toLowerCase().includes('katy') ||
       deliveryAddress.toLowerCase().includes('houston'));

    console.log('Address validation:', {
      deliveryAddress,
      hasTx: deliveryAddress.toLowerCase().includes('tx'),
      hasTexas: deliveryAddress.toLowerCase().includes('texas'),
      hasKaty: deliveryAddress.toLowerCase().includes('katy'),
      hasHouston: deliveryAddress.toLowerCase().includes('houston'),
      length: deliveryAddress.length,
      isValidAddressFormat
    });

    if (!isValidAddressFormat) {
      setDeliveryFee(null);
      if (!invalidToastShownRef.current) {
        toast.error('Please enter a complete address including city and state, or select from Google suggestions.');
        invalidToastShownRef.current = true;
      }
      return;
    }

    // Calculate delivery fee
    setFeeLoading(true);
    console.log('Starting delivery fee calculation for:', { deliveryAddress, customerPhone });
    
    const fee = async () => {
      try {
        
        const fee = await calculateDistanceFee(deliveryAddress, customerPhone, new Date());
        console.log('Delivery fee calculation result:', fee);
        
        if (typeof fee !== 'number') {
          throw new Error('Fee calculation failed');
        }
        
        return fee;
      } catch (error) {
        console.error('Delivery fee calculation failed:', error);
        // Show user-friendly error message
        toast.error('Oops! There seems to be a problem calculating your delivery fee. Please try again later.');
        throw error; // Re-throw to prevent setting any fee
      } finally {
        setFeeLoading(false);
      }
    };

    fee().then((result) => {
      console.log('Setting delivery fee to:', result);
      setDeliveryFee(result);
      setLastValidatedAddress(deliveryAddress);
    }).catch((error) => {
      console.error('Error in fee promise:', error);
      setDeliveryFee(null); // Don't set any fee on error
      setFeeLoading(false);
    });
  }, [deliveryAddress, customerPhone, fulfillmentMethod, addressValidationTriggered]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (scheduleType === 'ASAP' && !isWithinOperatingHours()) { 
      toast.error('ASAP orders unavailable', { description: 'Open 5:30 PM to 12:30 AM.' }); 
      setCanOrderASAP(false); 
      setScheduleType('scheduled'); 
      return; 
    }
    
    if ((fulfillmentMethod === 'delivery' && (!deliveryAddress || deliveryFee === null)) || !customerName || !customerEmail || !customerPhone) { 
      if (fulfillmentMethod === 'delivery' && deliveryFee === null) {
        toast.error('Please enter your delivery address and press Enter or select from Google suggestions to calculate the delivery fee.'); 
      } else {
      toast.error('Please fill in all required fields, including a valid delivery address and phone number.'); 
      }
      return; 
    }
    
    setIsProcessing(true);
    
    try {
      const finalScheduledTime = scheduleType === 'ASAP' ? 'ASAP' : scheduledTime.toISOString();
      
      // Prepare order data for Supabase
      const orderData = {
        items: cartItems,
        order_type: fulfillmentMethod,
        scheduled_time: finalScheduledTime,
        delivery_fee: deliveryFee,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        status: 'pending',
        total_amount: subtotal + tax + (fulfillmentMethod === 'delivery' && deliveryFee ? deliveryFee : 0),
        // special_instructions is handled per item or in the cart, not here
      };

      // Insert order directly into Supabase
      const { data, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      const orderRow = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (orderError || !orderRow) throw new Error(orderError?.message || 'Order creation failed');
      const orderId = (orderRow as any).id;
      
      // Create payment link using Supabase Edge Function
      console.log('Sending cart items to payment link:', cartItems);
      console.log('Delivery fee being sent:', deliveryFee);
      console.log('Fulfillment method:', fulfillmentMethod);
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
      
      const { url, error: linkError } = await paymentApi.createPaymentLink(paymentLinkData);
      if (linkError) throw new Error(linkError);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) { 
      toast.error('Could not proceed to checkout. Please try again.'); 
      setIsProcessing(false); 
    }
  };

  const handleDeliveryAddressChange = (val: string) => {
    setDeliveryAddress(val);
    
    // Auto-switch to delivery if there's a meaningful address
    if (val.trim().length > 5 && fulfillmentMethod === 'pickup') {
      setFulfillmentMethod('delivery');
    }
    
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Trigger calculation immediately when user types a complete address
    if (val.trim().length > 15 && !feeLoading) {
      // Debounce the calculation to avoid too many API calls
      debounceTimeoutRef.current = setTimeout(async () => {
        console.log('Auto-triggering calculation for typed address:', val);
        setFeeLoading(true);
        
        try {
          // Use a placeholder phone number for calculation if customer hasn't entered one yet
          const phoneForCalculation = customerPhone.replace(/\D/g, '').length >= 10 
            ? customerPhone 
            : '+13468244212'; // Use store phone as placeholder
          
          const fee = await calculateDistanceFee(val, phoneForCalculation, new Date());
          console.log('Auto-triggered delivery fee calculation result:', fee);
          
          if (typeof fee === 'number') {
            setDeliveryFee(fee);
            setLastValidatedAddress(val);
          } else {
            throw new Error('Invalid fee result');
          }
        } catch (error) {
          console.error('Auto-triggered delivery fee calculation failed:', error);
          // Don't show error toast for auto-triggered calculations
        } finally {
          setFeeLoading(false);
        }
      }, 1000); // 1 second debounce
    }
  };

  const handleDeliveryAddressBlur = async () => {
    // Start calculation immediately when user finishes typing (on blur) (no phone requirement)
    if (deliveryAddress.trim().length > 10) {
      setFeeLoading(true);
      console.log('Starting immediate delivery fee calculation for blur:', deliveryAddress);
      
      try {
        // Use a placeholder phone number for calculation if customer hasn't entered one yet
        const phoneForCalculation = customerPhone.replace(/\D/g, '').length >= 10 
          ? customerPhone 
          : '+13468244212'; // Use store phone as placeholder
        
        const fee = await calculateDistanceFee(deliveryAddress, phoneForCalculation, new Date());
        console.log('Blur delivery fee calculation result:', fee);
        
        if (typeof fee === 'number') {
          setDeliveryFee(fee);
          setLastValidatedAddress(deliveryAddress);
        } else {
          throw new Error('Invalid fee result');
        }
      } catch (error) {
        console.error('Blur delivery fee calculation failed:', error);
        toast.error('Oops! There seems to be a problem calculating your delivery fee. Please try again later.');
        setDeliveryFee(null);
      } finally {
        setFeeLoading(false);
      }
    }
  };

  const handleDeliveryAddressClick = async () => {
    // Trigger calculation when user clicks on the address field (backup method)
    if (deliveryAddress.trim().length > 10 && !feeLoading) {
      console.log('Address field clicked, triggering calculation for:', deliveryAddress);
      setFeeLoading(true);
      
      try {
        // Use a placeholder phone number for calculation if customer hasn't entered one yet
        const phoneForCalculation = customerPhone.replace(/\D/g, '').length >= 10 
          ? customerPhone 
          : '+13468244212'; // Use store phone as placeholder
        
        const fee = await calculateDistanceFee(deliveryAddress, phoneForCalculation, new Date());
        console.log('Click delivery fee calculation result:', fee);
        
        if (typeof fee === 'number') {
          setDeliveryFee(fee);
          setLastValidatedAddress(deliveryAddress);
        } else {
          throw new Error('Invalid fee result');
        }
      } catch (error) {
        console.error('Click delivery fee calculation failed:', error);
        toast.error('Oops! There seems to be a problem calculating your delivery fee. Please try again later.');
        setDeliveryFee(null);
      } finally {
        setFeeLoading(false);
      }
    }
  };

  const handleDeliveryAddressFocus = async () => {
    // Trigger calculation when user focuses on the address field (another backup method)
    if (deliveryAddress.trim().length > 10 && !feeLoading) {
      console.log('Address field focused, triggering calculation for:', deliveryAddress);
      setFeeLoading(true);
      
      try {
        // Use a placeholder phone number for calculation if customer hasn't entered one yet
        const phoneForCalculation = customerPhone.replace(/\D/g, '').length >= 10 
          ? customerPhone 
          : '+13468244212'; // Use store phone as placeholder
        
        const fee = await calculateDistanceFee(deliveryAddress, phoneForCalculation, new Date());
        console.log('Focus delivery fee calculation result:', fee);
        
        if (typeof fee === 'number') {
          setDeliveryFee(fee);
          setLastValidatedAddress(deliveryAddress);
        } else {
          throw new Error('Invalid fee result');
        }
      } catch (error) {
        console.error('Focus delivery fee calculation failed:', error);
        toast.error('Oops! There seems to be a problem calculating your delivery fee. Please try again later.');
        setDeliveryFee(null);
      } finally {
        setFeeLoading(false);
      }
    }
  };

  const handleGoogleAddressSelect = async (val: string) => {
    setDeliveryAddress(val);
    invalidToastShownRef.current = false;

    // Auto-switch to delivery for Google addresses
    if (fulfillmentMethod === 'pickup') {
      setFulfillmentMethod('delivery');
    }

    // Start calculation immediately for Google suggestions (no phone requirement)
    setFeeLoading(true);
    console.log('Starting immediate delivery fee calculation for Google address:', val);

    try {
      // Use a placeholder phone number for calculation if customer hasn't entered one yet
      const phoneForCalculation = customerPhone.replace(/\D/g, '').length >= 10 
        ? customerPhone 
        : '+13468244212'; // Use store phone as placeholder

      const fee = await calculateDistanceFee(val, phoneForCalculation, new Date());
      console.log('Google address delivery fee calculation result:', fee);

      if (typeof fee === 'number') {
        setDeliveryFee(fee);
        setLastValidatedAddress(val);
      } else {
        throw new Error('Invalid fee result');
      }
    } catch (error) {
      console.error('Google address delivery fee calculation failed:', error);

      // If it's a timeout error, show a more specific message
      if (error.message.includes('timed out')) {
        toast.error('Delivery fee calculation is taking longer than expected. Please try again.');
      } else {
        toast.error('Oops! There seems to be a problem calculating your delivery fee. Please try again later.');
      }
      setDeliveryFee(null);
    } finally {
      setFeeLoading(false);
    }
  };

  const handleAddressKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Start calculation immediately for Enter key (no phone requirement)
      if (deliveryAddress.trim()) {
        setFeeLoading(true);
        console.log('Starting immediate delivery fee calculation for Enter key:', deliveryAddress);
        
        try {
          // Use a placeholder phone number for calculation if customer hasn't entered one yet
          const phoneForCalculation = customerPhone.replace(/\D/g, '').length >= 10 
            ? customerPhone 
            : '+13468244212'; // Use store phone as placeholder
          
          const fee = await calculateDistanceFee(deliveryAddress, phoneForCalculation, new Date());
          console.log('Enter key delivery fee calculation result:', fee);
          
          if (typeof fee === 'number') {
            setDeliveryFee(fee);
            setLastValidatedAddress(deliveryAddress);
          } else {
            throw new Error('Invalid fee result');
          }
        } catch (error) {
          console.error('Enter key delivery fee calculation failed:', error);
          toast.error('Oops! There seems to be a problem calculating your delivery fee. Please try again later.');
          setDeliveryFee(null);
        } finally {
          setFeeLoading(false);
        }
      }
    }
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
                  onKeyPress={handleAddressKeyPress}
                  onBlur={handleDeliveryAddressBlur}
                  onClick={handleDeliveryAddressClick}
                  onFocus={handleDeliveryAddressFocus}
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
                    onChange={(date: Date) => setScheduledTime(date)}
                    showTimeSelect
                    showTimeSelectOnly={false}
                    timeIntervals={30}
                    minDate={new Date()}
                    minTime={(() => {
                      const d = new Date(scheduledTime);
                      d.setHours(17, 30, 0, 0); // 5:30 PM
                      return d;
                    })()}
                    maxTime={(() => {
                      const d = new Date(scheduledTime);
                      if (d.getHours() < 12) {
                        d.setHours(0, 30, 0, 0); // 12:30 AM
                      } else {
                        d.setHours(23, 59, 59, 999); // End of day for PM
                      }
                      return d;
                    })()}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm pl-10 cursor-pointer"
                    placeholderText="Select a date and time"
                    onCalendarOpen={() => {}}
                    onCalendarClose={() => {}}
                    wrapperClassName="w-full"
                    popperPlacement="bottom"
                    shouldCloseOnSelect={true}
                    filterTime={(date) => {
                      const hour = date.getHours();
                      const minute = date.getMinutes();
                      // Allow 5:30 PM to 12:30 AM
                      return (
                        (hour === 17 && minute >= 30) ||
                        (hour >= 18 && hour <= 23) ||
                        (hour === 0 && minute <= 30)
                      );
                    }}
                    customInput={
                      <div className="relative w-full">
                        <input
                          readOnly
                          value={scheduledTime ? scheduledTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-0 focus:outline-none sm:text-sm pl-10 cursor-pointer"
                          placeholder="Select a date and time"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    }
                  />
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
              <OrderSummaryClean deliveryFee={deliveryFee} feeLoading={feeLoading} />
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