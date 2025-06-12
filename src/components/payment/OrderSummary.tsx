"use client";
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { CartItem } from '@/context/CartContext';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  total,
  deliveryMethod
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 transition-shadow duration-300 ease-in-out hover:shadow-lg animate-fade-in">
      <h2 className="font-display font-bold text-lg mb-4 pb-2 border-b text-black">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between">
            <span className="text-black">
              {item.quantity} x {item.name}
            </span>
            <span>
              ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="space-y-3 border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between">
          <span className="text-black">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (8.25%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        {deliveryMethod === 'delivery' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between border-t border-gray-200 pt-4 font-medium text-lg">
        <span>Total</span>
        <span className="text-desi-orange">${total.toFixed(2)}</span>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full bg-desi-orange/20 flex items-center justify-center mr-2">
            <CheckCircle size={14} className="text-desi-orange" />
          </div>
          <p className="text-sm font-medium">
            {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {deliveryMethod === 'pickup' 
            ? 'Your order will be ready for pickup in 20-30 minutes.' 
            : 'Your order will be delivered in 30-45 minutes.'}
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
