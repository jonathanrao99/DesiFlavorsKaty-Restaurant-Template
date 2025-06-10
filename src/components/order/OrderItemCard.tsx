import { ShoppingCart, ImageIcon, ArrowRight } from 'lucide-react';
import { MenuItem } from '@/hooks/useMenuItems';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface OrderItemCardProps {
  item: MenuItem;
  handleAddToCart: (item: MenuItem) => void;
  index: number;
  onOpenDialog: (item: MenuItem) => void;
}

export default function OrderItemCard({ item, handleAddToCart, index, onOpenDialog }: OrderItemCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.menu_img) {
      setImageUrl(item.menu_img);
    }
  }, [item.menu_img]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-row h-[120px] group"
    >
      {/* Image Section */}
      <div className="relative w-1/4 h-full overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-desi-orange"></div>
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-6 w-6 text-gray-300" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="w-3/4 p-3 flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
          <span className="text-desi-orange font-medium text-sm">{item.price}</span>
        </div>
        
        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          {/* Dietary Tags */}
          <div className="flex items-center space-x-1">
            {item.isvegetarian && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100">
                Veg
              </span>
            )}
            {item.isspicy && (
              <span className="px-1.5 py-0.5 bg-red-50 text-red-700 text-xs rounded-full font-medium border border-red-100">
                Spicy
              </span>
            )}
          </div>
          
          {/* Order Now Button */}
          <Button 
            onClick={() => !item.isSoldOut && onOpenDialog(item)}
            className={`text-xs py-1 px-3 h-8 flex items-center gap-1 ${item.isSoldOut ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-desi-orange hover:bg-desi-orange/90 text-white'}`}
            disabled={item.isSoldOut}
            aria-disabled={item.isSoldOut}
          >
            <ShoppingCart className="h-3 w-3" />
            {item.isSoldOut ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
