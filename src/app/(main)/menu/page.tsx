import { Suspense } from 'react';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <MenuHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MenuClient />
        </Suspense>
      </div>
      
      <MenuNotes />
    </div>
  );
} 
