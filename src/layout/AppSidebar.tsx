"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  GridIcon,
  CalenderIcon,
  ListIcon,
  TableIcon,
  DocsIcon,
  TrashBinIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
} from "@/icons/index";

// Icon sources imported as StaticImageData
const navItems = [
  { iconSrc: GridIcon, name: "Dashboard", path: "/nimda/dashboard" },
  { iconSrc: TableIcon, name: "Orders", path: "/nimda/orders" },
  { iconSrc: ListIcon, name: "Menu", path: "/nimda/menu" },
  { iconSrc: DocsIcon, name: "Blog", path: "/nimda/blog" },
  { iconSrc: CalenderIcon, name: "Calendar", path: "/nimda/calendar" },
];

// Logout icon source
const logoutItem = { iconSrc: TrashBinIcon, name: "Logout", path: "/logout" };

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = React.useState<Record<string, number>>({});
  const [openSubmenu, setOpenSubmenu] = React.useState<{ type: string; index: number } | null>(null);

  useEffect(() => {
    // Calculate heights for each submenu
    const heights: Record<string, number> = {};
    Object.entries(subMenuRefs.current).forEach(([key, el]) => {
      if (el) heights[key] = el.scrollHeight;
    });
    setSubMenuHeight(heights);
  }, [isExpanded, isHovered]);

  const isActive = useCallback(
    (path: string) => pathname === path,
    [pathname]
  );

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    const key = `${menuType}-${index}`;
    setOpenSubmenu(prev => prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index });
  };

  const handleLogout = () => {
    // Remove all tokens and user data from localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    // Redirect to main website home page
    window.location.href = "/";
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-lg z-40"
      style={{ width: isMobileOpen ? 280 : isExpanded || isHovered ? 280 : 90 }}
    >
      <div className="flex items-center justify-center h-16">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-samarkan text-xl text-blue-600">TailAdmin</span>
          )}
        </Link>
      </div>
      <div className="flex items-center justify-center p-2">
        <button
          onClick={() => toggleSidebar()}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ArrowRightIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2">
            {navItems.map((nav) => (
              <Link
                key={nav.name}
                href={nav.path || "#"}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <img
                  src={nav.iconSrc?.src ?? nav.iconSrc}
                  alt={`${nav.name} icon`}
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="font-medium">{nav.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto mb-4 px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors text-red-600"
          >
            <img
              src={logoutItem.iconSrc?.src ?? logoutItem.iconSrc}
              alt="Logout icon"
              className="w-5 h-5 flex-shrink-0"
            />
            <span className="font-medium">{logoutItem.name}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar; 
