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
  const categories = ['Appetizers', 'Main Course', 'Biryani', 'Breads', 'Desserts', 'Beverages'];
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

  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return {};
    return categories.reduce((acc, category) => {
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-6 w-full">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => setVegetarianOnly(!vegetarianOnly)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border text-sm sm:text-lg transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${vegetarianOnly ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-green-500 text-green-500'}`}
            >
              <span role="img" aria-label="Vegetarian">🥦</span> Vegetarian
            </button>
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border text-sm sm:text-lg transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${spicyOnly ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-red-500 text-red-500'}`}
            >
              <span role="img" aria-label="Spicy">🔥</span> Spicy
            </button>
            <button
              onClick={() => setUnder10Only(!under10Only)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border text-sm sm:text-lg transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${under10Only ? 'bg-desi-orange border-desi-orange text-white' : 'bg-white border-desi-orange text-desi-orange'}`}
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
              className="w-full pr-10 pl-4 py-2 border border-desi-orange rounded-full focus:outline-none focus:ring-2 focus:ring-desi-orange transition-colors text-sm sm:text-lg"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-desi-orange cursor-pointer" />
          </div>
        </div>
        <div className="divide-y divide-gray-200 bg-transparent rounded-none shadow-none border-none">
          {categories.map((category) => (
            <details key={category} open className="border-0 rounded-none">
              <summary className="w-full text-left font-display font-bold py-0.5 md:py-1 px-0 text-base md:text-xl bg-transparent no-underline hover:text-desi-orange focus:outline-none cursor-pointer flex items-center justify-between">
                {category}
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-0 pb-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {filteredMenuItems[category]?.map(item => (
                      <MenuItemCard key={item.id} item={item} handleAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            </details>
          ))}
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
