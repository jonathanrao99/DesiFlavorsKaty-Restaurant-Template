'use client';
import { ShoppingCart, ImageIcon, Star, ArrowRight, Clock, Utensils } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import OrderDialog from '@/components/order/OrderDialog';
import { fadeInUp } from '@/utils/motion.variants';
import { SpinningText } from '@/components/magicui/spinning-text';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

interface MenuItemCardProps {
  item: MenuItem;
  handleAddToCart: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, handleAddToCart }: MenuItemCardProps) {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Improved image fallback logic with URL normalization
  const imageUrl = item.menu_img
    ? item.menu_img.replace(/([^:]\/)\/+/, '$1')
    : (item.name
      ? `/Menu_Images/${item.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}.jpg`
      : '/placeholder.svg');

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleOrderNow = useCallback(() => {
    router.push(`/menu?itemId=${item.id}`);
  }, [router, item.id]);

  const handleMenuItemClick = () => {
    logAnalyticsEvent('menu_item_view', { itemId: item.id, name: item.name, price: item.price });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'menu_item_view', { itemId: item.id, name: item.name, price: item.price });
      if (typeof window.umami === 'function') {
        window.umami('menu_item_view', { itemId: item.id, name: item.name, price: item.price });
      }
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.04, boxShadow: '0 4px 32px #ffb34733' }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative bg-white rounded-2xl overflow-hidden shadow-md h-[400px] flex flex-col cursor-pointer"
        onClick={handleMenuItemClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-label={`View details for ${item.name}`}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMenuItemClick();
          }
        }}
      >
        <div className="relative h-56 w-full">
          {/* SpinningText always visible for bestsellers */}
          {(() => {
            const name = item.name.toLowerCase();
            const highlight = ['chicken dum biryani', 'butter chicken', 'samosa'].some(k => name.includes(k));
            return highlight ? (
              <SpinningText className="text-desi-orange bg-transparent text-[0.6rem] z-30 pointer-events-none" children="bestseller • bestseller • bestseller •" />
            ) : null;
          })()}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className={`w-full h-full object-cover transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <span className="text-desi-orange font-medium text-base">{item.price}</span>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">{item.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {item.isvegetarian && (
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100">
                  Vegetarian
                </span>
              )}
              {item.isspicy && (
                <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full font-medium border border-red-100">
                  Spicy
                </span>
              )}
            </div>

            {item.sold_out ? (
              <span className="flex items-center space-x-1 text-gray-400 font-medium text-base select-none" aria-disabled="true">
                <span>Sold Out</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </span>
            ) : (
              <InteractiveHoverButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart({ ...item, quantity: 1 });
                }}
                className="bg-white text-desi-orange hover:bg-desi-orange hover:text-white text-sm"
                aria-label={`Add to Cart ${item.name}`}
              >
                Add to Cart
              </InteractiveHoverButton>
            )}
          </div>
        </div>
      </motion.div>

      {isDialogOpen && (
        <OrderDialog
          item={item}
          onClose={() => setIsDialogOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}
