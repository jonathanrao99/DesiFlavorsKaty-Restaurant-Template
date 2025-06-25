'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  DollarSign, ShoppingCart, Users, TrendingUp, Clock, 
  MapPin, Eye, QrCode, Star, MessageSquare, Target
} from 'lucide-react';
import { GeographicAnalytics } from './GeographicAnalytics';
import { ReportsExports } from './ReportsExports';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface AnalyticsData {
  overview: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    todayOrders: number;
    todaySales: number;
  };
  salesTrend: Array<{ date: string; sales: number; orders: number }>;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  orderStatus: Record<string, number>;
}

const COLORS = ['#FF6B35', '#F7931E', '#FFD23F', '#06D6A0', '#118AB2', '#073B4C'];

export function ComprehensiveDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch comprehensive analytics
  const { data: analytics, error: analyticsError } = useSWR<AnalyticsData>(
    `/api/analytics/comprehensive?timeRange=${timeRange}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  // Fetch Umami data
  const { data: umamiStats } = useSWR('/api/umami/stats', fetcher);
  
  // Fetch GA4 QR campaign data
  const { data: qrCampaignData } = useSWR('/api/ga4/qr-campaign', fetcher);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  if (analyticsError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Error loading analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights across all channels</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-desi-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalSales)}</div>
            <p className="text-xs text-green-100">{timeRange} period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalOrders)}</div>
            <p className="text-xs text-blue-100">Today: {analytics.overview.todayOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.avgOrderValue)}</div>
            <p className="text-xs text-purple-100">Per order average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Website Traffic</CardTitle>
            <Eye className="h-4 w-4 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(umamiStats?.visitors?.value || 0)}</div>
            <p className="text-xs text-orange-100">Unique visitors</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(qrCampaignData?.totals?.[0]?.metricValues?.[2]?.value || 0)}
            </div>
            <p className="text-xs text-indigo-100">Active users from QR</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-100">Page Views</CardTitle>
            <Users className="h-4 w-4 text-pink-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(umamiStats?.pageviews?.value || 0)}</div>
            <p className="text-xs text-pink-100">Total page views</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales & Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'sales' ? formatCurrency(value as number) : formatNumber(value as number),
                        name === 'sales' ? 'Sales' : 'Orders'
                      ]}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.6} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#118AB2" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Items by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="revenue" fill="#FF6B35" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={formatHour} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} orders`, 'Orders']}
                      labelFormatter={(hour) => `${formatHour(hour as number)}`}
                    />
                    <Bar dataKey="count" fill="#118AB2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.orderStatus).map(([status, count]) => ({
                        name: status.charAt(0).toUpperCase() + status.slice(1),
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(analytics.orderStatus).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Live Orders Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Pending Orders</p>
                      <p className="text-sm text-yellow-600">Need immediate attention</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {analytics.orderStatus.pending || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Completed Today</p>
                      <p className="text-sm text-green-600">Successfully fulfilled</p>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {analytics.orderStatus.completed || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Campaign Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total QR Sessions</span>
                    <span className="text-lg font-bold">
                      {formatNumber(qrCampaignData?.totals?.[0]?.metricValues?.[0]?.value || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">QR Conversions</span>
                    <span className="text-lg font-bold">
                      {formatNumber(qrCampaignData?.totals?.[0]?.metricValues?.[1]?.value || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {(((qrCampaignData?.totals?.[0]?.metricValues?.[1]?.value || 0) / 
                         (qrCampaignData?.totals?.[0]?.metricValues?.[0]?.value || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Traffic Sources (Umami)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unique Visitors</span>
                    <span className="text-lg font-bold">
                      {formatNumber(umamiStats?.visitors?.value || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Sessions</span>
                    <span className="text-lg font-bold">
                      {formatNumber(umamiStats?.visits?.value || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-lg font-bold">
                      {((umamiStats?.bounces?.value || 0) / (umamiStats?.visits?.value || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Customer Loyalty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-desi-orange">4.8</div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Customers</span>
                      <span className="text-sm font-bold">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Returning Customers</span>
                      <span className="text-sm font-bold">35%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">John D.</span>
                    </div>
                    <p className="text-sm text-gray-600">"Amazing biryani! Best in the city."</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsExports />
        </TabsContent>
        
        <TabsContent value="geographic" className="space-y-6">
          <GeographicAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
} 