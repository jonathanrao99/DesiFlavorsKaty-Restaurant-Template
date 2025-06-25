'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Eye, Download, Plus, BarChart3, TrendingUp, MousePointer } from 'lucide-react';

interface QrCodeData {
  id: string;
  name: string;
  url: string;
  scans: number;
  conversions: number;
  created_at: string;
  status: 'active' | 'inactive';
  type: 'menu' | 'social' | 'promotion' | 'feedback';
}

export default function QrAnalyticsPage() {
  const [qrCodes, setQrCodes] = useState<QrCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    async function fetchQrData() {
      try {
        // Mock QR data - replace with actual API calls
        const mockData: QrCodeData[] = [
          {
            id: '1',
            name: 'Table QR - Menu Access',
            url: 'https://desiflavorskatytx.com/menu?utm_source=qr&utm_medium=table&utm_campaign=dine_in',
            scans: 456,
            conversions: 67,
            created_at: '2024-12-01',
            status: 'active',
            type: 'menu'
          },
          {
            id: '2',
            name: 'Social Media QR',
            url: 'https://desiflavorskatytx.com?utm_source=qr&utm_medium=social&utm_campaign=instagram',
            scans: 324,
            conversions: 45,
            created_at: '2024-12-05',
            status: 'active',
            type: 'social'
          },
          {
            id: '3',
            name: 'Holiday Special Promotion',
            url: 'https://desiflavorskatytx.com/menu?utm_source=qr&utm_medium=flyer&utm_campaign=holiday_special',
            scans: 267,
            conversions: 38,
            created_at: '2024-12-15',
            status: 'active',
            type: 'promotion'
          },
          {
            id: '4',
            name: 'Customer Feedback QR',
            url: 'https://forms.google.com/feedback?utm_source=qr&utm_medium=receipt&utm_campaign=feedback',
            scans: 189,
            conversions: 23,
            created_at: '2024-12-10',
            status: 'active',
            type: 'feedback'
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setQrCodes(mockData);
      } catch (error) {
        console.error('Error fetching QR data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQrData();
  }, []);

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans, 0);
  const totalConversions = qrCodes.reduce((sum, qr) => sum + qr.conversions, 0);
  const avgConversionRate = totalScans > 0 ? (totalConversions / totalScans) * 100 : 0;

  const getTypeColor = (type: string) => {
    const colors = {
      menu: 'bg-blue-100 text-blue-800',
      social: 'bg-purple-100 text-purple-800',
      promotion: 'bg-green-100 text-green-800',
      feedback: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const generateQrCode = (url: string) => {
    // In a real implementation, you'd use a QR code generation library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="QR Code Analytics" />
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader 
        title="QR Code Analytics" 
        actionButton={{
          label: 'Create QR Code',
          onClick: () => setShowCreateForm(true)
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* QR Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total QR Codes</p>
                  <p className="text-2xl font-bold">{qrCodes.length}</p>
                </div>
                <QrCode className="h-8 w-8 text-desi-orange" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold">{totalConversions}</p>
                </div>
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Codes List */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qrCodes.map((qr) => {
                const conversionRate = qr.scans > 0 ? (qr.conversions / qr.scans) * 100 : 0;
                
                return (
                  <div
                    key={qr.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <img
                          src={generateQrCode(qr.url)}
                          alt={`QR Code for ${qr.name}`}
                          className="w-12 h-12"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{qr.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(qr.type)}`}>
                            {qr.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            qr.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {qr.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{qr.url}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(qr.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-center mb-2">
                        <div>
                          <div className="text-lg font-bold text-blue-600">{qr.scans}</div>
                          <div className="text-xs text-gray-500">Scans</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{qr.conversions}</div>
                          <div className="text-xs text-gray-500">Conversions</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Rate</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Types Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['menu', 'social', 'promotion', 'feedback'].map((type) => {
                const typeQrs = qrCodes.filter(qr => qr.type === type);
                const typeScans = typeQrs.reduce((sum, qr) => sum + qr.scans, 0);
                const typeConversions = typeQrs.reduce((sum, qr) => sum + qr.conversions, 0);
                const typeRate = typeScans > 0 ? (typeConversions / typeScans) * 100 : 0;
                
                return (
                  <div key={type} className="p-4 border border-gray-200 rounded-lg">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getTypeColor(type)}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{typeScans}</span> scans
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{typeConversions}</span> conversions
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{typeRate.toFixed(1)}%</span> rate
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Integration Tips */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Tracking & Analytics</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use UTM parameters for better tracking</li>
                  <li>• Set up Google Analytics goals for conversions</li>
                  <li>• Monitor scan patterns by time and location</li>
                  <li>• A/B test different QR placements</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Design & Placement</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure QR codes are large enough to scan</li>
                  <li>• Add clear call-to-action text</li>
                  <li>• Test scanning from different angles</li>
                  <li>• Use high contrast colors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 