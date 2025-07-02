'use client';
import { useCart, CartItem } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';

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
            onClick={() => setOpenDeliveryModal(true)}
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
      <Dialog open={openDeliveryModal} onOpenChange={setOpenDeliveryModal}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="bg-desi-cream rounded-xl p-8 w-[90vw] max-w-lg shadow-2xl border border-gray-200">
          <DialogHeader className="flex-row justify-between items-center space-y-0 text-left">
            <DialogTitle className="font-display font-semibold text-2xl text-desi-orange text-center">Delivery Not Available</DialogTitle>
            <DialogClose className="hover:bg-gray-100 rounded-full p-1" />
          </DialogHeader>
          <DialogDescription className="mt-2 text-base text-desi-black text-center">
            Sorry for the inconvenience but we are still working on our own delivery service. Please order Pickup, or use one of our delivery partners:
          </DialogDescription>
          <DialogFooter className="justify-center mt-2">
            <div className="flex items-center space-x-2">
              <a href="https://www.doordash.com" target="_blank" rel="noopener noreferrer">
                <Image src="/Doordash.webp" alt="DoorDash" width={100} height={25} className="h-10 w-auto" />
              </a>
              <a href="https://www.grubhub.com" target="_blank" rel="noopener noreferrer">
                <Image src="/Grubhub.webp" alt="Grubhub" width={320} height={20} className="h-15 w-80" />
              </a>
              <a href="https://www.ubereats.com" target="_blank" rel="noopener noreferrer">
                <Image src="/ubereats.png" alt="Uber Eats" width={100} height={25} className="h-10 w-auto" />
              </a>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartSummary; 
