'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Clock, DollarSign, Truck } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface GeographicData {
  zones: Array<{
    name: string;
    orderCount: number;
    revenue: number;
    avgDeliveryTime: number;
    distance: number;
  }>;
  deliveryMetrics: {
    avgDistance: number;
    avgTime: number;
    totalDeliveries: number;
    zones: number;
  };
}

const COLORS = ['#FF6B35', '#F7931E', '#FFD23F', '#06D6A0', '#118AB2', '#073B4C'];

export function GeographicAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data - in production, this would come from your delivery API
  const mockGeoData: GeographicData = {
    zones: [
      { name: 'Downtown', orderCount: 145, revenue: 3250, avgDeliveryTime: 28, distance: 2.5 },
      { name: 'Suburbs North', orderCount: 89, revenue: 2100, avgDeliveryTime: 35, distance: 4.2 },
      { name: 'University District', orderCount: 123, revenue: 2890, avgDeliveryTime: 22, distance: 1.8 },
      { name: 'Business District', orderCount: 67, revenue: 1890, avgDeliveryTime: 30, distance: 3.1 },
      { name: 'Residential East', orderCount: 98, revenue: 2340, avgDeliveryTime: 32, distance: 3.8 },
      { name: 'Industrial Area', orderCount: 34, revenue: 920, avgDeliveryTime: 40, distance: 6.2 }
    ],
    deliveryMetrics: {
      avgDistance: 3.6,
      avgTime: 31,
      totalDeliveries: 556,
      zones: 6
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Geographic Analytics</h2>
          <p className="text-gray-600">Delivery zones and order distribution insights</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockGeoData.deliveryMetrics.totalDeliveries)}</div>
            <p className="text-xs text-muted-foreground">This {timeRange} period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGeoData.deliveryMetrics.avgDistance} mi</div>
            <p className="text-xs text-muted-foreground">Per delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGeoData.deliveryMetrics.avgTime} min</div>
            <p className="text-xs text-muted-foreground">Door to door</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGeoData.deliveryMetrics.zones}</div>
            <p className="text-xs text-muted-foreground">Service areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Zone */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Delivery Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockGeoData.zones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orderCount" fill="#FF6B35" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockGeoData.zones}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {mockGeoData.zones.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Delivery Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance by Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockGeoData.zones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value} ${name === 'avgDeliveryTime' ? 'min' : 'mi'}`, name === 'avgDeliveryTime' ? 'Avg Time' : 'Distance']} />
                <Bar dataKey="avgDeliveryTime" fill="#118AB2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Zone Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGeoData.zones.map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-sm text-gray-600">{zone.orderCount} orders • {formatCurrency(zone.revenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{zone.avgDeliveryTime} min</p>
                    <p className="text-xs text-gray-600">{zone.distance} mi avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Optimization Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Most Profitable Zone</h4>
                <p className="text-green-700">Downtown generates the highest revenue per order with good delivery times.</p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Optimization Opportunity</h4>
                <p className="text-yellow-700">Industrial Area has longer delivery times - consider route optimization.</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Growth Potential</h4>
                <p className="text-blue-700">University District shows high demand - consider expanding capacity.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 