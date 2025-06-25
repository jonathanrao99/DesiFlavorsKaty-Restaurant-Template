"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiHome, FiShoppingCart, FiBarChart, FiCode, FiUsers, FiMessageSquare, FiSettings } from "react-icons/fi";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Dashboard",
      href: "/nimda/dashboard",
      icon: FiHome,
      active: pathname === "/nimda/dashboard"
    },
    {
      name: "Recent Orders",
      href: "/nimda/dashboard/orders",
      icon: FiShoppingCart,
      active: pathname.startsWith("/nimda/dashboard/orders")
    },
    {
      name: "Sales Analytics",
      href: "/nimda/dashboard/analytics",
      icon: FiBarChart,
      active: pathname.startsWith("/nimda/dashboard/analytics")
    },
    {
      name: "QR Code Analytics",
      href: "/nimda/dashboard/qr",
      icon: FiCode,
      active: pathname.startsWith("/nimda/dashboard/qr")
    },
    {
      name: "Menu Management",
      href: "/nimda/dashboard/menu",
      icon: FiSettings,
      active: pathname.startsWith("/nimda/dashboard/menu")
    },
    {
      name: "Customer Feedback",
      href: "/nimda/dashboard/feedback",
      icon: FiMessageSquare,
      active: pathname.startsWith("/nimda/dashboard/feedback")
    }
  ];

  function handleLogout() {
    // TODO: Implement actual logout logic
    router.push("/nimda");
  }

  // Check if we're on a subpage that should show the sidebar
  const showSidebar = pathname !== '/nimda/dashboard' && pathname !== '/nimda/dashboard/menu';

  if (showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <Link href="/nimda/dashboard" className="flex items-center gap-2">
              <span className="font-samarkan text-2xl text-desi-orange">Desi</span>
              <span className="font-display text-xl font-bold tracking-wide text-desi-black">Flavors</span>
            </Link>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        item.active
                          ? 'bg-desi-orange text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="absolute bottom-6 left-4 right-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full transition-colors"
            >
              <FiLogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  // Main dashboard page layout
  return (
    <div className="min-h-screen bg-desi-cream">
      <header className="relative flex items-center justify-center px-6 py-4 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="font-samarkan text-3xl text-desi-orange">Desi</span>
          <span className="font-display text-2xl font-bold tracking-wide text-desi-black">Flavors Katy</span>
        </div>
        <button
          className="absolute right-6 flex items-center gap-2 text-desi-orange hover:text-desi-black font-semibold px-3 py-1 rounded"
          onClick={handleLogout}
        >
          <FiLogOut className="w-5 h-5" />
          Logout
        </button>
      </header>
      <div className="px-6">
        {/* Quick Navigation Cards for Main Dashboard */}
        <div className="flex justify-center gap-4 mb-6">
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer min-w-[140px]">
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-6 w-6 text-desi-orange" />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
} 