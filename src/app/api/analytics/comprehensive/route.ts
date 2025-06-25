import { NextResponse } from 'next/server';
import { createClient } from '@/integrations/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '7d';
  const includeUmami = searchParams.get('includeUmami') === 'true';
  
  try {
    const supabase = createClient();
    
    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch orders data
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Process sales data
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders?.filter(order => 
      new Date(order.created_at).toISOString().split('T')[0] === today
    ) || [];

    const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate sales by day
    const salesByDay = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateString = date.toISOString().split('T')[0];
      
      const dayOrders = orders?.filter(order => 
        new Date(order.created_at).toISOString().split('T')[0] === dateString
      ) || [];
      
      return {
        date: dateString,
        sales: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        orders: dayOrders.length
      };
    });

    // Calculate top items
    const itemSales: { [key: string]: { quantity: number; revenue: number } } = {};
    orders?.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const itemName = item.name || 'Unknown Item';
          if (!itemSales[itemName]) {
            itemSales[itemName] = { quantity: 0, revenue: 0 };
          }
          itemSales[itemName].quantity += item.quantity || 1;
          itemSales[itemName].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate peak hours
    const hourlyOrders: { [hour: string]: number } = {};
    orders?.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourlyOrders)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Order status breakdown
    const orderStatusCount = orders?.reduce((acc: any, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

    const analyticsData = {
      overview: {
        totalSales,
        totalOrders,
        avgOrderValue,
        todayOrders: todayOrders.length,
        todaySales: todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      },
      salesTrend: salesByDay,
      topItems,
      peakHours,
      orderStatus: orderStatusCount,
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 