'use client';

import AdminHeader from '@/components/admin/AdminHeader';
import { SalesAnalytics } from '@/components/admin/SalesAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div>
      <AdminHeader title="Sales Analytics" />
      
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesAnalytics />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 