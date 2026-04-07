'use client';

import { motion } from 'framer-motion';
import { CookingPot } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function OrderNowButton() {
  const handleOrderClick = () => {
    window.open(siteConfig.orderUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleOrderClick}
      className="fixed bottom-8 right-8 z-50 bg-your-orange text-white px-6 py-4 rounded-full shadow-2xl hover:bg-your-orange/90 transition-all duration-300 flex items-center gap-2 font-semibold text-lg group"
      aria-label="Order Now"
    >
      <CookingPot className="w-6 h-6 shrink-0 group-hover:animate-bounce" strokeWidth={2} />
      <span className="hidden sm:inline">Order Now</span>
    </motion.button>
  );
}


