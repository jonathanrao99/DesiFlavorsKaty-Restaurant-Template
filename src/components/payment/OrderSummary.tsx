"use client";
import { useCart } from '@/context/CartContext';

interface OrderSummaryProps {
  subtotal: number;
  tax: number;
  deliveryFee: number | null;
  total: number;
  feeLoading: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  tax,
  deliveryFee,
  total,
  feeLoading,
}) => {
  const { cartItems, fulfillmentMethod } = useCart();

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
              ${(
                typeof item.price === 'string'
                  ? parseFloat(item.price.replace('$', ''))
                  : typeof item.price === 'number'
                    ? item.price
                    : parseFloat(String(item.price))
              ) * item.quantity).toFixed(2)}
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
        {fulfillmentMethod === 'delivery' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            {feeLoading ? (
              <span className="text-sm text-gray-500">Calculating...</span>
            ) : (
              <span>
                {typeof deliveryFee === 'number' ? `$${deliveryFee.toFixed(2)}` : '---'}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between border-t border-gray-200 pt-4 font-medium text-lg">
        <span>Total</span>
        <span className="text-desi-orange">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
