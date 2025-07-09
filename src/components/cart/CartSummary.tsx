'use client';
import { useCart, CartItem } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

interface CartSummaryProps {
  items: CartItem[];
  deliveryMethod: 'pickup' | 'delivery';
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void;
}

const CartSummary = ({ items, deliveryMethod, setDeliveryMethod }: CartSummaryProps) => {
  const { getCartTotal } = useCart();
  const router = useRouter();
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);

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

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Taxes (8.25%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        {deliveryMethod === 'delivery' && (
          <div className="text-center text-sm text-gray-500">
            Delivery will be calculated at checkout
          </div>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-3 font-medium text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
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
