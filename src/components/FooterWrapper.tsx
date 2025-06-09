'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname() || '';
  // Hide Footer on all nimda admin routes
  if (pathname.startsWith('/nimda')) {
    return null;
  }
  return <Footer />;
} 
