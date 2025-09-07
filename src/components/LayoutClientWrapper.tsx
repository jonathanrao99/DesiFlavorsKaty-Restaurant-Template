'use client';

import React, { useEffect } from 'react';
import Analytics from '@/components/Analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
      <Navbar />
      <PageTransitionWrapper>
        {children}
      </PageTransitionWrapper>
      <Footer />
    </>
  );
} 