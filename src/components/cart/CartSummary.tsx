'use client';
import { useCart, CartItem } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';

interface CartSummaryProps {
  items: CartItem[];
  deliveryMethod: 'pickup' | 'delivery';
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
}

const CartSummary = ({ items, deliveryMethod, setDeliveryMethod, scheduledTime, setScheduledTime }: CartSummaryProps) => {
  const { getCartTotal } = useCart();
  const router = useRouter();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const deliveryFee = 0;
  const total = subtotal + tax + deliveryFee;
  // Checkout handler
  const handleCheckout = () => {
    if (items.length === 0) return;
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

      {/* Fulfillment Time Section */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Fulfillment Time</h3>
        <div className="flex justify-between items-center">
          <div className="flex w-full border rounded-xl overflow-hidden">
            <button
              className={`w-1/2 py-2 ${scheduledTime === 'ASAP' ? 'bg-desi-orange text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setScheduledTime('ASAP')}
            >
              ASAP
            </button>
            <button
              className={`w-1/2 py-2 ${scheduledTime !== 'ASAP' ? 'bg-desi-orange text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setScheduledTime('')} // Clear to allow custom input
            >
              Pick Time
            </button>
          </div>
        </div>
        {scheduledTime !== 'ASAP' && (
          <div className="mt-2">
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-2 border rounded-xl focus:ring-desi-orange focus:border-desi-orange"
            />
          </div>
        )}
      </div>

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
        disabled={items.length === 0}
        className="w-full mt-6 bg-desi-orange hover:bg-desi-orange/90 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        Proceed to Checkout
      </Button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        To set your delivery location and phone number, continue to the payment page.
      </p>
    </div>
  );
};

export default CartSummary; 
