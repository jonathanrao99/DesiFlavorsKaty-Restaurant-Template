import MenuHeader from '@/components/menu/MenuHeader';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

export const dynamic = 'force-dynamic';

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
      <Head>
        <title>Menu | Desi Flavors Hub</title>
        <meta name="description" content="Browse our menu of authentic Indian dishes, biryanis, curries, and more. Order online for pickup or delivery!" />
        <meta property="og:title" content="Menu | Desi Flavors Hub" />
        <meta property="og:description" content="Browse our menu of authentic Indian dishes, biryanis, curries, and more. Order online for pickup or delivery!" />
        <meta property="og:type" content="menu" />
        <meta property="og:url" content="https://yourdomain.com/menu" />
        <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Menu",
            "name": "Desi Flavors Hub Menu",
            "url": "https://yourdomain.com/menu",
            "hasMenuSection": [
              {
                "@type": "MenuSection",
                "name": "Biryani",
                "hasMenuItem": [
                  { "@type": "MenuItem", "name": "Chicken Biryani", "description": "Aromatic basmati rice with marinated chicken.", "offers": { "@type": "Offer", "price": "14.99", "priceCurrency": "USD" } }
                ]
              }
            ]
          }
        `}</script>
      </Head>
      <MenuHeader />
      <MenuClient initialMenuItems={menuData} />
      <MenuNotes />
    </div>
  );
} 
