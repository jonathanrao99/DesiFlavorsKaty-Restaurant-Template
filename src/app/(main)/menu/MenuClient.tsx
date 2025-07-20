'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { toast } from 'sonner';
import { Search, ChevronDown } from 'lucide-react';

const OrderDialog = dynamic(() => import('@/components/order/OrderDialog'));

// Simple MenuItem interface
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  isvegetarian: boolean;
  isspicy: boolean;
  category: string;
  menu_img?: string;
  quantity?: number;
  specialInstructions?: string;
  sold_out: boolean;
  square_variation_id?: string | null;
}

type MenuClientProps = {
  initialMenuItems?: MenuItem[];
};

export default function MenuClient({ initialMenuItems }: MenuClientProps) {
  // Simple static menu data - in a real app this would come from an API
  const menuItems: MenuItem[] = initialMenuItems || [];
  
  // Dynamically get categories from menu items in custom order
  const categories = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    
    // Custom category order
    const categoryOrder = [
      'Biryani',
      'Breakfast', 
      'Non-Veg Curry',
      'Veg Curry',
      'Indian Breads',
      'Chaat',
      'Snacks',
      'Chinese Non-Veg',
      'Chinese Veg',
      'Drinks',
      'Sweets'
    ];
    
    // Sort categories according to custom order, with any new categories at the end
    return uniqueCategories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      
      // If both categories are in the order list, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only one is in the order list, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // If neither is in the order list, sort alphabetically
      return a.localeCompare(b);
    });
  }, [menuItems]);
  
  const loading = false;
  const error = null;

  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [under10Only, setUnder10Only] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const { addToCart, updateQuantity, cartItems } = useCart();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(categories));

  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return {};
    const filtered = categories.reduce((acc, category) => {
      acc[category] = menuItems
        .filter(item => item.category === category)
        .filter(item => !vegetarianOnly || item.isvegetarian)
        .filter(item => !spicyOnly || item.isspicy)
        .filter(item => !under10Only || (
          typeof item.price === 'string'
            ? parseFloat(item.price.replace(/[^\d.]/g, '')) < 10
            : parseFloat(String(item.price).replace(/[^\d.]/g, '')) < 10
        ))
        .filter(item => item.name.toLowerCase().includes(searchFilter.toLowerCase()));
      return acc;
    }, {} as { [key: string]: MenuItem[] });
    
    // Debug logging
    console.log('Filtered menu items by category:', Object.keys(filtered).map(cat => `${cat}: ${filtered[cat].length} items`));
    
    return filtered;
  }, [menuItems, categories, vegetarianOnly, spicyOnly, under10Only, searchFilter]);

  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (itemId && menuItems) {
      const item = menuItems.find((m) => m.id === parseInt(itemId));
      if (item) {
        setSelectedItem(item);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, menuItems]);

  const handleAddToCart = useCallback((item: MenuItem) => {
    const qtyToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const existing = cartItems.find(ci => ci.id === item.id);
    if (existing) {
      updateQuantity(item.id, existing.quantity + qtyToAdd);
    } else {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: qtyToAdd,
        specialInstructions: item.specialInstructions,
        isVegetarian: item.isvegetarian,
        isSpicy: item.isspicy,
      });
    }
    toast.success(`${item.name} has been added to your cart.`);
  }, [addToCart, updateQuantity, cartItems]);

  const handleSearch = (searchTerm) => {
    // logAnalyticsEvent('search_performed', { searchTerm }); // Removed undefined function
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'search_performed', { searchTerm });
      window.umami && window.umami('search_performed', { searchTerm });
    }
    // ...existing search logic...
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error loading menu items: {error}</div>
        </div>
      );
    }

      return (
    <div className="min-h-screen bg-desi-cream overflow-x-hidden">
      <div className="w-[90%] max-w-[90vw] mx-auto px-2 sm:px-4 py-8">
        {/* Filter Pills and Search */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-4 w-full">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => setVegetarianOnly(!vegetarianOnly)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-sm sm:text-base transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${vegetarianOnly ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-green-500 text-green-500'}`}
            >
              <span role="img" aria-label="Vegetarian">🥦</span> Vegetarian
            </button>
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-sm sm:text-base transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${spicyOnly ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-red-500 text-red-500'}`}
            >
              <span role="img" aria-label="Spicy">🔥</span> Spicy
            </button>
            <button
              onClick={() => setUnder10Only(!under10Only)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-sm sm:text-base transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${under10Only ? 'bg-desi-orange border-desi-orange text-white' : 'bg-white border-desi-orange text-desi-orange'}`}
            >
              Under $10
            </button>
          </div>
          <div className="w-full sm:w-auto mt-1 sm:mt-0 sm:ml-auto relative flex-shrink-0 max-w-full sm:max-w-xs md:max-w-md">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search..."
              className="w-full pr-10 pl-4 py-2 border border-desi-orange rounded-full focus:outline-none focus:ring-2 focus:ring-desi-orange transition-colors text-sm sm:text-base"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-desi-orange cursor-pointer" />
          </div>
        </div>
        <div className="divide-y divide-gray-200 bg-transparent rounded-none shadow-none border-none">
          {categories.map((category) => {
            const isOpen = openCategories.has(category);
            return (
              <div key={category} className="border-0 rounded-none">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full text-center font-display font-bold py-1 md:py-2 px-0 text-base md:text-xl bg-transparent no-underline hover:text-desi-orange focus:outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className="flex-1">{category}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[6000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  style={{
                    maxHeight: isOpen ? 'none' : '0px'
                  }}
                >
                  <div className="px-0 pb-6 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {filteredMenuItems[category]?.map(item => (
                          <MenuItemCard key={item.id} item={item} handleAddToCart={handleAddToCart} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {isDialogOpen && selectedItem && (
          <OrderDialog
            item={selectedItem}
            onClose={() => setIsDialogOpen(false)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 
