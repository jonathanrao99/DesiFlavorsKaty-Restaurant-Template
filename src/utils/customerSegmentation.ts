import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface CustomerSegment {
  segment_id: string;
  segment_name: string;
  description: string;
  criteria: {
    recency_days?: { min?: number; max?: number };
    frequency?: { min?: number; max?: number };
    monetary?: { min?: number; max?: number };
    loyalty_tier?: string[];
    order_count?: { min?: number; max?: number };
    last_order_days_ago?: { min?: number; max?: number };
  };
  customers: Array<{
    customer_id: number;
    name: string;
    email: string;
    phone?: string;
    total_spent: number;
    order_count: number;
    last_order_date: string;
    loyalty_tier: string;
    rfm_segment: string;
  }>;
}

interface CampaignTemplate {
  template_id: string;
  name: string;
  subject: string;
  content: string;
  target_segments: string[];
  campaign_type: 'promotional' | 'winback' | 'loyalty' | 'retention';
  incentive?: {
    type: 'percentage' | 'fixed_amount' | 'free_item';
    value: number;
    description: string;
  };
}

type CustomerRFM = Database['public']['Views']['customer_rfm']['Row'];
type CustomerLoyaltySummary = Database['public']['Views']['customer_loyalty_summary']['Row'];
type CustomerLifetimeValue = Database['public']['Views']['customer_lifetime_value']['Row'];

type EnrichedCustomer = {
  customer_id: number;
  name: string;
  email: string;
  phone?: string;
  total_spent: number | null;
  order_count: number | null;
  last_order_date: string;
  loyalty_tier: string;
  rfm_segment: string;
  recency_days: number | null;
  frequency: number | null;
  monetary: number | null;
};

export class CustomerSegmentationEngine {
  private static instance: CustomerSegmentationEngine;

  static getInstance(): CustomerSegmentationEngine {
    if (!CustomerSegmentationEngine.instance) {
      CustomerSegmentationEngine.instance = new CustomerSegmentationEngine();
    }
    return CustomerSegmentationEngine.instance;
  }

  async generateCustomerSegments(): Promise<CustomerSegment[]> {
    // Get customer RFM data
    const { data: rfmData, error } = await supabase
      .from('customer_rfm')
      .select('*');

    if (error) {
      console.error('Error fetching RFM data:', error);
      return [];
    }

    // Get additional customer data
    const { data: loyaltyData } = await supabase
      .from('customer_loyalty_summary')
      .select('*');

    const { data: customerStats } = await supabase
      .from('customer_lifetime_value')
      .select('*');

    // Combine data
    const enrichedCustomers: EnrichedCustomer[] = (rfmData || []).map((customer: CustomerRFM) => {
      const loyalty = (loyaltyData || []).find((l: CustomerLoyaltySummary) => l.customer_id === customer.id);
      const stats = (customerStats || []).find((s: CustomerLifetimeValue) => s.id === customer.id);
      return {
        customer_id: customer.id ?? 0,
        name: String(stats && 'name' in stats && stats.name ? stats.name : ''),
        email: String(stats && 'email' in stats && stats.email ? stats.email : ''),
        phone: undefined, // Not available in current views
        total_spent: customer.monetary,
        order_count: customer.frequency,
        last_order_date: stats && 'lifetime_value' in stats && stats.lifetime_value ? '' : '', // Placeholder, update if available
        loyalty_tier: String(loyalty && 'loyalty_tier' in loyalty && loyalty.loyalty_tier ? loyalty.loyalty_tier : 'Bronze'),
        rfm_segment: '', // Not available in current views
        recency_days: null, // Not available in current views
        frequency: customer.frequency,
        monetary: customer.monetary
      };
    });

    // Define segments
    const segments: CustomerSegment[] = [
      {
        segment_id: 'champions',
        segment_name: 'Champions',
        description: 'High-value customers who order frequently and recently',
        criteria: {
          recency_days: { max: 30 },
          frequency: { min: 5 },
          monetary: { min: 100 }
        },
        customers: []
      },
      {
        segment_id: 'loyal_customers',
        segment_name: 'Loyal Customers',
        description: 'Regular customers with good order frequency',
        criteria: {
          recency_days: { max: 60 },
          frequency: { min: 3 },
          monetary: { min: 50 }
        },
        customers: []
      },
      {
        segment_id: 'potential_loyalists',
        segment_name: 'Potential Loyalists',
        description: 'Recent customers with potential for growth',
        criteria: {
          recency_days: { max: 30 },
          frequency: { min: 2, max: 4 },
          monetary: { min: 30 }
        },
        customers: []
      },
      {
        segment_id: 'at_risk',
        segment_name: 'At Risk',
        description: 'Previously good customers who haven\'t ordered recently',
        criteria: {
          recency_days: { min: 61, max: 120 },
          frequency: { min: 3 },
          monetary: { min: 50 }
        },
        customers: []
      },
      {
        segment_id: 'cant_lose_them',
        segment_name: 'Can\'t Lose Them',
        description: 'High-value customers at risk of churning',
        criteria: {
          recency_days: { min: 61 },
          monetary: { min: 200 }
        },
        customers: []
      },
      {
        segment_id: 'hibernating',
        segment_name: 'Hibernating',
        description: 'Customers who haven\'t ordered in a long time',
        criteria: {
          recency_days: { min: 121, max: 365 },
          frequency: { min: 2 }
        },
        customers: []
      },
      {
        segment_id: 'lost',
        segment_name: 'Lost Customers',
        description: 'Customers who haven\'t ordered in over a year',
        criteria: {
          recency_days: { min: 366 }
        },
        customers: []
      },
      {
        segment_id: 'new_customers',
        segment_name: 'New Customers',
        description: 'Recent first-time customers',
        criteria: {
          recency_days: { max: 30 },
          frequency: { max: 1 }
        },
        customers: []
      },
      {
        segment_id: 'promising',
        segment_name: 'Promising',
        description: 'New customers with good initial order value',
        criteria: {
          recency_days: { max: 60 },
          frequency: { max: 2 },
          monetary: { min: 40 }
        },
        customers: []
      }
    ];

    // Assign customers to segments
    for (const customer of enrichedCustomers) {
      for (const segment of segments) {
        if (this.customerMatchesSegment(customer, segment.criteria)) {
          segment.customers.push(customer);
          break; // Assign to first matching segment only
        }
      }
    }

    // Store segments in database
    await this.storeSegments(segments);

    return segments;
  }

  private customerMatchesSegment(customer: any, criteria: any): boolean {
    // Check recency
    if (criteria.recency_days) {
      if (criteria.recency_days.min && customer.recency_days < criteria.recency_days.min) return false;
      if (criteria.recency_days.max && customer.recency_days > criteria.recency_days.max) return false;
    }

    // Check frequency
    if (criteria.frequency) {
      if (criteria.frequency.min && customer.frequency < criteria.frequency.min) return false;
      if (criteria.frequency.max && customer.frequency > criteria.frequency.max) return false;
    }

    // Check monetary
    if (criteria.monetary) {
      if (criteria.monetary.min && customer.monetary < criteria.monetary.min) return false;
      if (criteria.monetary.max && customer.monetary > criteria.monetary.max) return false;
    }

    // Check loyalty tier
    if (criteria.loyalty_tier && !criteria.loyalty_tier.includes(customer.loyalty_tier)) return false;

    return true;
  }

  private async storeSegments(segments: CustomerSegment[]): Promise<void> {
    for (const segment of segments) {
      await supabase.from('analytics_events').insert({
        event_name: 'customer_segment_generated',
        event_data: {
          segment_id: segment.segment_id,
          segment_name: segment.segment_name,
          customer_count: segment.customers.length,
          customers: segment.customers.map(c => c.customer_id)
        }
      });
    }
  }

  async createTargetedCampaign(segmentId: string, template: CampaignTemplate): Promise<void> {
    const segments = await this.generateCustomerSegments();
    const targetSegment = segments.find(s => s.segment_id === segmentId);

    if (!targetSegment) {
      throw new Error(`Segment ${segmentId} not found`);
    }

    // Generate personalized emails for each customer
    for (const customer of targetSegment.customers) {
      const personalizedContent = this.personalizeContent(template.content, customer, template.incentive);
      
      await this.sendCampaignEmail(customer, template.subject, personalizedContent);
      
      // Log campaign send
      await supabase.from('analytics_events').insert({
        event_name: 'campaign_email_sent',
        event_data: {
          campaign_id: template.template_id,
          customer_id: customer.customer_id,
          segment_id: segmentId,
          campaign_type: template.campaign_type
        },
        user_id: customer.customer_id.toString()
      });
    }

    // Log campaign completion
    await supabase.from('analytics_events').insert({
      event_name: 'campaign_completed',
      event_data: {
        campaign_id: template.template_id,
        segment_id: segmentId,
        emails_sent: targetSegment.customers.length,
        campaign_type: template.campaign_type
      }
    });
  }

  private personalizeContent(content: string, customer: any, incentive?: any): string {
    let personalizedContent = content
      .replace(/\{customer_name\}/g, customer.name)
      .replace(/\{total_spent\}/g, `$${customer.total_spent?.toFixed(2) || ''}`)
      .replace(/\{order_count\}/g, customer.order_count?.toString() || '')
      .replace(/\{loyalty_tier\}/g, customer.loyalty_tier);

    if (incentive) {
      const incentiveText = incentive.type === 'percentage' 
        ? `${incentive.value}% off`
        : incentive.type === 'fixed_amount'
        ? `$${incentive.value} off`
        : incentive.description;
      
      personalizedContent = personalizedContent.replace(/\{incentive\}/g, incentiveText);
    }

    return personalizedContent;
  }

  private async sendCampaignEmail(customer: any, subject: string, content: string): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Desi Flavors Hub</h1>
                <p style="color: white; margin: 5px 0;">Authentic Indian Cuisine</p>
              </div>
              
              <div style="padding: 30px; background: #fff;">
                ${content}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/menu?utm_source=email&utm_campaign=targeted" 
                     style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                    Order Now
                  </a>
                </div>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p>Desi Flavors Hub - Bringing authentic Indian flavors to your table</p>
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${customer.email}">Unsubscribe</a></p>
              </div>
            </div>
          `
        })
      });
    } catch (error) {
      console.error('Error sending campaign email:', error);
    }
  }

  async runWinBackCampaigns(): Promise<void> {
    const segments = await this.generateCustomerSegments();
    
    // Win-back campaign for "At Risk" customers
    const atRiskSegment = segments.find(s => s.segment_id === 'at_risk');
    if (atRiskSegment && atRiskSegment.customers.length > 0) {
      const winBackTemplate: CampaignTemplate = {
        template_id: 'winback_at_risk',
        name: 'Win Back At Risk Customers',
        subject: 'We miss you, {customer_name}! Come back for 20% off',
        content: `
          <h2>Hi {customer_name},</h2>
          <p>We noticed it's been a while since your last order, and we miss you!</p>
          <p>As one of our valued customers who has spent {total_spent} with us, we'd love to welcome you back with a special offer.</p>
          <h3>🎉 Exclusive Offer: {incentive} your next order!</h3>
          <p>This offer is valid for the next 7 days, so don't wait too long.</p>
          <p>Come back and enjoy your favorite dishes from our authentic Indian menu.</p>
        `,
        target_segments: ['at_risk'],
        campaign_type: 'winback',
        incentive: {
          type: 'percentage',
          value: 20,
          description: '20% off'
        }
      };

      await this.createTargetedCampaign('at_risk', winBackTemplate);
    }

    // Win-back campaign for "Can't Lose Them" customers
    const cantLoseSegment = segments.find(s => s.segment_id === 'cant_lose_them');
    if (cantLoseSegment && cantLoseSegment.customers.length > 0) {
      const vipWinBackTemplate: CampaignTemplate = {
        template_id: 'winback_vip',
        name: 'VIP Win Back Campaign',
        subject: '{customer_name}, your VIP status awaits - 30% off + free delivery!',
        content: `
          <h2>Dear {customer_name},</h2>
          <p>As one of our most valued customers with {total_spent} in orders, you mean the world to us.</p>
          <p>We haven't seen you in a while, and we want to make sure everything is okay.</p>
          <h3>🌟 VIP Welcome Back Offer: {incentive} + Free Delivery!</h3>
          <p>This exclusive offer is just for you and expires in 5 days.</p>
          <p>If there's anything we can do to improve your experience, please let us know.</p>
          <p>We're here to serve you the best Indian cuisine in town!</p>
        `,
        target_segments: ['cant_lose_them'],
        campaign_type: 'winback',
        incentive: {
          type: 'percentage',
          value: 30,
          description: '30% off'
        }
      };

      await this.createTargetedCampaign('cant_lose_them', vipWinBackTemplate);
    }

    // Gentle reminder for "Hibernating" customers
    const hibernatingSegment = segments.find(s => s.segment_id === 'hibernating');
    if (hibernatingSegment && hibernatingSegment.customers.length > 0) {
      const hibernatingTemplate: CampaignTemplate = {
        template_id: 'gentle_reminder',
        name: 'Gentle Reminder Campaign',
        subject: 'Missing your favorite Indian flavors? We have new dishes!',
        content: `
          <h2>Hello {customer_name},</h2>
          <p>It's been a while since we've had the pleasure of serving you!</p>
          <p>We've added some exciting new dishes to our menu that we think you'll love.</p>
          <h3>🍛 What's New:</h3>
          <ul>
            <li>Butter Chicken Biryani - A fusion favorite</li>
            <li>Paneer Tikka Masala - Vegetarian delight</li>
            <li>Lamb Rogan Josh - Rich and aromatic</li>
          </ul>
          <p>Come back and try something new, or order your old favorites.</p>
          <p>Use code WELCOME15 for {incentive} your next order!</p>
        `,
        target_segments: ['hibernating'],
        campaign_type: 'winback',
        incentive: {
          type: 'percentage',
          value: 15,
          description: '15% off'
        }
      };

      await this.createTargetedCampaign('hibernating', hibernatingTemplate);
    }
  }

  async runLoyaltyRetentionCampaigns(): Promise<void> {
    const segments = await this.generateCustomerSegments();

    // Retention campaign for "Champions"
    const championsSegment = segments.find(s => s.segment_id === 'champions');
    if (championsSegment && championsSegment.customers.length > 0) {
      const championTemplate: CampaignTemplate = {
        template_id: 'champion_retention',
        name: 'Champion Customer Appreciation',
        subject: 'Thank you for being our champion, {customer_name}!',
        content: `
          <h2>Dear {customer_name},</h2>
          <p>You are absolutely amazing! With {order_count} orders and {total_spent} spent, you're one of our top customers.</p>
          <p>As a token of our appreciation, here's an exclusive offer just for you:</p>
          <h3>🏆 Champion Reward: {incentive} + Priority Service!</h3>
          <p>Plus, we're giving you early access to new menu items before anyone else.</p>
          <p>Thank you for your continued loyalty and for being part of the Desi Flavors family!</p>
        `,
        target_segments: ['champions'],
        campaign_type: 'loyalty',
        incentive: {
          type: 'percentage',
          value: 25,
          description: '25% off'
        }
      };

      await this.createTargetedCampaign('champions', championTemplate);
    }

    // Growth campaign for "Potential Loyalists"
    const potentialSegment = segments.find(s => s.segment_id === 'potential_loyalists');
    if (potentialSegment && potentialSegment.customers.length > 0) {
      const growthTemplate: CampaignTemplate = {
        template_id: 'potential_growth',
        name: 'Potential Loyalist Growth',
        subject: 'Unlock loyalty rewards with your next order!',
        content: `
          <h2>Hi {customer_name},</h2>
          <p>We love having you as a customer! You've ordered {order_count} times and we'd love to see you more often.</p>
          <p>Did you know you can earn loyalty points with every order? You're so close to unlocking great rewards!</p>
          <h3>🎯 Order 2 more times this month and get:</h3>
          <ul>
            <li>100 bonus loyalty points</li>
            <li>Free appetizer on your 5th order</li>
            <li>Access to member-only deals</li>
          </ul>
          <p>Start your journey with {incentive} your next order!</p>
        `,
        target_segments: ['potential_loyalists'],
        campaign_type: 'retention',
        incentive: {
          type: 'percentage',
          value: 15,
          description: '15% off'
        }
      };

      await this.createTargetedCampaign('potential_loyalists', growthTemplate);
    }
  }

  async getCampaignPerformance(campaignId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: campaignEvents } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'campaign_email_sent')
      .eq('event_data->campaign_id', campaignId)
      .gte('created_at', startDate.toISOString());

    const { data: orderEvents } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'order_completed')
      .gte('created_at', startDate.toISOString());

    // Calculate conversion rate
    const emailsSent = Array.isArray(campaignEvents) ? campaignEvents.length : 0;
    const conversions = Array.isArray(orderEvents) && Array.isArray(campaignEvents)
      ? orderEvents.filter(order => 
          campaignEvents.some(email => 
            email && 'user_id' in email && 'user_id' in order &&
            email.user_id === order.user_id && 
            'created_at' in order && 'created_at' in email &&
            new Date(order.created_at as string) > new Date(email.created_at as string)
          )
        ).length
      : 0;

    return {
      campaign_id: campaignId,
      emails_sent: emailsSent,
      conversions: conversions,
      conversion_rate: emailsSent > 0 ? (conversions / emailsSent) * 100 : 0,
      period_days: days
    };
  }
}

// Export singleton instance
export const customerSegmentation = CustomerSegmentationEngine.getInstance(); 