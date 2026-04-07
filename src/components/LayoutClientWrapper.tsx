'use client';

import React from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Analytics from '@/components/Analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';
import OrderNowButton from '@/components/OrderNowButton';

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VercelAnalytics />
      <Analytics />
      <Navbar />
      <PageTransitionWrapper>
        {children}
      </PageTransitionWrapper>
      <Footer />
      <OrderNowButton />
    </>
  );
} 