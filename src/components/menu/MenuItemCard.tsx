'use client';
import { ImageIcon, Star, ArrowRight, Clock, Utensils, ExternalLink } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { fadeInUp } from '@/utils/motion.variants';
import { SpinningText } from '@/components/magicui/spinning-text';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';


interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleMenuItemClick = () => {
    logAnalyticsEvent('menu_item_view', { itemId: item.id, name: item.name, price: item.price });
    if (typeof window !== 'undefined') {
      (window as any).gtag && (window as any).gtag('event', 'menu_item_view', { itemId: item.id, name: item.name, price: item.price });
      if (typeof (window as any).umami === 'function') {
        (window as any).umami('menu_item_view', { itemId: item.id, name: item.name, price: item.price });
      }
    }
    setIsModalOpen(true);
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
              <h3 className="text-lg font-semibold text-gray-900 font-sans">{item.name}</h3>
              <span className="text-desi-orange font-medium text-base">
                <span className="text-desi-orange">$</span>{item.price}
              </span>
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
              <div className="text-center">
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-desi-orange">
                      ${item.price}
                    </span>
                    <div className="flex gap-2">
                      {item.isvegetarian && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Vegetarian
                        </span>
                      )}
                      {item.isspicy && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                          Spicy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Item Image */}
              <div className="mb-8">
                {imageLoading && (
                  <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
                    <ImageIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                {!imageError ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className={`w-full h-80 object-cover rounded-2xl shadow-lg ${imageLoading ? 'hidden' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{item.description}</p>
              </div>

              {/* Delivery Partners Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Order from our delivery partners
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="https://order.online/business/desi-flavors-katy-14145277"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <img
                        src="/Doordash.webp"
                        alt="DoorDash"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600 group-hover:text-desi-orange transition-colors">
                      Order on DoorDash
                    </p>
                    <ExternalLink className="w-4 h-4 mx-auto mt-2 text-gray-400 group-hover:text-desi-orange transition-colors" />
                  </a>

                  <a
                    href="http://menus.fyi/10883320"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <img
                        src="/Grubhub.webp"
                        alt="Grubhub"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600 group-hover:text-desi-orange transition-colors">
                      Order on Grubhub
                    </p>
                    <ExternalLink className="w-4 h-4 mx-auto mt-2 text-gray-400 group-hover:text-desi-orange transition-colors" />
                  </a>

                  <a
                    href="https://www.order.store/store/desi-flavors-katy-1989-fry-road/drrAdlMVTTin4O0Bdvzo2g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <img
                        src="/ubereats.png"
                        alt="Uber Eats"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600 group-hover:text-desi-orange transition-colors">
                      Order on Uber Eats
                    </p>
                    <ExternalLink className="w-4 h-4 mx-auto mt-2 text-gray-400 group-hover:text-desi-orange transition-colors" />
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
