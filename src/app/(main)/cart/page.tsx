'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cartItems } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Helper function to safely parse price
  const parsePrice = (price: any): number => {
    if (typeof price === 'string') {
      return parseFloat(price.replace('$', '')) || 0;
    } else if (typeof price === 'number') {
      return price;
    }
    return 0;
  };

  // Simple animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      setIsMounted(true);
    }
  }, []);

  return (
    <>
      {/* Hero-like Header Section */}
      <section className="pt-20 pb-6 bg-white overflow-hidden">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="container mx-auto px-4 sm:px-6 max-w-7xl"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-orange-500"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-5xl font-bold text-orange-500 leading-tight">Shopping Cart</h1>
              <p className="mt-2 text-lg text-gray-600">
                {isMounted ? `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart` : null}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="pt-8 pb-2 bg-gray-50 overflow-hidden min-h-screen">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="container mx-auto px-4 sm:px-6 max-w-7xl"
        >
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some delicious items from our menu!</p>
              <Button
                onClick={() => router.push('/menu')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageSrc || '/placeholder.svg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">${item.price}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(parsePrice(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-sm border sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  
                  {/* Calculate totals */}
                  {(() => {
                    const subtotal = cartItems.reduce((sum, item) => 
                      sum + (parsePrice(item.price) * item.quantity), 0
                    );
                    const tax = subtotal * 0.0825; // 8.25% tax
                    const total = subtotal + tax;

                    return (
                      <>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="font-semibold">${total.toFixed(2)}</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => router.push('/payment')}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg"
                          disabled={cartItems.length === 0}
                        >
                          Proceed to Checkout
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
};

export default Cart;