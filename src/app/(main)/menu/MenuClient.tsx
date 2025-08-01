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
import { createClient } from '@supabase/supabase-js';

// Lazy load OrderDialog for better performance
const OrderDialog = dynamic(() => import('@/components/order/OrderDialog'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading...</div>,
  ssr: false
});

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

// Static menu data as fallback - moved outside component to prevent recreation
const staticMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Chicken Dum Biryani",
    description: "Slow-cooked biryani with tender chicken pieces. Aromatic rice dish packed with traditional spices and flavors.",
    price: "11.99",
    isvegetarian: false,
    isspicy: true,
    category: "Biryani",
    menu_img: "/Menu_Images/chicken-dum-biryani.jpg",
    sold_out: false,
    square_variation_id: null
  },
  {
    id: 8,
    name: "Butter Chicken",
    description: "Creamy, mildly spiced chicken in a luxurious tomato-based sauce. Beloved North Indian comfort dish.",
    price: "11.99",
    isvegetarian: false,
    isspicy: false,
    category: "Non-Veg Curry",
    menu_img: "/Menu_Images/butter-chicken.jpg",
    sold_out: false,
    square_variation_id: null
  },
  {
    id: 24,
    name: "Aloo Samosa",
    description: "Classic potato-filled pastry triangles. Iconic Indian street food with a crispy exterior.",
    price: "4.99",
    isvegetarian: true,
    isspicy: false,
    category: "Snacks",
    menu_img: "/Menu_Images/aloo-samosa.jpeg",
    sold_out: false,
    square_variation_id: null
  },
  {
    id: 5,
    name: "Veg Biryani",
    description: "Aromatic rice dish loaded with mixed vegetables. Flavorful and satisfying vegetarian biryani preparation.",
    price: "9.99",
    isvegetarian: true,
    isspicy: false,
    category: "Biryani",
    menu_img: "/Menu_Images/veg-biryani.jpg",
    sold_out: false,
    square_variation_id: null
  },
  {
    id: 15,
    name: "Parotta",
    description: "Thin, flaky layers of soft, golden-brown flatbread with a delightful chewiness.",
    price: "3.99",
    isvegetarian: true,
    isspicy: false,
    category: "Indian Breads",
    menu_img: "/Menu_Images/parotta.jpg",
    sold_out: false,
    square_variation_id: null
  }
];

type MenuClientProps = {
  initialMenuItems?: MenuItem[];
};

export default function MenuClient({ initialMenuItems }: MenuClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoized Supabase client to prevent recreation
  const supabaseClient = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  // Fetch menu data on client side
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        console.log('Starting to fetch menu data from Supabase...');
        setLoading(true);
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
        console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');
        
        console.log('Supabase client created, fetching menu_items...');
        const { data: items, error } = await supabaseClient
          .from('menu_items')
          .select('id, name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id, images');
        
        if (error) {
          console.error('Supabase error:', error);
          console.warn('Using static data as fallback');
          setMenuItems(staticMenuItems);
          setLoading(false);
          return;
        }

        console.log('Supabase response - items count:', items?.length || 0);
        console.log('Supabase response - items:', items);

        if (!items || items.length === 0) {
          console.warn('No menu items from Supabase, using static data');
          setMenuItems(staticMenuItems);
          setLoading(false);
          return;
        }

        const processedItems = items.map((item: any) => {
          let images = item.images;
          if ((!images || images.length === 0) && item.menu_img) {
            images = [item.menu_img];
          } else if (images && item.menu_img && !images.includes(item.menu_img)) {
            images = [item.menu_img, ...images];
          }
          return {
            ...item,
            images,
            isSoldOut: !!item.sold_out
          };
        });

        console.log('Processed menu items:', processedItems.length);
        console.log('Categories found:', [...new Set(processedItems.map(item => item.category))]);
        setMenuItems(processedItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        console.warn('Using static data as fallback');
        setMenuItems(staticMenuItems);
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [supabaseClient]);
  
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

  // Filter menu items based on search and category
  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    return filtered;
  }, [menuItems, searchTerm, selectedCategory]);

  // Initialize open categories when categories are available
  useEffect(() => {
    if (categories.length > 0 && openCategories.size === 0) {
      setOpenCategories(new Set(categories));
    }
  }, [categories, openCategories.size]);

  // Handle URL parameters for direct item access
  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (itemId && menuItems.length > 0) {
      const item = menuItems.find(item => item.id.toString() === itemId);
      if (item) {
        setSelectedItem(item);
        setShowOrderDialog(true);
      }
    }
  }, [searchParams, menuItems]);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    setSelectedCategory(null);
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
    setSelectedCategory(category);
    setSearchTerm('');
  }, []);

  const handleAddToCart = useCallback((item: MenuItem) => {
    addToCart({
      ...item,
      quantity: 1,
      specialInstructions: ''
    });
    toast.success(`${item.name} added to cart!`);
  }, [addToCart]);

  const handleOrderNow = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setShowOrderDialog(true);
  }, []);

  const handleCloseOrderDialog = useCallback(() => {
    setShowOrderDialog(false);
    setSelectedItem(null);
  }, []);

  // Memoized search input handler
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }, [handleSearch]);

  // Memoized category filter handler
  const handleCategoryClick = useCallback((category: string) => {
    handleCategoryFilter(selectedCategory === category ? null : category);
  }, [selectedCategory, handleCategoryFilter]);

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
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={handleSearchInput}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-desi-orange focus:border-transparent"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-desi-orange text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-desi-orange text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-4 w-full">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-sm sm:text-base bg-green-500 border-green-500 text-white">
                <span role="img" aria-label="Vegetarian">🥦</span> Vegetarian
              </span>
              <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-sm sm:text-base bg-red-500 border-red-500 text-white">
                <span role="img" aria-label="Spicy">🔥</span> Spicy
              </span>
              <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-sm sm:text-base bg-desi-orange border-desi-orange text-white">
                Under $10
              </span>
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
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${
                        openCategories.has(category) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openCategories.has(category) && (
                      <div className="px-0 pb-6 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                          {categoryItems.map(item => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              handleAddToCart={handleAddToCart}
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
                setSelectedCategory(null);
              }}
              className="mt-4 px-6 py-2 bg-desi-orange text-white rounded-lg hover:bg-desi-orange/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Order Dialog */}
      <AnimatePresence>
        {showOrderDialog && selectedItem && (
          <OrderDialog
            item={selectedItem}
            onClose={handleCloseOrderDialog}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 
