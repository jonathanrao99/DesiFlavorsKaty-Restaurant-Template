import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AnalyticsMetric {
  metric_name: string;
  current_value: number;
  previous_value: number;
  percentage_change: number;
  threshold: number;
  is_anomaly: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  severity: 'low' | 'medium' | 'high';
}

interface AnomalyAlert {
  id: string;
  metric: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  current_value: number;
  expected_range: { min: number; max: number };
  detected_at: string;
  recommendations: string[];
}

export class AnalyticsMonitor {
  private static instance: AnalyticsMonitor;
  private alertThresholds = {
    cart_abandonment_rate: { min: 0.3, max: 0.7 }, // 30-70% is normal
    order_conversion_rate: { min: 0.02, max: 0.15 }, // 2-15% is normal
    average_order_value: { min: 15, max: 100 }, // $15-100 is normal
    daily_orders: { min: 5, max: 50 }, // 5-50 orders per day is normal
    customer_return_rate: { min: 0.2, max: 0.6 }, // 20-60% return rate is normal
    loyalty_redemption_rate: { min: 0.1, max: 0.4 } // 10-40% redemption rate is normal
  };

  static getInstance(): AnalyticsMonitor {
    if (!AnalyticsMonitor.instance) {
      AnalyticsMonitor.instance = new AnalyticsMonitor();
    }
    return AnalyticsMonitor.instance;
  }

  async runDailyAnalytics(): Promise<AnalyticsMetric[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - 2);
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    const metrics: AnalyticsMetric[] = [];

    // Cart Abandonment Rate
    const cartAbandonmentMetric = await this.calculateCartAbandonmentRate(startDate, endDate, previousStartDate, previousEndDate);
    metrics.push(cartAbandonmentMetric);

    // Order Conversion Rate
    const conversionMetric = await this.calculateOrderConversionRate(startDate, endDate, previousStartDate, previousEndDate);
    metrics.push(conversionMetric);

    // Average Order Value
    const aovMetric = await this.calculateAverageOrderValue(startDate, endDate, previousStartDate, previousEndDate);
    metrics.push(aovMetric);

    // Daily Orders
    const ordersMetric = await this.calculateDailyOrders(startDate, endDate, previousStartDate, previousEndDate);
    metrics.push(ordersMetric);

    // Customer Return Rate
    const returnRateMetric = await this.calculateCustomerReturnRate(startDate, endDate, previousStartDate, previousEndDate);
    metrics.push(returnRateMetric);

    // Loyalty Redemption Rate
    const loyaltyMetric = await this.calculateLoyaltyRedemptionRate(startDate, endDate, previousStartDate, previousEndDate);
    metrics.push(loyaltyMetric);

    // Store metrics in database
    await this.storeMetrics(metrics);

    // Check for anomalies and send alerts
    const anomalies = metrics.filter(metric => metric.is_anomaly);
    if (anomalies.length > 0) {
      await this.sendAnomalyAlerts(anomalies);
    }

    return metrics;
  }

  private async calculateCartAbandonmentRate(
    startDate: Date, 
    endDate: Date, 
    previousStartDate: Date, 
    previousEndDate: Date
  ): Promise<AnalyticsMetric> {
    // Get cart abandonment events
    const { data: currentAbandoned } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'cart_abandoned')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousAbandoned } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'cart_abandoned')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    // Get total sessions (approximate from page views)
    const { data: currentSessions } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousSessions } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const currentUniqueSessions = new Set(currentSessions?.map(s => s.session_id)).size;
    const previousUniqueSessions = new Set(previousSessions?.map(s => s.session_id)).size;

    const currentRate = currentUniqueSessions > 0 ? (currentAbandoned?.length || 0) / currentUniqueSessions : 0;
    const previousRate = previousUniqueSessions > 0 ? (previousAbandoned?.length || 0) / previousUniqueSessions : 0;

    const percentageChange = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;
    const threshold = this.alertThresholds.cart_abandonment_rate;
    const isAnomaly = currentRate < threshold.min || currentRate > threshold.max;

    return {
      metric_name: 'cart_abandonment_rate',
      current_value: currentRate,
      previous_value: previousRate,
      percentage_change: percentageChange,
      threshold: threshold.max,
      is_anomaly: isAnomaly,
      trend: currentRate > previousRate ? 'increasing' : currentRate < previousRate ? 'decreasing' : 'stable',
      severity: isAnomaly ? (Math.abs(percentageChange) > 50 ? 'high' : 'medium') : 'low'
    };
  }

  private async calculateOrderConversionRate(
    startDate: Date, 
    endDate: Date, 
    previousStartDate: Date, 
    previousEndDate: Date
  ): Promise<AnalyticsMetric> {
    // Get orders
    const { data: currentOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    // Get unique visitors
    const { data: currentVisitors } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousVisitors } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const currentUniqueVisitors = new Set(currentVisitors?.map(v => v.session_id)).size;
    const previousUniqueVisitors = new Set(previousVisitors?.map(v => v.session_id)).size;

    const currentRate = currentUniqueVisitors > 0 ? (currentOrders?.length || 0) / currentUniqueVisitors : 0;
    const previousRate = previousUniqueVisitors > 0 ? (previousOrders?.length || 0) / previousUniqueVisitors : 0;

    const percentageChange = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;
    const threshold = this.alertThresholds.order_conversion_rate;
    const isAnomaly = currentRate < threshold.min || currentRate > threshold.max;

    return {
      metric_name: 'order_conversion_rate',
      current_value: currentRate,
      previous_value: previousRate,
      percentage_change: percentageChange,
      threshold: threshold.min,
      is_anomaly: isAnomaly,
      trend: currentRate > previousRate ? 'increasing' : currentRate < previousRate ? 'decreasing' : 'stable',
      severity: isAnomaly ? (currentRate < threshold.min * 0.5 ? 'high' : 'medium') : 'low'
    };
  }

  private async calculateAverageOrderValue(
    startDate: Date, 
    endDate: Date, 
    previousStartDate: Date, 
    previousEndDate: Date
  ): Promise<AnalyticsMetric> {
    const { data: currentOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const currentAOV = currentOrders?.length ? 
      currentOrders.reduce((sum, order) => sum + Number(order.total_amount), 0) / currentOrders.length : 0;
    
    const previousAOV = previousOrders?.length ? 
      previousOrders.reduce((sum, order) => sum + Number(order.total_amount), 0) / previousOrders.length : 0;

    const percentageChange = previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0;
    const threshold = this.alertThresholds.average_order_value;
    const isAnomaly = currentAOV < threshold.min || currentAOV > threshold.max;

    return {
      metric_name: 'average_order_value',
      current_value: currentAOV,
      previous_value: previousAOV,
      percentage_change: percentageChange,
      threshold: threshold.min,
      is_anomaly: isAnomaly,
      trend: currentAOV > previousAOV ? 'increasing' : currentAOV < previousAOV ? 'decreasing' : 'stable',
      severity: isAnomaly ? (Math.abs(percentageChange) > 30 ? 'high' : 'medium') : 'low'
    };
  }

  private async calculateDailyOrders(
    startDate: Date, 
    endDate: Date, 
    previousStartDate: Date, 
    previousEndDate: Date
  ): Promise<AnalyticsMetric> {
    const { data: currentOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const currentCount = currentOrders?.length || 0;
    const previousCount = previousOrders?.length || 0;

    const percentageChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;
    const threshold = this.alertThresholds.daily_orders;
    const isAnomaly = currentCount < threshold.min || currentCount > threshold.max;

    return {
      metric_name: 'daily_orders',
      current_value: currentCount,
      previous_value: previousCount,
      percentage_change: percentageChange,
      threshold: threshold.min,
      is_anomaly: isAnomaly,
      trend: currentCount > previousCount ? 'increasing' : currentCount < previousCount ? 'decreasing' : 'stable',
      severity: isAnomaly ? (currentCount < threshold.min * 0.5 ? 'high' : 'medium') : 'low'
    };
  }

  private async calculateCustomerReturnRate(
    startDate: Date, 
    endDate: Date, 
    previousStartDate: Date, 
    previousEndDate: Date
  ): Promise<AnalyticsMetric> {
    // This is a simplified calculation - in practice, you'd want to look at longer time periods
    const { data: currentCustomers } = await supabase
      .from('customer_repeat_stats')
      .select('*');

    const totalCustomers = currentCustomers?.reduce((sum, stat) => sum + stat.customer_count, 0) || 0;
    const returningCustomers = currentCustomers?.find(stat => stat.customer_type === 'Returning')?.customer_count || 0;

    const currentRate = totalCustomers > 0 ? returningCustomers / totalCustomers : 0;
    const previousRate = currentRate; // Simplified for this example

    const percentageChange = 0; // Simplified for this example
    const threshold = this.alertThresholds.customer_return_rate;
    const isAnomaly = currentRate < threshold.min || currentRate > threshold.max;

    return {
      metric_name: 'customer_return_rate',
      current_value: currentRate,
      previous_value: previousRate,
      percentage_change: percentageChange,
      threshold: threshold.min,
      is_anomaly: isAnomaly,
      trend: 'stable',
      severity: isAnomaly ? 'medium' : 'low'
    };
  }

  private async calculateLoyaltyRedemptionRate(
    startDate: Date, 
    endDate: Date, 
    previousStartDate: Date, 
    previousEndDate: Date
  ): Promise<AnalyticsMetric> {
    const { data: currentRedemptions } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'loyalty_points_redeemed')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousRedemptions } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'loyalty_points_redeemed')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const { data: currentOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const { data: previousOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const currentRate = (currentOrders?.length || 0) > 0 ? 
      (currentRedemptions?.length || 0) / currentOrders.length : 0;
    
    const previousRate = (previousOrders?.length || 0) > 0 ? 
      (previousRedemptions?.length || 0) / previousOrders.length : 0;

    const percentageChange = previousRate > 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;
    const threshold = this.alertThresholds.loyalty_redemption_rate;
    const isAnomaly = currentRate < threshold.min || currentRate > threshold.max;

    return {
      metric_name: 'loyalty_redemption_rate',
      current_value: currentRate,
      previous_value: previousRate,
      percentage_change: percentageChange,
      threshold: threshold.min,
      is_anomaly: isAnomaly,
      trend: currentRate > previousRate ? 'increasing' : currentRate < previousRate ? 'decreasing' : 'stable',
      severity: isAnomaly ? 'medium' : 'low'
    };
  }

  private async storeMetrics(metrics: AnalyticsMetric[]): Promise<void> {
    for (const metric of metrics) {
      await supabase.from('analytics_events').insert({
        event_name: 'daily_metric_calculated',
        event_data: metric
      });
    }
  }

  private async sendAnomalyAlerts(anomalies: AnalyticsMetric[]): Promise<void> {
    const alerts: AnomalyAlert[] = anomalies.map(anomaly => ({
      id: `anomaly_${anomaly.metric_name}_${Date.now()}`,
      metric: anomaly.metric_name,
      description: this.getAnomalyDescription(anomaly),
      severity: anomaly.severity,
      current_value: anomaly.current_value,
      expected_range: this.getExpectedRange(anomaly.metric_name),
      detected_at: new Date().toISOString(),
      recommendations: this.getRecommendations(anomaly)
    }));

    // Send email alerts to administrators
    for (const alert of alerts) {
      await this.sendAlertEmail(alert);
      
      // Log the alert
      await supabase.from('analytics_events').insert({
        event_name: 'anomaly_detected',
        event_data: alert
      });
    }
  }

  private getAnomalyDescription(anomaly: AnalyticsMetric): string {
    const direction = anomaly.current_value > anomaly.threshold ? 'above' : 'below';
    const change = Math.abs(anomaly.percentage_change).toFixed(1);
    
    switch (anomaly.metric_name) {
      case 'cart_abandonment_rate':
        return `Cart abandonment rate is ${direction} normal threshold at ${(anomaly.current_value * 100).toFixed(1)}% (${change}% change)`;
      case 'order_conversion_rate':
        return `Order conversion rate is ${direction} normal threshold at ${(anomaly.current_value * 100).toFixed(1)}% (${change}% change)`;
      case 'average_order_value':
        return `Average order value is ${direction} normal threshold at $${anomaly.current_value.toFixed(2)} (${change}% change)`;
      case 'daily_orders':
        return `Daily orders are ${direction} normal threshold at ${anomaly.current_value} orders (${change}% change)`;
      case 'customer_return_rate':
        return `Customer return rate is ${direction} normal threshold at ${(anomaly.current_value * 100).toFixed(1)}% (${change}% change)`;
      case 'loyalty_redemption_rate':
        return `Loyalty redemption rate is ${direction} normal threshold at ${(anomaly.current_value * 100).toFixed(1)}% (${change}% change)`;
      default:
        return `Anomaly detected in ${anomaly.metric_name}`;
    }
  }

  private getExpectedRange(metricName: string): { min: number; max: number } {
    return this.alertThresholds[metricName as keyof typeof this.alertThresholds] || { min: 0, max: 1 };
  }

  private getRecommendations(anomaly: AnalyticsMetric): string[] {
    switch (anomaly.metric_name) {
      case 'cart_abandonment_rate':
        if (anomaly.current_value > anomaly.threshold) {
          return [
            'Review checkout process for friction points',
            'Implement cart abandonment email campaigns',
            'Check for technical issues on payment page',
            'Consider offering incentives to complete purchase'
          ];
        }
        return ['Monitor for data collection issues'];

      case 'order_conversion_rate':
        if (anomaly.current_value < anomaly.threshold) {
          return [
            'Optimize website performance and loading times',
            'Review menu pricing and offerings',
            'Improve call-to-action visibility',
            'A/B test different promotional strategies'
          ];
        }
        return ['Analyze what\'s driving increased conversions to replicate success'];

      case 'average_order_value':
        if (anomaly.current_value < anomaly.threshold) {
          return [
            'Implement upselling and cross-selling strategies',
            'Review menu item bundling options',
            'Consider minimum order requirements for delivery',
            'Promote higher-value menu items'
          ];
        }
        return ['Monitor for pricing errors or data anomalies'];

      case 'daily_orders':
        if (anomaly.current_value < anomaly.threshold) {
          return [
            'Increase marketing efforts',
            'Check for operational issues affecting service',
            'Review competitor activities',
            'Consider promotional campaigns'
          ];
        }
        return ['Ensure adequate staffing and inventory for increased demand'];

      default:
        return ['Monitor metric closely and investigate root causes'];
    }
  }

  private async sendAlertEmail(alert: AnomalyAlert): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL || 'admin@desiflavors.com',
          subject: `🚨 Analytics Alert: ${alert.metric} Anomaly Detected`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
                <h1>🚨 Analytics Alert</h1>
                <p>Anomaly detected in your Desi Flavors Hub analytics</p>
              </div>
              
              <div style="padding: 30px; background: #fff;">
                <h2 style="color: #dc2626;">Alert Details</h2>
                <p><strong>Metric:</strong> ${alert.metric}</p>
                <p><strong>Description:</strong> ${alert.description}</p>
                <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
                <p><strong>Current Value:</strong> ${alert.current_value}</p>
                <p><strong>Expected Range:</strong> ${alert.expected_range.min} - ${alert.expected_range.max}</p>
                <p><strong>Detected At:</strong> ${new Date(alert.detected_at).toLocaleString()}</p>
                
                <h3 style="color: #ff6b35; margin-top: 30px;">Recommended Actions</h3>
                <ul>
                  ${alert.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/nimda/dashboard/analytics" 
                     style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                    View Analytics Dashboard
                  </a>
                </div>
              </div>
            </div>
          `
        })
      });
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  }

  async getAnomalyHistory(days: number = 30): Promise<AnomalyAlert[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: anomalyEvents } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'anomaly_detected')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    return anomalyEvents?.map(event => event.event_data as AnomalyAlert) || [];
  }
}

// Export singleton instance
export const analyticsMonitor = AnalyticsMonitor.getInstance(); 