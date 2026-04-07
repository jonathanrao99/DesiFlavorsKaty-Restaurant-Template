'use client';
import { ImageIcon, Star, ArrowRight, Clock, Utensils, ExternalLink, ShoppingBag, Leaf, Flame } from 'lucide-react';
import { siteConfig } from '@/config/site';
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
              <SpinningText className="text-your-orange bg-transparent text-[0.6rem] z-30 pointer-events-none" children="bestseller • bestseller • bestseller •" />
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
              <span className="text-your-orange font-medium text-base">
                <span className="text-your-orange">$</span>{item.price}
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

      {/* Modern Professional Modal - Side by Side Layout */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[72vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Left Side - Image */}
            <div className="lg:w-2/5 relative bg-gray-100">
              <div className="sticky top-0 h-full min-h-[300px] lg:min-h-full">
                {!imageError ? (
                  <div className="relative h-full">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
                    
                    {/* Floating Price Badge */}
                    <div className="absolute top-6 left-6">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-2xl border border-white/40"
                      >
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Price</div>
                        <div className="text-2xl font-bold text-your-orange mt-0.5">${item.price}</div>
                      </motion.div>
                    </div>

                    {/* Badges Bottom */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-gray-900 text-sm font-semibold rounded-xl shadow-lg border border-white/40">
                        {item.category}
                      </span>
                      {item.isvegetarian && (
                        <span className="px-4 py-2 bg-green-500/90 backdrop-blur-md text-white text-sm font-semibold rounded-xl shadow-lg border border-white/40 flex items-center gap-1.5">
                          <Leaf className="w-4 h-4" />
                          Vegetarian
                        </span>
                      )}
                      {item.isspicy && (
                        <span className="px-4 py-2 bg-red-500/90 backdrop-blur-md text-white text-sm font-semibold rounded-xl shadow-lg border border-white/40 flex items-center gap-1.5">
                          <Flame className="w-4 h-4" />
                          Spicy
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-20 h-20 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Image not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="lg:w-3/5 flex flex-col max-h-[72vh]">
              {/* Header */}
              <div className="p-3 pb-2 border-b border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-1 leading-tight">
                      {item.name}
                    </h2>
                    <div className="h-1 w-12 bg-gradient-to-r from-your-orange to-yellow-500 rounded-full mb-1"></div>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-shrink-0 ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className="p-3 pb-2 flex-1">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 bg-your-orange/10 rounded-lg flex items-center justify-center">
                      <Utensils className="w-3.5 h-3.5 text-your-orange" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">About This Dish</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>

                {/* Order Now - Primary CTA */}
                <div className="mb-3">
                  <div className="bg-gradient-to-br from-your-orange via-orange-500 to-orange-600 rounded-lg p-3 text-center relative overflow-hidden group">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                      }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-base font-bold text-white mb-1">Ready to Order?</h3>
                      <p className="text-white/95 mb-2 text-xs">Place your order now through our secure Square ordering system</p>
                      
                      <a
                        href={siteConfig.orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 bg-white text-your-orange px-4 py-2 rounded-lg font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      >
                        Order on Square
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Delivery Partners */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-1.5 text-center">Also Available on Delivery Apps</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    <a
                      href="https://order.online/business/your-brand-14145277"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group bg-gray-50 hover:bg-white rounded-lg p-1.5 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-your-orange/30"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="h-6 flex items-center justify-center">
                          <img
                            src="/Doordash.webp"
                            alt="DoorDash"
                            className="h-5 w-auto object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 group-hover:text-your-orange transition-colors font-medium">DoorDash</p>
                      </div>
                    </a>

                    <a
                      href="http://menus.fyi/10883320"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group bg-gray-50 hover:bg-white rounded-lg p-1.5 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-your-orange/30"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="h-6 flex items-center justify-center">
                          <img
                            src="/Grubhub.webp"
                            alt="Grubhub"
                            className="h-5 w-auto object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 group-hover:text-your-orange transition-colors font-medium">Grubhub</p>
                      </div>
                    </a>

                    <a
                      href="https://www.order.store/store/your-brand-1989-fry-road/drrAdlMVTTin4O0Bdvzo2g"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group bg-gray-50 hover:bg-white rounded-lg p-1.5 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-your-orange/30"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="h-6 flex items-center justify-center">
                          <img
                            src="/ubereats.png"
                            alt="Uber Eats"
                            className="h-5 w-auto object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 group-hover:text-your-orange transition-colors font-medium">Uber Eats</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-500">
                  Prices may vary. Contact us for dietary restrictions or special requests.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
