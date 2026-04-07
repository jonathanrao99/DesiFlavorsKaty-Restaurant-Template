import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_URL, siteConfig } from '@/config/site';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuCategories from '@/components/menu/MenuCategories';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: `Menu - ${siteConfig.businessName}`,
  description: `Explore the full menu at ${siteConfig.businessName}. ${siteConfig.description}`,
  keywords: [...siteConfig.keywords, 'menu', 'order online'],
  openGraph: {
    title: `Menu | ${siteConfig.businessName}`,
    description: siteConfig.description,
    images: [
      {
        url: `${SITE_URL}/Food/foodtable.webp`,
        width: 1200,
        height: 630,
        alt: `Menu — ${siteConfig.businessName}`,
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
