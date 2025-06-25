"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import NimdaNavbar from '../NimdaNavbar';

const PAGE_TITLES: Record<string, string> = {
  "/nimda/dashboard": "Dashboard",
  "/nimda/dashboard/orders": "Orders",
  "/nimda/dashboard/analytics": "Sales Analytics",
  "/nimda/dashboard/qr": "QR Code Analytics",
  "/nimda/dashboard/menu": "Menu Management",
  "/nimda/dashboard/feedback": "Customer Feedback",
  // Add more as needed
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Protect all dashboard pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('nimda_authed');
      if (!authed) {
        router.replace('/nimda');
      }
    }
  }, [router]);

  // Find the best matching page title
  let pageTitle = "";
  for (const key of Object.keys(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      pageTitle = PAGE_TITLES[key];
      break;
    }
  }
  if (!pageTitle) pageTitle = "Dashboard";

  return (
    <div className="min-h-screen bg-desi-cream">
      <NimdaNavbar />
      <div className="relative mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 pt-10">
        <div className="sm:absolute sm:left-4 flex items-center">
          {pathname !== "/nimda/dashboard" && (
            <button
              className="flex items-center gap-2 text-black text-lg px-4 py-2 rounded transition-colors duration-200 hover:text-desi-orange active:text-desi-orange"
              onClick={() => router.push("/nimda/dashboard")}
            >
              <FiArrowLeft className="inline-block w-6 h-6" />
              <span className="font-semibold">Back</span>
            </button>
          )}
        </div>
        <h1 className="text-5xl font-bold font-display text-center w-full">{pageTitle}</h1>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
} 