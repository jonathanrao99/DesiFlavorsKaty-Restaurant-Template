'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

import MenuHeader from '@/components/menu/MenuHeader';
import MenuNotes from '@/components/menu/MenuNotes';
import MenuClient from './MenuClient';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <MenuClient />
      </Suspense>
      <MenuNotes />
    </div>
  );
} 
