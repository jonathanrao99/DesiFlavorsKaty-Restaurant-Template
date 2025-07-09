"use client";

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const OrderSummaryClean = () => {
  const { cartItems, getCartTotal, fulfillmentMethod } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825;
  // For now, delivery fee is a placeholder. In real use, pass as prop or get from context.
  const deliveryFee = fulfillmentMethod === 'delivery' ? 5 : 0;
  const total = subtotal + tax + deliveryFee - discount;

  const handleApplyDiscount = () => {
    // Placeholder: apply a $2 discount for DEMO2024 code
    if (discountCode.trim().toUpperCase() === 'DEMO2024') {
      setDiscount(2);
      setAppliedCode('DEMO2024');
    } else {
      setDiscount(0);
      setAppliedCode('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto border border-gray-100">
      <h2 className="text-xl font-display font-bold mb-4 text-gray-900">Order Summary</h2>
      <div className="divide-y divide-gray-200 mb-4">
        {cartItems.length === 0 ? (
          <div className="text-gray-500 py-4">No items in cart.</div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-800">
                {item.name} <span className="text-xs text-gray-500">x{item.quantity}</span>
              </span>
              <span className="text-gray-700">${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Taxes (8.25%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center font-bold text-lg border-t pt-3 mb-4">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={e => setDiscountCode(e.target.value)}
            className="w-full border rounded-l-full rounded-r-none px-3 py-2 focus:outline-none focus:ring-2 focus:ring-desi-orange"
            placeholder="Enter code"
          />
          <button
            onClick={handleApplyDiscount}
            className="bg-desi-orange text-white px-4 py-2 rounded-r-full rounded-l-none font-semibold hover:bg-orange-600 transition"
          >
            Apply
          </button>
        </div>
        {appliedCode && (
          <div className="text-green-600 text-xs mt-1">Discount code applied!</div>
        )}
        {discountCode && !appliedCode && discount === 0 && (
          <div className="text-red-500 text-xs mt-1">Invalid code</div>
        )}
      </div>
    </div>
  );
};

export default OrderSummaryClean; 