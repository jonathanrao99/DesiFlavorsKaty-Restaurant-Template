import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ExportRequest {
  dataType: string;
  format?: 'csv' | 'pdf';
  dateRange?: string;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    email: string;
    time?: string;
  };
}

function arrayToCsv(data: any[], headers?: string[]): string {
  if (!data.length) return '';
  
  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');
  const csvRows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

async function generatePdfReport(data: any, dataType: string): Promise<Buffer> {
  // This would integrate with a PDF generation library like Puppeteer or jsPDF
  // For now, we'll return a simple text-based report
  const reportContent = `
    DESI FLAVORS HUB - BUSINESS REPORT
    Generated: ${new Date().toLocaleString()}
    Report Type: ${dataType}
    
    ${JSON.stringify(data, null, 2)}
  `;
  
  return Buffer.from(reportContent, 'utf8');
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { dataType, format = 'csv', dateRange = '30', schedule } = body;

    // If this is a scheduled export, save the schedule
    if (schedule) {
      await supabase.from('analytics_events').insert({
        event_name: 'export_scheduled',
        event_data: {
          dataType,
          format,
          dateRange,
          schedule
        }
      });
      
      return NextResponse.json({ message: 'Export scheduled successfully' });
    }

    let data: any[] = [];
    const filename = `${dataType}_${new Date().toISOString().split('T')[0]}`;

    // Fetch data based on type
    switch (dataType) {
      case 'daily_sales':
        const { data: salesData } = await supabase
          .from('daily_sales_trends')
          .select('*')
          .order('order_date', { ascending: false })
          .limit(parseInt(dateRange));
        data = salesData || [];
        break;

      case 'customer_ltv':
        const { data: ltvData } = await supabase
          .from('customer_lifetime_value')
          .select('*')
          .order('total_spent', { ascending: false })
          .limit(100);
        data = ltvData || [];
        break;

      case 'menu_performance':
        const { data: menuData } = await supabase
          .from('sales_by_menu_item')
          .select('*')
          .order('total_revenue', { ascending: false });
        data = menuData || [];
        break;

      case 'promo_codes':
        const { data: promoData } = await supabase
          .from('promo_code_effectiveness')
          .select('*')
          .order('total_redemptions', { ascending: false });
        data = promoData || [];
        break;

      case 'loyalty_program':
        const { data: loyaltyData } = await supabase
          .from('loyalty_program_impact')
          .select('*')
          .order('total_revenue', { ascending: false });
        data = loyaltyData || [];
        break;

      case 'delivery_performance':
        const { data: deliveryData } = await supabase
          .from('delivery_performance')
          .select('*')
          .order('total_deliveries', { ascending: false });
        data = deliveryData || [];
        break;

      case 'customer_segments':
        const { data: segmentData } = await supabase
          .from('customer_rfm')
          .select('*')
          .limit(500);
        data = segmentData || [];
        break;

      case 'comprehensive':
        // Export all data types
        const [sales, customers, menu, promo, loyalty, delivery] = await Promise.all([
          supabase.from('daily_sales_trends').select('*').limit(30),
          supabase.from('customer_lifetime_value').select('*').limit(100),
          supabase.from('sales_by_menu_item').select('*'),
          supabase.from('promo_code_effectiveness').select('*'),
          supabase.from('loyalty_program_impact').select('*'),
          supabase.from('delivery_performance').select('*')
        ]);

        if (format === 'csv') {
          const csvData = [
            '=== DAILY SALES ===',
            arrayToCsv(sales.data || []),
            '',
            '=== CUSTOMER LIFETIME VALUE ===',
            arrayToCsv(customers.data || []),
            '',
            '=== MENU PERFORMANCE ===',
            arrayToCsv(menu.data || []),
            '',
            '=== PROMO CODE EFFECTIVENESS ===',
            arrayToCsv(promo.data || []),
            '',
            '=== LOYALTY PROGRAM IMPACT ===',
            arrayToCsv(loyalty.data || []),
            '',
            '=== DELIVERY PERFORMANCE ===',
            arrayToCsv(delivery.data || [])
          ].join('\n');

          return new NextResponse(csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${filename}.csv"`
            }
          });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }

    // Log the export event
    await supabase.from('analytics_events').insert({
      event_name: 'data_exported',
      event_data: {
        dataType,
        format,
        recordCount: data.length,
        dateRange
      }
    });

    if (format === 'csv') {
      const csvContent = arrayToCsv(data);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    } else if (format === 'pdf') {
      const pdfBuffer = await generatePdfReport(data, dataType);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

// Endpoint to get scheduled exports
export async function GET(request: NextRequest) {
  try {
    const { data: scheduledExports } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'export_scheduled')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json(scheduledExports || []);
  } catch (error) {
    console.error('Error fetching scheduled exports:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled exports' }, { status: 500 });
  }
} 