'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname() || '';
  // Hide Navbar on all nimda admin routes
  if (pathname.startsWith('/nimda')) {
    return null;
  }
  return <Navbar />;
} 
