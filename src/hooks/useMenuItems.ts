import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Add type for the database row
interface MenuItemRow {
  id: number;
  name: string;
  description: string | null;
  price: string;
  isvegetarian: boolean;
  isspicy: boolean;
  category: string;
  menu_img: string | null;
  sold_out: boolean;
  square_variation_id: string | null;
  images?: string[] | null;
  isSoldOut?: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  isvegetarian: boolean;
  isspicy: boolean;
  category: string;
  menu_img?: string;
  images?: string[];
  quantity?: number;
  specialInstructions?: string;
  sold_out: boolean;
  square_variation_id?: string | null;
  isSoldOut?: boolean;
}

// Define the order of categories
const CATEGORY_ORDER = [
  'Biryani',
  'Veg Curry',
  'Non-Veg Curry',
  'Indian Breads',
  'Snacks',
  'Chaat',
  'Breakfast',
  'Chinese Non-Veg',
  'Chinese Veg',
  'Drinks',
  'Sweets'
] as const;

type Category = typeof CATEGORY_ORDER[number];

export function useMenuItems(initialData?: MenuItemRow[]) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { data: menuData, isLoading, error } = useQuery<MenuItemRow[], Error>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    initialData,
  });

  // Pre-compute category filters
  const categoryFilters = useMemo(() => {
    if (!menuData) return new Map();
    
    const filters = new Map<string, (item: MenuItemRow) => boolean>();
    filters.set('All', () => true);
    filters.set('Curries', (item) => 
      item.category === 'Non-Veg Curry' || item.category === 'Veg Curry'
    );
    filters.set('Chinese', (item) => 
      item.category === 'Chinese Non-Veg' || item.category === 'Chinese Veg'
    );
    
    // Add individual category filters
    menuData.forEach(item => {
      if (!filters.has(item.category)) {
        filters.set(item.category, (i) => i.category === item.category);
      }
    });
    
    return filters;
  }, [menuData]);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (!menuData) return [];
    
    const filterFn = categoryFilters.get(selectedCategory);
    if (!filterFn) return [];
    
    const filtered = menuData.filter(filterFn);
    
    // Sort items by category order and name
    return filtered.sort((a, b) => {
      const categoryOrderA = CATEGORY_ORDER.indexOf(a.category as Category);
      const categoryOrderB = CATEGORY_ORDER.indexOf(b.category as Category);
      
      if (categoryOrderA !== categoryOrderB) {
        return categoryOrderA - categoryOrderB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [menuData, selectedCategory, categoryFilters]);

  // Extract unique categories and sort them
  const categories = useMemo(() => {
    if (!menuData) return [];
    return Array.from(new Set(menuData.map(item => item.category)))
      .sort((a, b) => CATEGORY_ORDER.indexOf(a as Category) - CATEGORY_ORDER.indexOf(b as Category));
  }, [menuData]);

  return {
    menuItems: filteredItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading: isLoading,
    error: error instanceof Error ? error.message : null
  };
}
