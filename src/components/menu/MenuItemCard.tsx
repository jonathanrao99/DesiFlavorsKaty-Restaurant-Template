'use client';
import { ShoppingCart, ImageIcon, Star, ArrowRight, Clock, Utensils } from 'lucide-react';
import { MenuItem } from '@/hooks/useMenuItems';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import OrderDialog from '@/components/order/OrderDialog';
import { fadeInUp } from '@/utils/motion.variants';
import { SpinningText } from '@/components/magicui/spinning-text';
import Image from 'next/image';
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
  const imageUrl = item.menu_img || '/placeholder.svg';

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

  return (
    <>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.04, boxShadow: '0 4px 32px #ffb34733' }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative bg-white rounded-2xl overflow-hidden shadow-md h-[400px] flex flex-col cursor-pointer"
        onClick={() => {
          setIsDialogOpen(true);
          logAnalyticsEvent('menu_item_viewed', { menu_item_id: item.id, name: item.name });
          if (typeof window !== 'undefined') {
            window.gtag && window.gtag('event', 'menu_item_viewed', { item_id: item.id, item_name: item.name });
            window.umami && window.umami('menu_item_viewed', { item_id: item.id, item_name: item.name });
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {(() => {
          const name = item.name.toLowerCase();
          const highlight = ['chicken dum biryani', 'butter chicken', 'samosa'].some(k => name.includes(k));
          return highlight ? (
            <SpinningText className="text-desi-orange bg-transparent text-[0.6rem] z-20">
              bestseller • bestseller • bestseller •
            </SpinningText>
          ) : null;
        })()}
        <div className="relative h-56 w-full">
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
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className={`w-full h-full object-cover transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 33vw"
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

            {item.isSoldOut ? (
              <span className="flex items-center space-x-1 text-gray-400 font-medium text-base select-none">
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
