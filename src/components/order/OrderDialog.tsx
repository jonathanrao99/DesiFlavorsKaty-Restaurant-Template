import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '@/types/menu';
import { X, Plus, Minus, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import ImageCarousel from '@/components/ui/ImageCarousel';

interface OrderDialogProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

const OrderDialog = ({ item, onClose, onAddToCart }: OrderDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    // Create a new item object with the current quantity and special instructions
    const cartItem = {
      ...item,
      quantity,
      specialInstructions: specialInstructions.trim() // Trim whitespace and only include if there are actual instructions
    };
    
    // Pass the item to the parent component's onAddToCart function
    onAddToCart(cartItem);
    onClose();
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-500/50 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Image Section (carousel) */}
          <div className="md:w-1/2 h-48 md:h-auto relative overflow-hidden">
            {item.menu_img ? (
              <img
                src={item.menu_img}
                alt={item.name}
                className="object-cover w-full h-full"
                style={{ width: '100%', height: '100%' }}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <ImageIcon className="h-6 w-6 text-gray-300" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-4 md:p-6 flex flex-col">
            <div className="space-y-4">
              {/* Title and Price */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm">{item.description}</p>

              {/* Dietary Labels and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
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
                <span className="text-desi-orange font-medium text-lg">{item.price}</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 text-sm font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Special Instructions:</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Add any special requests or allergies..."
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-desi-orange/20 focus:border-desi-orange text-sm"
                  rows={2}
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={item.sold_out ? undefined : handleAddToCart}
                className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${item.sold_out ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-desi-orange hover:bg-desi-orange/90 text-white'}`}
                disabled={item.sold_out}
                aria-disabled={item.sold_out}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{item.sold_out ? 'Sold Out' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDialog;
