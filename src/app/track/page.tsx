'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function TrackOrderPage() {
  const handleOrderClick = () => {
    window.open(siteConfig.orderUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-your-orange/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <ShoppingBag className="w-10 h-10 text-your-orange" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
          Order Tracking
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          All orders are now managed through our Square ordering system. 
          Track your order status and manage your orders directly on Square.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOrderClick}
          className="inline-flex items-center gap-2 bg-your-orange text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-your-orange/90 transition-all duration-300"
        >
          <span>Go to Order Portal</span>
          <ExternalLink className="w-5 h-5" />
        </motion.button>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a
              href={`tel:${siteConfig.phoneE164.replace(/\D/g, '')}`}
              className="text-your-orange hover:underline font-medium"
            >
              {siteConfig.phoneDisplay}
            </a>
            {' '}or{' '}
            <a
              href={`mailto:${siteConfig.emailContact}`}
              className="text-your-orange hover:underline font-medium"
            >
              {siteConfig.emailContact}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
