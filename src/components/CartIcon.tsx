import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

const CartIcon = () => {
  const { cartItems } = useCart();
  const router = useRouter();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <>
    <motion.div
        className="relative cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
        onClick={handleCartClick}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-desi-orange/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <ShoppingCart 
          className="w-6 h-6 text-desi-orange relative z-10" 
        />
      </div>
      
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute -top-2 -right-2 bg-desi-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
          >
            <motion.span
              key={itemCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {itemCount}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    </>
  );
};

export default CartIcon; 
