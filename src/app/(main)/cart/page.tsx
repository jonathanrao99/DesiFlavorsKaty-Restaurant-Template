'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Edit } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea
} from '@heroui/react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/motion.variants';
import CartSummary from '@/components/cart/CartSummary';
import CartItems from '@/components/cart/CartItems';
import ReturningCustomer from '@/components/cart/ReturningCustomer';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

const Cart = () => {
  useScrollToTop();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    updateSpecialInstructions, 
    getCartTotal,
    fulfillmentMethod,
    setFulfillmentMethod,
    scheduledTime,
    setScheduledTime
  } = useCart();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<{id: number, instructions: string} | null>(null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMounted(true);
    logAnalyticsEvent('cart_view', {});
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') window.gtag('event', 'cart_view', {});
      if (typeof window.umami === 'function') window.umami('cart_view', {});
    }
  }, []);

  const openEditDialog = (id: number, instructions: string = '') => {
    setEditItem({ id, instructions });
    setIsEditDialogOpen(true);
  };

  const handleSaveInstructions = () => {
    if (editItem) {
      updateSpecialInstructions(editItem.id, editItem.instructions);
      setIsEditDialogOpen(false);
      setEditItem(null);
    }
  };

  const deliveryFee = fulfillmentMethod === 'delivery' ? 3.99 : 0;
  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825;
  const total = subtotal + tax + deliveryFee;

  return (
    <>
      {/* Hero-like Header Section */}
      <section className="pt-20 pb-6 bg-white overflow-hidden">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container mx-auto px-4 sm:px-6 max-w-7xl"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              className="text-desi-orange"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-5xl font-display font-bold text-desi-orange leading-tight">Shopping Cart</h1>
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container mx-auto px-4 sm:px-6 max-w-7xl"
        >
          {/* Loyalty Banner always visible, less vertical padding */}
          <div className="flex justify-center mb-8">
            <span className="inline-block bg-orange-100 text-orange-800 text-base px-4 py-1 rounded-xl font-medium">
              Earn 1 loyalty point for every $1 spent. Accumulate 100 points to redeem $10 off your order!
            </span>
          </div>
          {isMounted && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Cart Items and Returning Customer */}
              <div className="lg:col-span-2">
                <CartItems 
                  items={cartItems}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                  onUpdateInstructions={updateSpecialInstructions}
                />
              </div>

              {/* Order Summary and Checkout */}
              <div className="mt-0">
                <CartSummary
                  items={cartItems}
                  deliveryMethod={fulfillmentMethod}
                  setDeliveryMethod={setFulfillmentMethod}
                />
                <ReturningCustomer />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Edit Instructions Modal */}
      <Modal isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} size="sm">
        <ModalContent className="sm:max-w-md rounded-xl">
          <ModalHeader>
            <h2 className="text-xl font-display">Special Instructions</h2>
          </ModalHeader>
          <ModalBody className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Add special preparation instructions:</label>
              <Textarea
                id="instructions"
                placeholder="Any special preparation instructions? (e.g., less spicy, no cilantro)"
                value={editItem?.instructions || ''}
                onChange={(e) => editItem && setEditItem({ ...editItem, instructions: e.target.value })}
                className="min-h-[80px] rounded-xl border border-gray-300 focus:border-desi-orange focus:ring-2 focus:ring-desi-orange/20"
              />
            </div>
            <ModalFooter className="pt-4 flex justify-end space-x-2">
              <Button variant="flat" onPress={() => setIsEditDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onPress={handleSaveInstructions} className="bg-desi-orange hover:bg-desi-orange/90 text-white rounded-xl">
                Save Instructions
              </Button>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Cart;
