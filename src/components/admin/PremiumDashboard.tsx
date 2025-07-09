import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLORS = ['#FF6B35', '#F7931E', '#FFD23F', '#06D6A0', '#118AB2', '#073B4C'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num);
}

export default function PremiumDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*');
      // Fetch customers
      const { data: customersData } = await supabase
        .from('customer_lifetime_value')
        .select('*');
      // Fetch menu items
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('id, name, price, category');
      setOrders(ordersData || []);
      setCustomers(customersData || []);
      setMenuItems(menuData || []);
      // Calculate metrics
      setMetrics(calculateMetrics(ordersData || [], customersData || [], menuData || []));
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || !metrics) {
    return <div className="py-12 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalSales)}</div>
            <p className="text-xs text-green-100">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalOrders)}</div>
            <p className="text-xs text-blue-100">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.uniqueCustomers)}</div>
            <p className="text-xs text-purple-100">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Returning Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.returningCustomers)}</div>
            <p className="text-xs text-orange-100">{metrics.returnRate}% return rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#FF6B35" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Customer Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="customers" stroke="#118AB2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Menu Items & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top-Selling Menu Items</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.topMenuItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#F7931E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              {metrics.recentOrders.map((order: any) => (
                <li key={order.id} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-gray-800">{order.customer_name || 'Guest'}</span>
                  <span className="text-gray-500 text-sm">{order.created_at.split('T')[0]}</span>
                  <span className="text-desi-orange font-semibold">{formatCurrency(order.total_amount)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function calculateMetrics(orders: any[], customers: any[], menuItems: any[]) {
  // Total sales and orders
  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;
  // Unique customers
  const uniqueCustomers = new Set(orders.map(o => o.customer_email || o.customer_phone)).size;
  // Returning customers
  const customerOrderCounts: Record<string, number> = {};
  orders.forEach(o => {
    const key = o.customer_email || o.customer_phone;
    if (!key) return;
    customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1;
  });
  const returningCustomers = Object.values(customerOrderCounts).filter(c => c > 1).length;
  const returnRate = uniqueCustomers > 0 ? Math.round((returningCustomers / uniqueCustomers) * 100) : 0;
  // Sales trend (last 30 days)
  const salesTrend: { date: string; sales: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySales = orders.filter(o => o.created_at.split('T')[0] === dateStr).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    salesTrend.push({ date: dateStr, sales: daySales });
  }
  // Customer growth (last 30 days)
  const customerGrowth: { date: string; customers: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayCustomers = new Set(orders.filter(o => o.created_at.split('T')[0] === dateStr).map(o => o.customer_email || o.customer_phone)).size;
    customerGrowth.push({ date: dateStr, customers: dayCustomers });
  }
  // Top menu items
  const itemCounts: Record<string, { name: string; quantity: number }> = {};
  orders.forEach(o => {
    if (!o.items) return;
    let itemsArr = [];
    try {
      itemsArr = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
    } catch {
      itemsArr = [];
    }
    itemsArr.forEach((item: any) => {
      if (!item.name) return;
      if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, quantity: 0 };
      itemCounts[item.name].quantity += item.quantity || 1;
    });
  });
  const topMenuItems = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  // Recent orders
  const recentOrders = orders.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  return {
    totalSales,
    totalOrders,
    uniqueCustomers,
    returningCustomers,
    returnRate,
    salesTrend,
    customerGrowth,
    topMenuItems,
    recentOrders
  };
} 