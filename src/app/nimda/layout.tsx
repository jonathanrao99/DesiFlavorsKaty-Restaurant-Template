"use client";
import { ReactNode } from 'react';
import { SidebarProvider } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/AppHeader";
// Server-side layout for admin pages

export const metadata = {
  title: 'Admin Dashboard',
};

export default function NimdaLayout({ children }: { children: ReactNode }) {
  // Wrap all /nimda pages with sidebar and header
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
