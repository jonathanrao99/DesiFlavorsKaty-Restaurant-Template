import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ABTestConfig {
  test_id: string;
  test_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  variants: ABTestVariant[];
  target_metric: 'conversion_rate' | 'average_order_value' | 'total_revenue' | 'redemption_rate';
  traffic_split: number[]; // Percentage for each variant
  minimum_sample_size: number;
  confidence_level: number; // 0.95 for 95% confidence
}

interface ABTestVariant {
  variant_id: string;
  variant_name: string;
  description: string;
  promo_code?: string;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  minimum_order?: number;
  free_delivery?: boolean;
  special_offer?: string;
  cta_text?: string;
  email_subject?: string;
  landing_page_url?: string;
}

interface ABTestResult {
  test_id: string;
  variant_id: string;
  variant_name: string;
  participants: number;
  conversions: number;
  conversion_rate: number;
  total_revenue: number;
  average_order_value: number;
  redemptions: number;
  redemption_rate: number;
  confidence_interval: { lower: number; upper: number };
  statistical_significance: boolean;
  p_value: number;
}

interface ABTestAnalysis {
  test_config: ABTestConfig;
  results: ABTestResult[];
  winner?: string;
  statistical_power: number;
  recommendation: string;
  insights: string[];
}

export class ABTestingEngine {
  private static instance: ABTestingEngine;

  static getInstance(): ABTestingEngine {
    if (!ABTestingEngine.instance) {
      ABTestingEngine.instance = new ABTestingEngine();
    }
    return ABTestingEngine.instance;
  }

  async createABTest(config: ABTestConfig): Promise<string> {
    // Validate configuration
    this.validateTestConfig(config);

    // Store test configuration
    await supabase.from('analytics_events').insert({
      event_name: 'ab_test_created',
      event_data: config
    });

    // Create promo codes for variants that need them
    for (const variant of config.variants) {
      if (variant.promo_code && variant.discount_type && variant.discount_value) {
        await this.createPromoCode(variant, config.end_date);
      }
    }

    return config.test_id;
  }

  private validateTestConfig(config: ABTestConfig): void {
    if (config.variants.length < 2) {
      throw new Error('A/B test must have at least 2 variants');
    }

    if (config.traffic_split.length !== config.variants.length) {
      throw new Error('Traffic split must match number of variants');
    }

    const totalSplit = config.traffic_split.reduce((sum, split) => sum + split, 0);
    if (Math.abs(totalSplit - 100) > 0.01) {
      throw new Error('Traffic split must sum to 100%');
    }

    if (new Date(config.start_date) >= new Date(config.end_date)) {
      throw new Error('End date must be after start date');
    }
  }

  private async createPromoCode(variant: ABTestVariant, endDate: string): Promise<void> {
    await supabase.from('promotional_codes').insert({
      code: variant.promo_code,
      discount_type: variant.discount_type,
      discount_value: variant.discount_value,
      minimum_order_amount: variant.minimum_order || 0,
      max_uses: 1000, // Set reasonable limit
      current_uses: 0,
      valid_from: new Date().toISOString(),
      valid_until: endDate,
      active: true
    });
  }

  async assignUserToVariant(testId: string, userId: string, sessionId: string): Promise<string> {
    // Check if user is already assigned to this test
    const { data: existingAssignment } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'ab_test_assignment')
      .eq('event_data->test_id', testId)
      .eq('user_id', userId)
      .single();

    if (existingAssignment) {
      return existingAssignment.event_data.variant_id;
    }

    // Get test configuration
    const { data: testConfig } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'ab_test_created')
      .eq('event_data->test_id', testId)
      .single();

    if (!testConfig) {
      throw new Error('Test not found');
    }

    const config = testConfig.event_data as ABTestConfig;

    // Check if test is active
    const now = new Date();
    if (now < new Date(config.start_date) || now > new Date(config.end_date) || config.status !== 'active') {
      throw new Error('Test is not currently active');
    }

    // Assign variant based on traffic split
    const variantId = this.selectVariantByTrafficSplit(config.variants, config.traffic_split, userId);

    // Record assignment
    await supabase.from('analytics_events').insert({
      event_name: 'ab_test_assignment',
      event_data: {
        test_id: testId,
        variant_id: variantId,
        user_id: userId,
        session_id: sessionId
      },
      user_id: userId,
      session_id: sessionId
    });

    return variantId;
  }

  private selectVariantByTrafficSplit(variants: ABTestVariant[], trafficSplit: number[], userId: string): string {
    // Use consistent hashing to ensure same user always gets same variant
    const hash = this.hashString(userId);
    const hashValue = hash % 100;

    let cumulativePercentage = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulativePercentage += trafficSplit[i];
      if (hashValue < cumulativePercentage) {
        return variants[i].variant_id;
      }
    }

    return variants[variants.length - 1].variant_id;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async trackConversion(testId: string, userId: string, conversionData: {
    order_id?: number;
    revenue?: number;
    promo_code_used?: string;
  }): Promise<void> {
    // Get user's variant assignment
    const { data: assignment } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'ab_test_assignment')
      .eq('event_data->test_id', testId)
      .eq('user_id', userId)
      .single();

    if (!assignment) {
      return; // User not part of this test
    }

    // Record conversion
    await supabase.from('analytics_events').insert({
      event_name: 'ab_test_conversion',
      event_data: {
        test_id: testId,
        variant_id: assignment.event_data.variant_id,
        user_id: userId,
        ...conversionData
      },
      user_id: userId
    });
  }

  async analyzeABTest(testId: string): Promise<ABTestAnalysis> {
    // Get test configuration
    const { data: testConfigData } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'ab_test_created')
      .eq('event_data->test_id', testId)
      .single();

    if (!testConfigData) {
      throw new Error('Test not found');
    }

    const testConfig = testConfigData.event_data as ABTestConfig;

    // Get assignments
    const { data: assignments } = await supabase
      .from('analytics_events')
      .select('event_data, user_id')
      .eq('event_name', 'ab_test_assignment')
      .eq('event_data->test_id', testId);

    // Get conversions
    const { data: conversions } = await supabase
      .from('analytics_events')
      .select('event_data, user_id')
      .eq('event_name', 'ab_test_conversion')
      .eq('event_data->test_id', testId);

    // Calculate results for each variant
    const results: ABTestResult[] = [];

    for (const variant of testConfig.variants) {
      const variantAssignments = assignments?.filter(a => a.event_data.variant_id === variant.variant_id) || [];
      const variantConversions = conversions?.filter(c => c.event_data.variant_id === variant.variant_id) || [];

      const participants = variantAssignments.length;
      const conversionCount = variantConversions.length;
      const conversionRate = participants > 0 ? conversionCount / participants : 0;

      const totalRevenue = variantConversions.reduce((sum, c) => sum + (c.event_data.revenue || 0), 0);
      const averageOrderValue = conversionCount > 0 ? totalRevenue / conversionCount : 0;

      // Calculate redemptions if promo codes are involved
      const redemptions = variantConversions.filter(c => c.event_data.promo_code_used === variant.promo_code).length;
      const redemptionRate = participants > 0 ? redemptions / participants : 0;

      // Calculate confidence interval
      const confidenceInterval = this.calculateConfidenceInterval(conversionRate, participants, testConfig.confidence_level);

      results.push({
        test_id: testId,
        variant_id: variant.variant_id,
        variant_name: variant.variant_name,
        participants,
        conversions: conversionCount,
        conversion_rate: conversionRate,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        redemptions,
        redemption_rate: redemptionRate,
        confidence_interval: confidenceInterval,
        statistical_significance: false, // Will be calculated below
        p_value: 0 // Will be calculated below
      });
    }

    // Calculate statistical significance between variants
    if (results.length >= 2) {
      const controlResult = results[0];
      for (let i = 1; i < results.length; i++) {
        const testResult = results[i];
        const { pValue, isSignificant } = this.calculateStatisticalSignificance(
          controlResult,
          testResult,
          testConfig.confidence_level
        );
        testResult.p_value = pValue;
        testResult.statistical_significance = isSignificant;
      }
    }

    // Determine winner and generate insights
    const winner = this.determineWinner(results, testConfig.target_metric);
    const insights = this.generateInsights(results, testConfig);
    const recommendation = this.generateRecommendation(results, testConfig, winner);

    // Calculate statistical power
    const statisticalPower = this.calculateStatisticalPower(results);

    return {
      test_config: testConfig,
      results,
      winner,
      statistical_power: statisticalPower,
      recommendation,
      insights
    };
  }

  private calculateConfidenceInterval(rate: number, sampleSize: number, confidenceLevel: number): { lower: number; upper: number } {
    if (sampleSize === 0) return { lower: 0, upper: 0 };

    const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.645;
    const standardError = Math.sqrt((rate * (1 - rate)) / sampleSize);
    const marginOfError = z * standardError;

    return {
      lower: Math.max(0, rate - marginOfError),
      upper: Math.min(1, rate + marginOfError)
    };
  }

  private calculateStatisticalSignificance(control: ABTestResult, test: ABTestResult, confidenceLevel: number): { pValue: number; isSignificant: boolean } {
    const n1 = control.participants;
    const n2 = test.participants;
    const x1 = control.conversions;
    const x2 = test.conversions;

    if (n1 === 0 || n2 === 0) {
      return { pValue: 1, isSignificant: false };
    }

    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const pooledP = (x1 + x2) / (n1 + n2);
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));

    if (standardError === 0) {
      return { pValue: 1, isSignificant: false };
    }

    const zScore = Math.abs(p1 - p2) / standardError;
    const pValue = 2 * (1 - this.normalCDF(zScore)); // Two-tailed test

    const alpha = 1 - confidenceLevel;
    const isSignificant = pValue < alpha;

    return { pValue, isSignificant };
  }

  private normalCDF(x: number): number {
    // Approximation of the normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of the error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private determineWinner(results: ABTestResult[], targetMetric: string): string | undefined {
    if (results.length < 2) return undefined;

    let bestResult = results[0];
    let bestValue = this.getMetricValue(bestResult, targetMetric);

    for (let i = 1; i < results.length; i++) {
      const currentValue = this.getMetricValue(results[i], targetMetric);
      if (currentValue > bestValue && results[i].statistical_significance) {
        bestResult = results[i];
        bestValue = currentValue;
      }
    }

    return bestResult.statistical_significance ? bestResult.variant_id : undefined;
  }

  private getMetricValue(result: ABTestResult, metric: string): number {
    switch (metric) {
      case 'conversion_rate': return result.conversion_rate;
      case 'average_order_value': return result.average_order_value;
      case 'total_revenue': return result.total_revenue;
      case 'redemption_rate': return result.redemption_rate;
      default: return result.conversion_rate;
    }
  }

  private generateInsights(results: ABTestResult[], config: ABTestConfig): string[] {
    const insights: string[] = [];

    // Sample size insights
    const totalParticipants = results.reduce((sum, r) => sum + r.participants, 0);
    if (totalParticipants < config.minimum_sample_size) {
      insights.push(`Sample size (${totalParticipants}) is below the minimum required (${config.minimum_sample_size}). Consider running the test longer.`);
    }

    // Performance insights
    const bestPerformer = results.reduce((best, current) => 
      this.getMetricValue(current, config.target_metric) > this.getMetricValue(best, config.target_metric) ? current : best
    );

    const worstPerformer = results.reduce((worst, current) => 
      this.getMetricValue(current, config.target_metric) < this.getMetricValue(worst, config.target_metric) ? current : worst
    );

    const improvement = ((this.getMetricValue(bestPerformer, config.target_metric) - this.getMetricValue(worstPerformer, config.target_metric)) / this.getMetricValue(worstPerformer, config.target_metric)) * 100;

    if (improvement > 0) {
      insights.push(`Best performing variant (${bestPerformer.variant_name}) shows ${improvement.toFixed(1)}% improvement over worst performer.`);
    }

    // Statistical significance insights
    const significantResults = results.filter(r => r.statistical_significance);
    if (significantResults.length === 0) {
      insights.push('No statistically significant differences found between variants. Consider running the test longer or increasing sample size.');
    } else {
      insights.push(`${significantResults.length} out of ${results.length} variants show statistically significant results.`);
    }

    return insights;
  }

  private generateRecommendation(results: ABTestResult[], config: ABTestConfig, winner?: string): string {
    if (!winner) {
      return 'No clear winner identified. Consider extending the test duration or increasing sample size to achieve statistical significance.';
    }

    const winnerResult = results.find(r => r.variant_id === winner);
    if (!winnerResult) {
      return 'Unable to generate recommendation due to data inconsistency.';
    }

    const improvement = ((this.getMetricValue(winnerResult, config.target_metric) - this.getMetricValue(results[0], config.target_metric)) / this.getMetricValue(results[0], config.target_metric)) * 100;

    return `Implement ${winnerResult.variant_name} as it shows a statistically significant ${improvement.toFixed(1)}% improvement in ${config.target_metric}. This could lead to increased revenue and better customer engagement.`;
  }

  private calculateStatisticalPower(results: ABTestResult[]): number {
    // Simplified statistical power calculation
    // In practice, you'd want a more sophisticated calculation
    const avgSampleSize = results.reduce((sum, r) => sum + r.participants, 0) / results.length;
    const avgConversionRate = results.reduce((sum, r) => sum + r.conversion_rate, 0) / results.length;

    // Rough approximation - real calculation would be more complex
    if (avgSampleSize < 100) return 0.5;
    if (avgSampleSize < 500) return 0.7;
    if (avgSampleSize < 1000) return 0.8;
    return 0.9;
  }

  async getActiveTests(): Promise<ABTestConfig[]> {
    const { data: activeTests } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'ab_test_created')
      .eq('event_data->status', 'active');

    return activeTests?.map(test => test.event_data as ABTestConfig) || [];
  }

  async stopTest(testId: string): Promise<void> {
    await supabase.from('analytics_events').insert({
      event_name: 'ab_test_stopped',
      event_data: {
        test_id: testId,
        stopped_at: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
export const abTesting = ABTestingEngine.getInstance(); 