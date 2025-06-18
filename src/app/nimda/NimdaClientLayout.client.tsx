"use client";
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/context/SidebarContext';

// Dynamically import heavy layout components to split code
const AppSidebar = dynamic(() => import('@/layout/AppSidebar'), { ssr: false });
const Backdrop = dynamic(() => import('@/layout/Backdrop'), { ssr: false });
const AppHeader = dynamic(() => import('@/layout/AppHeader'), { ssr: false });

export default function NimdaClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/nimda';

  // On the login page, render only the page content without the admin layout
  if (isLogin) {
    return <>{children}</>;
  }

  // Protected admin pages: show sidebar, backdrop, and header
  return (
    <SidebarProvider>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />

        <div className="flex-1 transition-all duration-300 ease-in-out">
          <AppHeader />
          <main className="p-4 md:p-6 lg:p-8 bg-desi-cream">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 