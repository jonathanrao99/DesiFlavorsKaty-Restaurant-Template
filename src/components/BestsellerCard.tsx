'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BestsellerCardProps {
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  category?: string;
}

export default function BestsellerCard({
  title,
  description,
  price,
  imageSrc,
  isVegetarian = false,
  isSpicy = false,
  category = ''
}: BestsellerCardProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Optimized image loading with fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imageLoaded && !imageError) {
        setImageLoaded(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [imageLoaded, imageError]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleCardClick = useCallback(() => {
    router.push('/menu');
  }, [router]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="relative h-48 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {imageError ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-sm">Image not available</div>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={title}
            className={`object-cover transition-all duration-500 group-hover:scale-110 rounded-t-xl ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            style={{ width: '100%', height: '100%' }}
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {isVegetarian && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Veg
            </span>
          )}
          {isSpicy && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Spicy
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-lg text-desi-black group-hover:text-desi-orange transition-colors">
            {title}
          </h3>
          <span className="font-display font-bold text-desi-orange">${price}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">{category}</span>
          <ChevronRight className="w-4 h-4 text-desi-orange group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
