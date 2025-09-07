'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { Search, ChevronDown, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

export default function MenuClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  
  // Filter states
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [under10Only, setUnder10Only] = useState(false);
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoized Supabase client to prevent recreation
  const supabaseClient = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.warn('Supabase credentials not found');
      return null;
    }
    
    return createClient(url, key);
  }, []);

  // Fetch menu data from Supabase
  const fetchMenuData = useCallback(async () => {
    if (!supabaseClient) {
      console.error('No Supabase client available');
      setError('Database connection not available');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching menu data from Supabase...');
      setError(null);
      setLoading(true);
      
      const { data: items, error: supabaseError } = await supabaseClient
        .from('menu_items')
        .select('id, name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id, images')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError('Failed to load menu from database');
        setLoading(false);
        return;
      }

      if (items && items.length > 0) {
        console.log(`Successfully loaded ${items.length} menu items from Supabase`);
        setMenuItems(items);
        setError(null);
      } else {
        console.log('No menu items found in database');
        setMenuItems([]);
        setError('No menu items available');
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setError('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, [supabaseClient]);

  // Initial data fetch
  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);
  
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
    
    return uniqueCategories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [menuItems]);

  // Filter menu items based on search and special filters
  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems;
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Vegetarian filter
    if (vegetarianOnly) {
      filtered = filtered.filter(item => item.isvegetarian);
    }
    
    // Spicy filter
    if (spicyOnly) {
      filtered = filtered.filter(item => item.isspicy);
    }
    
    // Under $10 filter
    if (under10Only) {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
        return price < 10;
      });
    }
    
    return filtered;
  }, [menuItems, searchTerm, vegetarianOnly, spicyOnly, under10Only]);

  // Initialize open categories when categories are available
  useEffect(() => {
    if (categories.length > 0 && openCategories.size === 0) {
      setOpenCategories(new Set(categories));
    }
  }, [categories, openCategories.size]);


  const handleSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const handleCategoryFilter = useCallback((category: string | null) => {
    // This function is no longer used for category filtering,
    // but keeping it as it might be used elsewhere or for future features.
    // setSelectedCategory(category); 
  }, []);


  const handleRefresh = useCallback(() => {
    fetchMenuData();
  }, [fetchMenuData]);


  // Memoized search input handler
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }, [handleSearch]);

  // Memoized category filter handler
  const handleCategoryClick = useCallback((category: string) => {
    // This function is no longer used for category filtering,
    // but keeping it as it might be used elsewhere or for future features.
    // handleCategoryFilter(selectedCategory === category ? null : category);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-desi-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-desi-orange mx-auto mb-4"></div>
          <p className="text-desi-gray">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-desi-cream overflow-x-hidden">
      <div className="w-[90%] max-w-[90vw] mx-auto px-2 sm:px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          {/* Filter Pills and Search Bar Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            {/* Filter Pills - Left Side */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <button
                onClick={() => setVegetarianOnly(prev => !prev)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  vegetarianOnly
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span role="img" aria-label="Vegetarian">🥦</span> Vegetarian
              </button>
              <button
                onClick={() => setSpicyOnly(prev => !prev)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  spicyOnly
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span role="img" aria-label="Spicy">🔥</span> Spicy
              </button>
              <button
                onClick={() => setUnder10Only(prev => !prev)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  under10Only
                    ? 'bg-desi-orange text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Under $10
              </button>
            </div>

            {/* Search Bar - Right Side */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for dishes..."
                value={searchTerm}
                onChange={handleSearchInput}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-desi-orange focus:border-desi-orange transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Menu Items by Category */}
        <div className="divide-y divide-gray-200 bg-transparent rounded-none shadow-none border-none">
          <AnimatePresence>
            {categories.map((category) => {
              const categoryItems = filteredMenuItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="border-0 rounded-none">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full text-center font-display font-bold py-1 md:py-2 px-0 text-base md:text-xl bg-transparent no-underline flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex-1">{category}</span>
                    <span className="text-sm text-gray-500 mr-2">({categoryItems.length})</span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${
                        openCategories.has(category) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openCategories.has(category) && (
                      <div className="px-0 pb-6 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {categoryItems.map(item => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No Results Message */}
        {filteredMenuItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setVegetarianOnly(false);
                setSpicyOnly(false);
                setUnder10Only(false);
              }}
              className="mt-4 px-6 py-2 bg-desi-orange text-white rounded-lg hover:bg-desi-orange/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
} 
