'use client';
import { useState, useEffect } from 'react';
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

interface CartSummaryProps {
  items: CartItem[];
  deliveryMethod: 'pickup' | 'delivery';
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void;
}

const CartSummary = ({ items, deliveryMethod, setDeliveryMethod }: CartSummaryProps) => {
  const { getCartTotal } = useCart();
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(deliveryMethod === 'pickup' ? 0 : null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Fetch address suggestions using Google Places Autocomplete
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !deliveryAddress) {
      setSuggestions([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(deliveryAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&types=address`
        );
        const data = (await res.json()) as AutocompleteResponse;
        if (data.status === 'OK') {
          setSuggestions(data.predictions.map(p => p.description));
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [deliveryAddress, deliveryMethod]);

  // fee is now calculated explicitly via calculateFee helper
  const calculateFee = async (addr: string) => {
    setIsCalculating(true);
    setAddressError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}/calculate-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        body: JSON.stringify({ address: addr }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Fee error');
      setCalculatedFee(body.fee);
    } catch (error: unknown) {
      console.error(error);
      setCalculatedFee(null);
      if (error instanceof Error) setAddressError(error.message);
      else setAddressError(String(error));
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-detect user location and reverse-geocode to address
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setAddressError('Geolocation not supported');
      return;
    }
    setIsCalculating(true);
    setAddressError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const json = await res.json();
          const display = json.results?.[0]?.formatted_address;
          if (!display) throw new Error('Unable to reverse geocode');
          setDeliveryAddress(display);
          calculateFee(display);
        } catch (err: unknown) {
          if (err instanceof Error) setAddressError(err.message);
          else setAddressError(String(err));
        } finally {
          setIsCalculating(false);
        }
      },
      (err) => {
        setAddressError(err.message);
        setIsCalculating(false);
      }
    );
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const deliveryFee = deliveryMethod === 'delivery' ? (calculatedFee !== null ? calculatedFee : 0) : 0;
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
      <h2 className="font-display font-medium text-lg mb-4">Order Summary</h2>
      
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
              placeholder="Enter your delivery address"
              className="pr-10"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
              <MapPin className="w-5 h-5" />
            </button>
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border border-gray-200 w-full mt-1 max-h-40 overflow-auto z-10">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => { setDeliveryAddress(s); setSuggestions([]); calculateFee(s); }}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
          {isCalculating && <p className="text-gray-600 text-sm">Detecting location...</p>}
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
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
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
