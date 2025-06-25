'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, FileText, Calendar, PieChart, Users, 
  TrendingUp, MapPin, Target, Clock, CheckCircle 
} from 'lucide-react';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  frequency?: string;
  lastGenerated?: string;
}

export function ReportsExports() {
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());

  const reports: ReportConfig[] = [
    {
      id: 'daily-sales',
      name: 'Daily Sales Summary',
      description: 'Revenue, orders, and customer metrics for each day',
      icon: <TrendingUp className="h-5 w-5" />,
      formats: ['PDF', 'CSV', 'Excel'],
      frequency: 'Daily',
      lastGenerated: '2 hours ago'
    },
    {
      id: 'menu-performance',
      name: 'Menu Performance Report',
      description: 'Top items, trends, profitability analysis',
      icon: <PieChart className="h-5 w-5" />,
      formats: ['PDF', 'CSV'],
      frequency: 'Weekly',
      lastGenerated: '1 day ago'
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      description: 'Demographics, behavior, loyalty, and feedback analysis',
      icon: <Users className="h-5 w-5" />,
      formats: ['PDF', 'Excel'],
      frequency: 'Monthly',
      lastGenerated: '3 days ago'
    }
  ];

  const handleGenerateReport = async (reportId: string, format: string) => {
    setGeneratingReports(prev => new Set(prev).add(`${reportId}-${format}`));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate download
      const fileName = `${reportId}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      console.log(`Generated report: ${fileName}`);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${reportId}-${format}`);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Exports</h2>
        <p className="text-gray-600">Generate comprehensive reports for business insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-desi-orange/20 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-desi-orange/10 rounded-lg">
                <Calendar className="h-5 w-5 text-desi-orange" />
              </div>
              <div>
                <p className="font-medium">Quick Daily Report</p>
                <p className="text-sm text-gray-600">Generate today's summary</p>
              </div>
            </div>
            <Button 
              className="w-full mt-3" 
              onClick={() => handleGenerateReport('daily-sales', 'PDF')}
              disabled={generatingReports.has('daily-sales-PDF')}
            >
              {generatingReports.has('daily-sales-PDF') ? 'Generating...' : 'Generate PDF'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-gray-600">Download complete dataset</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => handleGenerateReport('complete-export', 'CSV')}
              disabled={generatingReports.has('complete-export-CSV')}
            >
              {generatingReports.has('complete-export-CSV') ? 'Exporting...' : 'Export CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Monthly Analysis</p>
                <p className="text-sm text-gray-600">Comprehensive monthly report</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => handleGenerateReport('monthly-analysis', 'PDF')}
              disabled={generatingReports.has('monthly-analysis-PDF')}
            >
              {generatingReports.has('monthly-analysis-PDF') ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {report.formats.map((format) => (
                    <Button
                      key={format}
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateReport(report.id, format)}
                      disabled={generatingReports.has(`${report.id}-${format}`)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {generatingReports.has(`${report.id}-${format}`) ? '...' : format}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 