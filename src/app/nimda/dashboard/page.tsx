'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentOrdersWidget } from '@/components/admin/RecentOrdersWidget';
import { SalesAnalytics } from '@/components/admin/SalesAnalytics';
import { QrCodeStats } from '@/components/admin/QrCodeStats';
import { CustomerFeedbackWidget } from '@/components/admin/CustomerFeedbackWidget';
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, MapPin } from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  ordersToday: number;
  qrScansToday: number;
  webTraffic: number;
  pendingOrders: number;
  scheduledOrders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    ordersToday: 0,
    qrScansToday: 0,
    webTraffic: 0,
    pendingOrders: 0,
    scheduledOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch orders for calculations
        const ordersResponse = await fetch('/api/orders');
        if (ordersResponse.ok) {
          const orders = await ordersResponse.json();
          
          const today = new Date().toISOString().split('T')[0];
          const todayOrders = orders.filter((order: any) => 
            new Date(order.created_at).toISOString().split('T')[0] === today
          );
          
          const totalSales = orders.reduce((sum: number, order: any) => sum + order.total_amount, 0);
          const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
          const scheduledOrders = orders.filter((order: any) => order.status === 'scheduled').length;
          
          setStats({
            totalSales,
            ordersToday: todayOrders.length,
            qrScansToday: 134, // Mock data - replace with actual QR analytics
            webTraffic: 1200, // Mock data - replace with actual analytics
            pendingOrders,
            scheduledOrders
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your restaurant today.</p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-green-100">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersToday}</div>
            <p className="text-xs text-blue-100">Today's orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">QR Scans Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.qrScansToday)}</div>
            <p className="text-xs text-purple-100">Menu scans</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Web Traffic</CardTitle>
            <Users className="h-4 w-4 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.webTraffic)}</div>
            <p className="text-xs text-orange-100">Visitors today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-yellow-100">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Scheduled Orders</CardTitle>
            <MapPin className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledOrders}</div>
            <p className="text-xs text-indigo-100">Future orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Analytics - Takes up 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-desi-orange" />
              Sales Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesAnalytics />
          </CardContent>
        </Card>

        {/* QR Code Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-desi-orange" />
              QR Code Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QrCodeStats />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Widget */}
      <RecentOrdersWidget />

      {/* Customer Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-desi-orange" />
            Latest Customer Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerFeedbackWidget />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium text-gray-900">Update Menu</div>
              <div className="text-sm text-gray-600">Add or modify menu items</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium text-gray-900">Process Orders</div>
              <div className="text-sm text-gray-600">Manage pending orders</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium text-gray-900">Send Campaigns</div>
              <div className="text-sm text-gray-600">Email marketing campaigns</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-600">Detailed reports</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 