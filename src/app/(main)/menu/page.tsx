import { Suspense } from 'react';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';
import { createClient } from '@supabase/supabase-js';

async function fetchMenuData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id, images');
  if (error || !items) return [];
  return items.map((item: any) => {
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
}

export default async function MenuPage() {
  const menuData = await fetchMenuData();
  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader />
      <Suspense fallback={<div>Loading menu...</div>}>
        <MenuClient initialMenuItems={menuData} />
      </Suspense>
      <MenuNotes />
    </div>
  );
} 
