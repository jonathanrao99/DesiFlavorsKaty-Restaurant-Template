import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Desi Flavors Hub! 🌶️',
    html: (customerName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Welcome to Desi Flavors Hub!</h1>
        <p>Hi ${customerName},</p>
        <p>Thank you for joining our food truck family! We're excited to serve you authentic Indian flavors.</p>
        <h3>What's Next?</h3>
        <ul>
          <li>🍛 Browse our delicious menu</li>
          <li>📱 Follow us on social media for daily specials</li>
          <li>⭐ Earn loyalty points with every order</li>
        </ul>
        <p>Visit us at <strong>1989 North Fry Rd, Katy, TX 77494</strong></p>
        <p>Hours: Monday - Sunday, 5:00 PM - 1:00 AM</p>
        <a href="https://desiflavorskaty.com/menu" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Order Now</a>
      </div>
    `
  },
  orderFollowUp: {
    subject: 'How was your Desi Flavors experience? ⭐',
    html: (customerName: string, orderId: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Thank you for your order!</h1>
        <p>Hi ${customerName},</p>
        <p>We hope you enjoyed your recent order (#${orderId}) from Desi Flavors Hub!</p>
        <h3>Share Your Experience</h3>
        <p>Your feedback helps us serve you better. Please take a moment to:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://g.page/r/CRmOX8QcJGYREAI/review" style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 8px;">Leave a Google Review</a>
          <a href="https://www.facebook.com/profile.php?id=61574761892311" style="background: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 8px;">Follow on Facebook</a>
        </div>
        <h3>Earn Loyalty Rewards! 🎁</h3>
        <p>You're earning points with every order. Collect 100 points to get $10 off your next order!</p>
        <a href="https://desiflavorskaty.com/menu" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Order Again</a>
      </div>
    `
  },
  loyaltyReward: {
    subject: '🎉 You\'ve earned a reward at Desi Flavors Hub!',
    html: (customerName: string, points: number, rewardAmount: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Congratulations! 🎉</h1>
        <p>Hi ${customerName},</p>
        <p>You've reached <strong>${points} loyalty points</strong> and earned a <strong>$${rewardAmount} reward</strong>!</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <h2 style="color: #f59e0b; margin: 0;">$${rewardAmount} OFF</h2>
          <p style="margin: 8px 0;">Your next order</p>
        </div>
        <p>Use this reward on your next visit to enjoy more of our authentic Indian cuisine!</p>
        <a href="https://desiflavorskaty.com/menu" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Redeem Now</a>
      </div>
    `
  },
  weeklySpecial: {
    subject: 'This Week\'s Special at Desi Flavors Hub! 🔥',
    html: (specialItem: string, discount: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Weekly Special Alert! 🔥</h1>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <h2 style="color: #f59e0b; margin: 0;">${specialItem}</h2>
          <p style="margin: 8px 0; font-size: 18px; font-weight: bold;">${discount} OFF This Week!</p>
        </div>
        <p>Don't miss out on this week's featured dish. Available Monday - Sunday, 5:00 PM - 1:00 AM.</p>
        <p><strong>Location:</strong> 1989 North Fry Rd, Katy, TX 77494</p>
        <a href="https://desiflavorskaty.com/menu" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Order Now</a>
      </div>
    `
  }
};

// GET: Fetch customer segments and campaign stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'segments') {
      // Get customer segments
      const { data: customers, error } = await supabase
        .from('orders')
        .select('customer_email, customer_name, total_amount, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Segment customers
      const customerMap = new Map();
      customers?.forEach(order => {
        const email = order.customer_email;
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: order.customer_name,
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: order.created_at,
            firstOrderDate: order.created_at
          });
        }
        const customer = customerMap.get(email);
        customer.totalSpent += order.total_amount;
        customer.orderCount += 1;
        customer.firstOrderDate = order.created_at; // Will be earliest due to ordering
      });

      const customerList = Array.from(customerMap.values());
      
      const segments = {
        newCustomers: customerList.filter(c => c.orderCount === 1),
        loyalCustomers: customerList.filter(c => c.orderCount >= 5),
        highValueCustomers: customerList.filter(c => c.totalSpent >= 100),
        recentCustomers: customerList.filter(c => {
          const daysSinceLastOrder = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLastOrder <= 30;
        }),
        dormantCustomers: customerList.filter(c => {
          const daysSinceLastOrder = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLastOrder > 60;
        })
      };

      return NextResponse.json({
        totalCustomers: customerList.length,
        segments: {
          newCustomers: segments.newCustomers.length,
          loyalCustomers: segments.loyalCustomers.length,
          highValueCustomers: segments.highValueCustomers.length,
          recentCustomers: segments.recentCustomers.length,
          dormantCustomers: segments.dormantCustomers.length
        },
        details: segments
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching email marketing data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Send marketing emails
export async function POST(req: NextRequest) {
  try {
    const { type, recipients, customData } = await req.json();

    if (!type || !recipients) {
      return NextResponse.json({ error: 'type and recipients are required' }, { status: 400 });
    }

    console.log(`Sending ${type} emails to ${recipients.length} recipients`);

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        let emailContent;
        
        switch (type) {
          case 'welcome':
            emailContent = {
              from: 'Desi Flavors Hub <info@desiflavorskaty.com>',
              to: recipient.email,
              subject: EMAIL_TEMPLATES.welcome.subject,
              html: EMAIL_TEMPLATES.welcome.html(recipient.name || 'Food Lover')
            };
            break;
            
          case 'orderFollowUp':
            emailContent = {
              from: 'Desi Flavors Hub <info@desiflavorskaty.com>',
              to: recipient.email,
              subject: EMAIL_TEMPLATES.orderFollowUp.subject,
              html: EMAIL_TEMPLATES.orderFollowUp.html(
                recipient.name || 'Food Lover',
                customData?.orderId || 'N/A'
              )
            };
            break;
            
          case 'loyaltyReward':
            emailContent = {
              from: 'Desi Flavors Hub <info@desiflavorskaty.com>',
              to: recipient.email,
              subject: EMAIL_TEMPLATES.loyaltyReward.subject,
              html: EMAIL_TEMPLATES.loyaltyReward.html(
                recipient.name || 'Food Lover',
                customData?.points || 100,
                customData?.rewardAmount || 10
              )
            };
            break;
            
          case 'weeklySpecial':
            emailContent = {
              from: 'Desi Flavors Hub <info@desiflavorskaty.com>',
              to: recipient.email,
              subject: EMAIL_TEMPLATES.weeklySpecial.subject,
              html: EMAIL_TEMPLATES.weeklySpecial.html(
                customData?.specialItem || 'Chicken Dum Biryani',
                customData?.discount || '20%'
              )
            };
            break;
            
          default:
            throw new Error(`Unknown email type: ${type}`);
        }

        const result = await resend.emails.send(emailContent);
        
        if (result.data) {
          results.push({
            email: recipient.email,
            success: true,
            id: result.data.id
          });
          
          // Log email campaign in database
          await supabase.from('email_campaigns').insert({
            email: recipient.email,
            campaign_type: type,
            email_id: result.data.id,
            sent_at: new Date().toISOString(),
            custom_data: customData
          });
        } else {
          errors.push({
            email: recipient.email,
            error: result.error?.message || 'Unknown error'
          });
        }
      } catch (emailError: any) {
        console.error(`Error sending email to ${recipient.email}:`, emailError);
        errors.push({
          email: recipient.email,
          error: emailError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error: any) {
    console.error('Error in email marketing campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Trigger automated email based on order events
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, eventType } = await req.json();

    if (!orderId || !eventType) {
      return NextResponse.json({ error: 'orderId and eventType are required' }, { status: 400 });
    }

    // Fetch order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let emailSent = false;

    switch (eventType) {
      case 'order_completed':
        // Send follow-up email 24 hours after order completion
        setTimeout(async () => {
          try {
            const emailContent = {
              from: 'Desi Flavors Hub <info@desiflavorskaty.com>',
              to: order.customer_email,
              subject: EMAIL_TEMPLATES.orderFollowUp.subject,
              html: EMAIL_TEMPLATES.orderFollowUp.html(order.customer_name, orderId.toString())
            };

            const result = await resend.emails.send(emailContent);
            
            if (result.data) {
              await supabase.from('email_campaigns').insert({
                email: order.customer_email,
                campaign_type: 'automated_followup',
                email_id: result.data.id,
                sent_at: new Date().toISOString(),
                custom_data: { orderId, eventType }
              });
            }
          } catch (error) {
            console.error('Error sending automated follow-up email:', error);
          }
        }, 24 * 60 * 60 * 1000); // 24 hours delay
        
        emailSent = true;
        break;

      case 'first_order':
        // Send welcome email immediately
        try {
          const emailContent = {
            from: 'Desi Flavors Hub <info@desiflavorskaty.com>',
            to: order.customer_email,
            subject: EMAIL_TEMPLATES.welcome.subject,
            html: EMAIL_TEMPLATES.welcome.html(order.customer_name)
          };

          const result = await resend.emails.send(emailContent);
          
          if (result.data) {
            await supabase.from('email_campaigns').insert({
              email: order.customer_email,
              campaign_type: 'automated_welcome',
              email_id: result.data.id,
              sent_at: new Date().toISOString(),
              custom_data: { orderId, eventType }
            });
            emailSent = true;
          }
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
        break;

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: `Automated email triggered for ${eventType}`
    });
  } catch (error: any) {
    console.error('Error triggering automated email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 