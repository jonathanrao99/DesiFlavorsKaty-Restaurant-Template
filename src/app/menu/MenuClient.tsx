'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { addToast, Accordion, AccordionItem } from '@heroui/react';
import MenuItemCard from '@/components/menu/MenuItemCard';
import OrderDialog from '@/components/order/OrderDialog';
import type { MenuItem } from '@/hooks/useMenuItems';
import { Search } from 'lucide-react';

export default function MenuClient() {
  const { menuItems, loading, error, categories } = useMenuItems();
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [under10Only, setUnder10Only] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const { addToCart } = useCart();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      specialInstructions: item.specialInstructions,
      isVegetarian: item.isvegetarian,
      isSpicy: item.isspicy,
    });
    addToast({ title: 'Added to cart', description: `${item.name} has been added to your cart.` });
  }, [addToCart]);

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
    <div className="min-h-screen bg-desi-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Filter Pills and Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVegetarianOnly(!vegetarianOnly)}
              className={`px-3 py-1 rounded-full border transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${vegetarianOnly ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-green-500 text-green-500'}`}
            >
              <span role="img" aria-label="Vegetarian">🥦</span> Vegetarian
            </button>
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`px-3 py-1 rounded-full border transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${spicyOnly ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-red-500 text-red-500'}`}
            >
              <span role="img" aria-label="Spicy">🔥</span> Spicy
            </button>
            <button
              onClick={() => setUnder10Only(!under10Only)}
              className={`px-3 py-1 rounded-full border transition ease-in-out duration-150 hover:shadow-lg active:scale-95 ${under10Only ? 'bg-desi-orange border-desi-orange text-white' : 'bg-white border-desi-orange text-desi-orange'}`}
            >
              Under $10
            </button>
          </div>
          <div className="ml-auto relative">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search..."
              className="pr-10 pl-3 py-1 border border-desi-orange rounded-full focus:outline-none focus:ring-2 focus:ring-desi-orange transition-colors"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-desi-orange cursor-pointer" />
          </div>
        </div>
        <Accordion selectionMode="multiple" defaultExpandedKeys={categories} className="divide-y divide-gray-200 bg-transparent rounded-none shadow-none border-none">
          {categories.map((category) => (
            <AccordionItem
              key={category}
              title={category}
              classNames={{
                base: 'border-0 rounded-none',
                heading: 'w-full text-left font-against font-bold py-0.5 md:py-1 px-0 text-base md:text-xl bg-transparent no-underline hover:text-desi-orange focus:outline-none',
                content: 'px-0 pb-4 pt-0'
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {menuItems
                  .filter(item => item.category === category)
                  .filter(item => !vegetarianOnly || item.isvegetarian)
                  .filter(item => !spicyOnly || item.isspicy)
                  .filter(item => !under10Only || parseFloat(item.price.replace(/[^0-9.]/g, '')) < 10)
                  .filter(item => item.name.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map(item => (
                    <MenuItemCard key={item.id} item={item} handleAddToCart={handleAddToCart} />
                ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
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
