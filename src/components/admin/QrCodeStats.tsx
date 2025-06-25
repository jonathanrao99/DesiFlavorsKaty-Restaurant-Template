'use client';

import { useState, useEffect } from 'react';
import { QrCode, Eye, MousePointer, TrendingUp } from 'lucide-react';

interface QrStats {
  totalScans: number;
  todayScans: number;
  conversionRate: number;
  topSources: Array<{ source: string; scans: number }>;
}

export function QrCodeStats() {
  const [stats, setStats] = useState<QrStats>({
    totalScans: 0,
    todayScans: 0,
    conversionRate: 0,
    topSources: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate QR analytics data - in real implementation, 
    // this would fetch from your analytics provider (Umami, Google Analytics, etc.)
    async function fetchQrStats() {
      try {
        // Mock data for now - replace with actual API calls
        const mockStats: QrStats = {
          totalScans: 1247,
          todayScans: 34,
          conversionRate: 12.5,
          topSources: [
            { source: 'Table QR Codes', scans: 456 },
            { source: 'Social Media', scans: 324 },
            { source: 'Website', scans: 267 },
            { source: 'Flyers', scans: 200 }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching QR stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQrStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key QR Metrics */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total QR Scans</p>
              <p className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</p>
            </div>
            <QrCode className="h-8 w-8 text-desi-orange" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Scans</p>
              <p className="text-2xl font-bold">{stats.todayScans}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Scans to orders</p>
        </div>
      </div>

      {/* Top QR Sources */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Top QR Sources</h3>
        <div className="space-y-3">
          {stats.topSources.map((source, index) => {
            const percentage = (source.scans / stats.totalScans) * 100;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-desi-orange rounded-full"></div>
                  <span className="text-sm font-medium">{source.source}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{source.scans}</span>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Management */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">QR Code Management</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium">Table QR Codes</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Menu access for dine-in customers</p>
          </button>
          
          <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium">Social Media QR</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Direct link to online ordering</p>
          </button>
          
          <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium">Promotional QR</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Special offers and discounts</p>
          </button>
        </div>
      </div>

      {/* Analytics Integration Note */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Analytics Integration</h4>
        <p className="text-sm text-blue-700">
          Connect with Umami or Google Analytics to get real-time QR code tracking data. 
          Set up UTM parameters for better source attribution.
        </p>
      </div>
    </div>
  );
} 