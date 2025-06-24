"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (path: string) =>
    pathname === path
      ? "text-desi-orange font-semibold"
      : "text-gray-700 hover:text-desi-orange";

  function handleLogout() {
    // TODO: Implement actual logout logic
    router.push("/nimda");
  }

  return (
    <div className="min-h-screen bg-desi-cream">
      <header className="relative flex items-center justify-center px-6 py-4 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="font-samarkan text-3xl text-desi-orange">Desi</span>
          <span className="font-butler text-2xl font-bold tracking-wide text-desi-black">Flavors Katy</span>
        </div>
        <button
          className="absolute right-6 flex items-center gap-2 text-desi-orange hover:text-desi-black font-semibold px-3 py-1 rounded"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </header>
      <div className="px-6">
        {pathname === '/nimda/dashboard' && (
          <div className="flex justify-center gap-4 mb-6">
            <Link href="/nimda/dashboard/menu">
              <button className="px-4 py-2 bg-desi-orange text-white rounded">Menu</button>
            </Link>
            <Link href="/nimda/dashboard/blog">
              <button className="px-4 py-2 bg-desi-orange text-white rounded">Blog</button>
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  );
} 