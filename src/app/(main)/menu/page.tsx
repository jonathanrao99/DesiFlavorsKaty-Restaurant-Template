import { Suspense } from 'react';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader />
      <Suspense fallback={
        <div className="min-h-screen bg-desi-cream flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading menu..." />
        </div>
      }>
        <MenuClient />
      </Suspense>
      <MenuNotes />
    </div>
  );
} 
