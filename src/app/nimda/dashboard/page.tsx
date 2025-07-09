'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PremiumDashboard = dynamic(
  () => import('@/components/admin/PremiumDashboard'),
  { ssr: false }
);
import { 
  FiShoppingCart, 
  FiBarChart, 
  FiCode, 
  FiSettings, 
  FiMessageSquare,
  FiUsers,
  FiMail,
  FiEdit
} from 'react-icons/fi';

export default function AdminDashboardPage() {
  const navigationItems = [
    {
      label: 'Orders',
      href: '/nimda/dashboard/orders',
      icon: FiShoppingCart,
      description: 'Manage orders'
    },
    {
      label: 'Menu',
      href: '/nimda/dashboard/menu',
      icon: FiSettings,
      description: 'Edit menu items'
    },
    {
      label: 'Customers',
      href: '/nimda/dashboard/customers',
      icon: FiUsers,
      description: 'Customer data'
    },
    {
      label: 'Blog',
      href: '/nimda/dashboard/blog',
      icon: FiEdit,
      description: 'Content management'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here are your key business insights.</p>
        </div>

        {/* Premium Dashboard */}
        <div className="mb-8">
          <PremiumDashboard />
        </div>

        {/* Navigation Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-4 rounded-lg border border-gray-200 hover:border-desi-orange hover:shadow-md transition-all duration-200 text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-desi-orange group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-desi-orange transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 