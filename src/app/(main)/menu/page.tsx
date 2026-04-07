import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuCategories from '@/components/menu/MenuCategories';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: 'Menu - Authentic Indian Street Food',
  description: 'Explore our authentic Indian street food menu featuring biryani, curries, tandoori dishes, and traditional Indian cuisine. Order online from DoorDash, Grubhub, and Uber Eats.',
  keywords: [
    'Indian menu Katy TX',
    'Indian food menu',
    'biryani menu',
    'curry menu',
    'tandoori menu',
    'Indian street food menu',
    'vegetarian Indian food',
    'spicy Indian dishes'
  ],
  openGraph: {
    title: 'Menu - Authentic Indian Street Food | Desi Flavors Katy',
    description: 'Explore our authentic Indian street food menu featuring biryani, curries, tandoori dishes, and traditional Indian cuisine.',
    images: [
      {
        url: `${SITE_URL}/Food/foodtable.webp`,
        width: 1200,
        height: 630,
        alt: 'Authentic Indian Food Menu at Desi Flavors Katy',
      },
    ],
  },
  alternates: {
    canonical: '/menu',
  },
};

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <MenuHeader />
      <MenuCategories />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MenuClient />
        </Suspense>
      </div>
      
      <MenuNotes />
    </div>
  );
} 
