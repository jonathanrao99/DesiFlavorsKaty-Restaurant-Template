'use client';

import React, { useEffect } from 'react';
import Analytics from '@/components/Analytics';
import { CartProvider } from '@/context/CartContext';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from '@/components/ui/sonner';
import NavbarWrapper from '@/components/NavbarWrapper';
import FooterWrapper from '@/components/FooterWrapper';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);
  return (
    <>
      <Analytics />
      <CartProvider>
        <ReactQueryProvider>
          <HeroUIProvider>
            <Toaster />
            <NavbarWrapper />
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
            <FooterWrapper />
          </HeroUIProvider>
        </ReactQueryProvider>
      </CartProvider>
    </>
  );
} 