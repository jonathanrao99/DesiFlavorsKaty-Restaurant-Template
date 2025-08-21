'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Truck, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

function PaymentPageContent() {
  const router = useRouter();
  const { cartItems } = useCart();
  const [fulfillmentMethod, setFulfillmentMethod] = useState('delivery');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialInstructions: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // If cart is empty, redirect to menu
    if (cartItems.length === 0) {
      router.push('/menu');
    }
  }, [cartItems.length, router]);

  // Helper function to safely parse price
  const parsePrice = (price: any): number => {
    if (typeof price === 'string') {
      return parseFloat(price.replace('$', '')) || 0;
    } else if (typeof price === 'number') {
      return price;
    }
    return 0;
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (parsePrice(item.price) * item.quantity), 0
  );
  const tax = subtotal * 0.0825; // 8.25% tax
  const deliveryFee = fulfillmentMethod === 'delivery' ? 4.99 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create payment link via Supabase Edge Function  
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          cartItems,
          customerInfo,
          fulfillmentMethod,
          subtotal,
          deliveryFee,
          taxAmount: tax,
          totalAmount: total,
          baseUrl: window.location.origin,
          redirectUrl: `${window.location.origin}/payment-success`
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Square payment page
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-orange-500"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            {/* Fulfillment Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('delivery')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                    fulfillmentMethod === 'delivery'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className="h-5 w-5" />
                  <span>Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('pickup')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                    fulfillmentMethod === 'pickup'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Pickup</span>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {fulfillmentMethod === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Street address, apartment/unit number, city, state, zip code"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerInfo.specialInstructions}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Any special requests or delivery instructions..."
                />
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : 'Continue to Payment'}</span>
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 border-b pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(parsePrice(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                {fulfillmentMethod === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-semibold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {fulfillmentMethod === 'delivery' 
                    ? 'Estimated delivery time: 30-45 minutes'
                    : 'Estimated pickup time: 20-25 minutes'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
} 