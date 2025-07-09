import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const Cart = () => {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const router = useRouter();
  const t = useTranslations();

  const handleCartOpen = () => {
    // logAnalyticsEvent('cart_view', {});
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') window.gtag('event', 'cart_view', {});
      if (typeof window.umami === 'function') window.umami('cart_view', {});
    }
    // ...existing open logic...
  };

  const handleAddToCart = (item) => {
    // logAnalyticsEvent('add_to_cart', { itemId: item.id, name: item.name, price: item.price });
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { itemId: item.id, name: item.name, price: item.price });
      if (typeof window.umami === 'function') window.umami('add_to_cart', { itemId: item.id, name: item.name, price: item.price });
    }
    // ...existing add logic...
  };

  const handleRemoveFromCart = (item) => {
    // logAnalyticsEvent('remove_from_cart', { itemId: item.id, name: item.name, price: item.price });
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') window.gtag('event', 'remove_from_cart', { itemId: item.id, name: item.name, price: item.price });
      if (typeof window.umami === 'function') window.umami('remove_from_cart', { itemId: item.id, name: item.name, price: item.price });
    }
    // ...existing remove logic...
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/cart')}
      className="relative p-2 text-gray-700 hover:text-desi-orange transition-colors no-underline"
      aria-label={t('cart.title')}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push('/cart');
        }
      }}
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-desi-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
          {itemCount}
        </span>
      )}
    </motion.button>
  );
}; 
