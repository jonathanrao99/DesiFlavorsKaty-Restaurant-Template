import { Resend } from 'resend';
import Twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Resend email client
const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Twilio SMS client
const twilio = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

interface NotificationData {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  points_earned?: number;
  points_redeemed?: number;
  reward_value?: number;
  total_points: number;
  loyalty_tier: string;
}

// Email templates
const EMAIL_TEMPLATES = {
  POINTS_EARNED: (data: NotificationData) => ({
    subject: `🎉 You earned ${data.points_earned} loyalty points at Desi Flavors Hub!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Desi Flavors Hub</h1>
          <p style="color: white; margin: 5px 0;">Authentic Indian Cuisine</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #ff6b35;">🎉 Points Earned!</h2>
          <p>Hi ${data.customer_name},</p>
          
          <p>Great news! You just earned <strong>${data.points_earned} loyalty points</strong> with your recent order.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ff6b35;">Your Loyalty Status</h3>
            <p><strong>Current Points:</strong> ${data.total_points}</p>
            <p><strong>Loyalty Tier:</strong> ${data.loyalty_tier}</p>
            ${data.total_points >= 100 ? '<p style="color: #28a745;"><strong>🎁 You have rewards available!</strong></p>' : `<p>You need ${100 - (data.total_points % 100)} more points for your next $10 reward!</p>`}
          </div>
          
          <p>Keep ordering to earn more points and unlock exclusive rewards!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/menu" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Order Again</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Desi Flavors Hub - Bringing authentic Indian flavors to your table</p>
          <p>Visit us at ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    `
  }),

  REWARD_AVAILABLE: (data: NotificationData) => ({
    subject: `🎁 Reward Available! You have ${data.total_points} loyalty points`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Desi Flavors Hub</h1>
          <p style="color: white; margin: 5px 0;">Authentic Indian Cuisine</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #ff6b35;">🎁 Reward Ready!</h2>
          <p>Hi ${data.customer_name},</p>
          
          <p>Congratulations! You now have <strong>${data.total_points} loyalty points</strong> and rewards waiting for you!</p>
          
          <div style="background: #e8f5e8; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #28a745;">Available Rewards</h3>
            ${data.total_points >= 100 ? '<p><strong>💰 $10 off</strong> (100 points)</p>' : ''}
            ${data.total_points >= 250 ? '<p><strong>💰 $25 off</strong> (250 points)</p>' : ''}
            ${data.total_points >= 500 ? '<p><strong>💰 $50 off</strong> (500 points)</p>' : ''}
          </div>
          
          <p>Use your rewards on your next order and enjoy your favorite dishes for less!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cart" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-right: 10px;">Redeem Now</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/menu" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View Menu</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Desi Flavors Hub - Bringing authentic Indian flavors to your table</p>
          <p>Visit us at ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    `
  }),

  REWARD_REDEEMED: (data: NotificationData) => ({
    subject: `✅ Reward Redeemed! You saved $${data.reward_value}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Desi Flavors Hub</h1>
          <p style="color: white; margin: 5px 0;">Authentic Indian Cuisine</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #28a745;">✅ Reward Redeemed!</h2>
          <p>Hi ${data.customer_name},</p>
          
          <p>Congratulations! You successfully redeemed <strong>${data.points_redeemed} points</strong> for <strong>$${data.reward_value} off</strong> your order.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ff6b35;">Updated Loyalty Status</h3>
            <p><strong>Remaining Points:</strong> ${data.total_points}</p>
            <p><strong>Loyalty Tier:</strong> ${data.loyalty_tier}</p>
          </div>
          
          <p>Thank you for being a loyal customer! Keep ordering to earn more points.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/menu" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Order Again</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Desi Flavors Hub - Bringing authentic Indian flavors to your table</p>
          <p>Visit us at ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    `
  })
};

// SMS templates
const SMS_TEMPLATES = {
  POINTS_EARNED: (data: NotificationData) => 
    `🎉 Desi Flavors Hub: You earned ${data.points_earned} points! Total: ${data.total_points} points. ${data.total_points >= 100 ? 'Rewards available!' : `${100 - (data.total_points % 100)} more for next reward.`} Order: ${process.env.NEXT_PUBLIC_SITE_URL}/menu`,
  
  REWARD_AVAILABLE: (data: NotificationData) => 
    `🎁 Desi Flavors Hub: ${data.total_points} points = Rewards ready! $10 off available. Redeem: ${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
  
  REWARD_REDEEMED: (data: NotificationData) => 
    `✅ Desi Flavors Hub: Reward redeemed! You saved $${data.reward_value}. Remaining: ${data.total_points} points. Thanks for your loyalty!`
};

export async function sendLoyaltyNotification(
  type: 'POINTS_EARNED' | 'REWARD_AVAILABLE' | 'REWARD_REDEEMED',
  data: NotificationData,
  channels: ('email' | 'sms')[] = ['email']
) {
  const notifications: Array<{type: string; status: string}> = [];

  // Send email via Resend
  if (channels.includes('email') && data.customer_email) {
    try {
      const { subject, html } = EMAIL_TEMPLATES[type](data);
      await resend.emails.send({
        from: process.env.RESEND_SENDER_EMAIL!,
        to: [data.customer_email],
        subject,
        html
      });
      notifications.push({ type: 'email', status: 'sent' });
    } catch (error) {
      console.error('Resend email error:', error);
      notifications.push({ type: 'email', status: 'error' });
    }
  }

  // Send SMS via Twilio
  if (channels.includes('sms') && data.customer_phone) {
    try {
      const smsBody = SMS_TEMPLATES[type](data);
      await twilio.messages.create({
        to: data.customer_phone,
        from: process.env.TWILIO_PHONE_NUMBER!,
        body: smsBody
      });
      notifications.push({ type: 'sms', status: 'sent' });
    } catch (error) {
      console.error('Twilio SMS error:', error);
      notifications.push({ type: 'sms', status: 'error' });
    }
  }

  // Log notification event
  try {
    await supabase.from('analytics_events').insert({
      event_name: `loyalty_notification_${type.toLowerCase()}`,
      event_data: { customer_id: data.customer_id, channels, notifications },
      user_id: data.customer_id.toString()
    });
  } catch (error) {
    console.error('Error logging notification event:', error);
  }

  return notifications;
}

export async function checkAndSendRewardNotifications() {
  try {
    // Get customers who just reached reward thresholds
    const { data: customersWithRewards, error } = await supabase
      .from('customer_loyalty_summary')
      .select(`
        customer_id,
        current_points,
        loyalty_tier,
        customers (
          name,
          email,
          phone
        )
      `)
      .gte('current_points', 100);

    if (error) {
      console.error('Error fetching customers with rewards:', error);
      return;
    }

    for (const customer of customersWithRewards || []) {
      // Check if we've already sent a notification for this point level
      const { data: existingNotification } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'loyalty_notification_reward_available')
        .eq('user_id', customer.customer_id.toString())
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .single();

      if (!existingNotification && customer.customers?.length) {
        const c = customer.customers[0];
        await sendLoyaltyNotification('REWARD_AVAILABLE', {
          customer_id: customer.customer_id,
          customer_name: c.name,
          customer_email: c.email,
          customer_phone: c.phone,
          total_points: customer.current_points,
          loyalty_tier: customer.loyalty_tier
        });
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendRewardNotifications:', error);
  }
}

// Function to be called when points are earned
export async function notifyPointsEarned(customerId: number, pointsEarned: number) {
  try {
    const { data: customerData, error } = await supabase
      .from('customer_loyalty_summary')
      .select(`
        customer_id,
        current_points,
        loyalty_tier,
        customers (
          name,
          email,
          phone
        )
      `)
      .eq('customer_id', customerId)
      .single();

    if (error || !customerData?.customers?.length) {
      console.error('Error fetching customer for notification:', error);
      return;
    }

    const c = customerData.customers[0];
    await sendLoyaltyNotification('POINTS_EARNED', {
      customer_id: customerId,
      customer_name: c.name,
      customer_email: c.email,
      customer_phone: c.phone,
      points_earned: pointsEarned,
      total_points: customerData.current_points,
      loyalty_tier: customerData.loyalty_tier
    });
  } catch (error) {
    console.error('Error in notifyPointsEarned:', error);
  }
}

// Function to be called when rewards are redeemed
export async function notifyRewardRedeemed(customerId: number, pointsRedeemed: number, rewardValue: number) {
  try {
    const { data: customerData, error } = await supabase
      .from('customer_loyalty_summary')
      .select(`
        customer_id,
        current_points,
        loyalty_tier,
        customers (
          name,
          email,
          phone
        )
      `)
      .eq('customer_id', customerId)
      .single();

    if (error || !customerData?.customers?.length) {
      console.error('Error fetching customer for notification:', error);
      return;
    }

    const c2 = customerData.customers[0];
    await sendLoyaltyNotification('REWARD_REDEEMED', {
      customer_id: customerId,
      customer_name: c2.name,
      customer_email: c2.email,
      customer_phone: c2.phone,
      points_redeemed: pointsRedeemed,
      reward_value: rewardValue,
      total_points: customerData.current_points,
      loyalty_tier: customerData.loyalty_tier
    });
  } catch (error) {
    console.error('Error in notifyRewardRedeemed:', error);
  }
} 