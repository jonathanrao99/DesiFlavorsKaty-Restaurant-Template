'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from "@heroui/react";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/context/CartContext";
import { useRouter } from 'next/navigation';
import { addToast, Input } from '@heroui/react';
import { MapPin } from 'lucide-react';
import ReturningCustomer from '@/components/cart/ReturningCustomer';

// Types for Google Places Autocomplete
interface AutocompletePrediction { description: string; }
interface AutocompleteResponse { status: string; predictions: AutocompletePrediction[]; }

// Allow TypeScript to recognize the Google Maps `google` global
declare global {
  interface Window { google?: any; }
}

interface CartSummaryProps {
  items: CartItem[];
  deliveryMethod: 'pickup' | 'delivery';
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void;
}

const CartSummary = ({ items, deliveryMethod, setDeliveryMethod }: CartSummaryProps) => {
  const { getCartTotal } = useCart();
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(deliveryMethod === 'pickup' ? 0 : null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize Google Places Autocomplete when delivery enabled
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !inputRef.current) return;
    const loadSDK = () => {
      const googleObj = (window as any).google;
      const autocomplete = new googleObj.maps.places.Autocomplete(inputRef.current!, { types: ['address'] });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setDeliveryAddress(place.formatted_address);
          calculateFee(place.formatted_address);
        }
      });
    };
    const scriptId = 'google-maps-script';
    if (!(window as any).google) {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = loadSDK;
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', loadSDK);
      }
    } else {
      loadSDK();
    }
  }, [deliveryMethod]);

  // fee is now calculated explicitly via calculateFee helper
  const calculateFee = async (addr: string) => {
    setIsCalculating(true);
    const placeholderPhone = '2055030985';
    console.log('calculateFee request payload:', JSON.stringify({ address: addr, dropoffPhoneNumber: placeholderPhone }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/calculate-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        body: JSON.stringify({ address: addr, dropoffPhoneNumber: placeholderPhone }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Fee error');
      setCalculatedFee(body.fee);
    } catch (error: unknown) {
      console.error('Delivery fee calculation error:', error);
      const defaultFee = 9.99;
      setCalculatedFee(defaultFee);
      // Notify user that a default fee is used
      addToast({
        title: 'Using default delivery fee',
        description: `Applying flat delivery fee of $${defaultFee.toFixed(2)}.`,
        color: 'warning',
        classNames: { wrapper: 'max-w-xs border border-desi-orange bg-desi-cream px-4 py-2 rounded shadow-lg' }
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-detect user location and reverse-geocode to address
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      addToast({ title: 'Error', description: 'Geolocation not supported', color: 'warning', classNames: { wrapper: 'max-w-xs rounded-lg shadow-lg' } });
      return;
    }
    setIsCalculating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Try Google reverse-geocode first
          let display = '';
          try {
            const gRes = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const gJson = await gRes.json();
            display = gJson.results?.[0]?.formatted_address || '';
          } catch {
            display = '';
          }
          // Fallback to Nominatim if Google failed
          if (!display) {
            const nRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const nJson = await nRes.json();
            display = nJson.display_name || '';
          }
          if (!display) throw new Error('Unable to determine your location');
          setDeliveryAddress(display);
          calculateFee(display);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          addToast({ title: 'Error', description: msg, color: 'danger', classNames: { wrapper: 'max-w-xs border border-desi-orange bg-desi-cream px-4 py-2 rounded shadow-lg' } });
        } finally {
          setIsCalculating(false);
        }
      },
      (err) => {
        addToast({ title: 'Error', description: err.message, color: 'danger', classNames: { wrapper: 'max-w-xs border border-desi-orange bg-desi-cream px-4 py-2 rounded shadow-lg' } });
        setIsCalculating(false);
      }
    );
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const deliveryFee = 0;
  const total = subtotal + tax + deliveryFee;
  // Checkout handler
  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    if (deliveryMethod === 'delivery') {
      if (!deliveryAddress) {
        addToast({ title: 'Missing address', description: 'Please enter a delivery address before proceeding.', color: 'danger' });
        return;
      }
      if (calculatedFee === null) {
        addToast({ title: 'Fee not calculated', description: 'Please calculate the delivery fee before proceeding.', color: 'danger' });
        return;
      }
    }
    router.push('/payment');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-0">
      <h2 className="font-playfair font-medium text-lg mb-4">Order Summary</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex w-full border rounded-xl overflow-hidden">
          <button
            className={`w-1/2 py-2 ${deliveryMethod === 'pickup' ? 'bg-desi-orange text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setDeliveryMethod('pickup')}
          >
            Pickup
          </button>
          <button
            className={`w-1/2 py-2 ${deliveryMethod === 'delivery' ? 'bg-desi-orange text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setDeliveryMethod('delivery')}
          >
            Delivery
          </button>
        </div>
      </div>

      {deliveryMethod === 'delivery' && (
        <div className="mt-4 space-y-2 relative">
          <label htmlFor="delivery-address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
          <div className="relative">
            <Input
              id="delivery-address"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              ref={inputRef}
              placeholder="Enter your delivery address"
              className="block w-full pr-10 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-desi-orange focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-600 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            Delivery fee will be calculated at checkout after you enter your phone number.
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (8.25%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 font-medium text-lg">
          <span>Total</span>
          <span className="text-desi-orange">${total.toFixed(2)}</span>
        </div>
      </div>
      
      <Button
        onClick={handleCheckout}
        disabled={
          items.length === 0 ||
          (deliveryMethod === 'delivery' && (!deliveryAddress || calculatedFee === null))
        }
        className="w-full mt-6 bg-desi-orange hover:bg-desi-orange/90 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        Proceed to Checkout
      </Button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Delivery orders typically arrive within 30-45 minutes.
      </p>
    </div>
  );
};

export default CartSummary; 
