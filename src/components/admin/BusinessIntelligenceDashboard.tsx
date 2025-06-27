'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Tabs, Tab, Button, Select, SelectItem, Chip } from '@heroui/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Star, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DashboardData {
  salesByMenuItem: Array<{
    menu_item_name: string;
    category: string;
    total_quantity: number;
    total_revenue: number;
    avg_price: number;
  }>;
  customerLifetimeValue: Array<{
    customer_name: string;
    customer_email: string;
    total_spent: number;
    order_count: number;
    avg_order_value: number;
    loyalty_tier: string;
  }>;
  customerRepeatStats: Array<{
    customer_type: string;
    customer_count: number;
    total_revenue: number;
    avg_order_value: number;
  }>;
  customerRfm: Array<{
    customer_name: string;
    recency_days: number;
    frequency: number;
    monetary: number;
    rfm_segment: string;
  }>;
  promoCodeEffectiveness: Array<{
    promo_code: string;
    total_redemptions: number;
    total_discount_given: number;
    revenue_generated: number;
    redemption_rate: number;
  }>;
  loyaltyProgramImpact: Array<{
    loyalty_tier: string;
    customer_count: number;
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  }>;
  deliveryPerformance: Array<{
    partner: string;
    total_deliveries: number;
    avg_delivery_time_hours: number;
    on_time_percentage: number;
  }>;
  dailySalesTrends: Array<{
    order_date: string;
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    new_customers: number;
  }>;
}

export default function BusinessIntelligenceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const [
        salesResponse,
        customerLtvResponse,
        repeatStatsResponse,
        rfmResponse,
        promoResponse,
        loyaltyResponse,
        deliveryResponse,
        trendsResponse
      ] = await Promise.all([
        supabase.from('sales_by_menu_item').select('*').limit(20),
        supabase.from('customer_lifetime_value').select('*').order('total_spent', { ascending: false }).limit(50),
        supabase.from('customer_repeat_stats').select('*'),
        supabase.from('customer_rfm').select('*').limit(100),
        supabase.from('promo_code_effectiveness').select('*'),
        supabase.from('loyalty_program_impact').select('*'),
        supabase.from('delivery_performance').select('*'),
        supabase.from('daily_sales_trends').select('*').order('order_date', { ascending: false }).limit(parseInt(dateRange))
      ]);

      setData({
        salesByMenuItem: salesResponse.data || [],
        customerLifetimeValue: customerLtvResponse.data || [],
        customerRepeatStats: repeatStatsResponse.data || [],
        customerRfm: rfmResponse.data || [],
        promoCodeEffectiveness: promoResponse.data || [],
        loyaltyProgramImpact: loyaltyResponse.data || [],
        deliveryPerformance: deliveryResponse.data || [],
        dailySalesTrends: trendsResponse.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const exportData = async (dataType: string) => {
    if (!data) return;
    
    try {
      const response = await fetch('/api/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType, dateRange })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-desi-orange"></div>
      </div>
    );
  }

  const totalRevenue = data?.dailySalesTrends.reduce((sum, day) => sum + day.total_revenue, 0) || 0;
  const totalOrders = data?.dailySalesTrends.reduce((sum, day) => sum + day.total_orders, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topMenuItem = data?.salesByMenuItem[0];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-32"
            size="sm"
          >
            <SelectItem key="7">Last 7 days</SelectItem>
            <SelectItem key="30">Last 30 days</SelectItem>
            <SelectItem key="90">Last 90 days</SelectItem>
            <SelectItem key="365">Last year</SelectItem>
          </Select>
          
          <Button
            startContent={<Download className="h-4 w-4" />}
            variant="bordered"
            size="sm"
            onClick={() => exportData('comprehensive')}
          >
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Item</p>
                <p className="text-lg font-bold text-orange-600">{topMenuItem?.menu_item_name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{topMenuItem ? formatCurrency(topMenuItem.total_revenue) : ''}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            className="w-full"
          >
            <Tab key="overview" title="Sales Overview" />
            <Tab key="customers" title="Customer Analytics" />
            <Tab key="menu" title="Menu Performance" />
            <Tab key="marketing" title="Marketing & Loyalty" />
            <Tab key="operations" title="Operations" />
          </Tabs>
        </CardHeader>
        
        <CardBody>
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Daily Sales Trends</h3>
                <Button
                  size="sm"
                  variant="bordered"
                  startContent={<Download className="h-4 w-4" />}
                  onClick={() => exportData('daily_sales')}
                >
                  Export
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Orders</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">AOV</th>
                      <th className="text-right p-2">New Customers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.dailySalesTrends.slice(0, 10).map((day, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(day.order_date).toLocaleDateString()}</td>
                        <td className="p-2 text-right">{day.total_orders}</td>
                        <td className="p-2 text-right">{formatCurrency(day.total_revenue)}</td>
                        <td className="p-2 text-right">{formatCurrency(day.avg_order_value)}</td>
                        <td className="p-2 text-right">{day.new_customers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Lifetime Value */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Top Customers by Value</h3>
                    <Button size="sm" variant="bordered" onClick={() => exportData('customer_ltv')}>
                      Export
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data?.customerLifetimeValue.slice(0, 10).map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{customer.customer_name}</p>
                          <p className="text-sm text-gray-600">{customer.order_count} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(customer.total_spent)}</p>
                          <Chip size="sm" color={customer.loyalty_tier === 'Gold' ? 'warning' : customer.loyalty_tier === 'Silver' ? 'default' : 'secondary'}>
                            {customer.loyalty_tier}
                          </Chip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Segments */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
                  <div className="space-y-2">
                    {data?.customerRepeatStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{stat.customer_type}</p>
                          <p className="text-sm text-gray-600">{stat.customer_count} customers</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(stat.total_revenue)}</p>
                          <p className="text-sm text-gray-600">AOV: {formatCurrency(stat.avg_order_value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Menu Item Performance</h3>
                <Button size="sm" variant="bordered" onClick={() => exportData('menu_performance')}>
                  Export
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Quantity Sold</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.salesByMenuItem.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.menu_item_name}</td>
                        <td className="p-2">
                          <Chip size="sm" variant="flat">{item.category}</Chip>
                        </td>
                        <td className="p-2 text-right">{item.total_quantity}</td>
                        <td className="p-2 text-right font-bold text-green-600">{formatCurrency(item.total_revenue)}</td>
                        <td className="p-2 text-right">{formatCurrency(item.avg_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'marketing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Promo Code Performance */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Promo Code Performance</h3>
                    <Button size="sm" variant="bordered" onClick={() => exportData('promo_codes')}>
                      Export
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {data?.promoCodeEffectiveness.map((promo, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{promo.promo_code}</p>
                          <Chip size="sm" color="success">{formatPercentage(promo.redemption_rate)}</Chip>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Redemptions</p>
                            <p className="font-medium">{promo.total_redemptions}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Discount Given</p>
                            <p className="font-medium text-red-600">{formatCurrency(promo.total_discount_given)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium text-green-600">{formatCurrency(promo.revenue_generated)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loyalty Program Impact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Loyalty Program Impact</h3>
                  <div className="space-y-2">
                    {data?.loyaltyProgramImpact.map((tier, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{tier.loyalty_tier} Members</p>
                          <p className="text-sm text-gray-600">{tier.customer_count} customers</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Orders</p>
                            <p className="font-medium">{tier.total_orders}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium text-green-600">{formatCurrency(tier.total_revenue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">AOV</p>
                            <p className="font-medium">{formatCurrency(tier.avg_order_value)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'operations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Delivery Performance</h3>
                <Button size="sm" variant="bordered" onClick={() => exportData('delivery_performance')}>
                  Export
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.deliveryPerformance.map((partner, index) => (
                  <Card key={index}>
                    <CardBody className="p-4">
                      <h4 className="font-semibold mb-3">{partner.partner}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Deliveries</span>
                          <span className="font-medium">{partner.total_deliveries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Delivery Time</span>
                          <span className="font-medium">{partner.avg_delivery_time_hours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">On-time Rate</span>
                          <Chip 
                            size="sm" 
                            color={partner.on_time_percentage > 0.9 ? 'success' : partner.on_time_percentage > 0.7 ? 'warning' : 'danger'}
                          >
                            {formatPercentage(partner.on_time_percentage)}
                          </Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
} 