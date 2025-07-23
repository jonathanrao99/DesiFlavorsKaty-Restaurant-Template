// Utility functions for calling Supabase Edge Functions

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper function to call Supabase Edge Functions
async function callSupabaseFunction(functionName: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  console.log(`Calling Supabase function: ${functionName}`);
  console.log('Request URL:', url);
  console.log('Request options:', options);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });

  console.log(`Supabase function ${functionName} response status:`, response.status);
  console.log(`Supabase function ${functionName} response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const error = await response.text();
    console.error(`Supabase function ${functionName} error:`, error);
    throw new Error(`Supabase function error: ${error}`);
  }

  const result = await response.json();
  console.log(`Supabase function ${functionName} result:`, result);
  return result;
}

// Orders API functions
export const ordersApi = {
  // List/filter orders
  async getOrders(params: { status?: string; customer_id?: string } = {}) {
    const url = new URL(`${SUPABASE_URL}/functions/v1/orders`);
    if (params.status) url.searchParams.set('status', params.status);
    if (params.customer_id) url.searchParams.set('customer_id', params.customer_id);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  // Update order (PATCH)
  async updateOrder(orderUpdate: { id: string; [key: string]: any }) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderUpdate),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};

// Customer API functions
export const customerApi = {
  // Lookup customer by email or phone
  async lookupCustomer(lookup: string) {
    const url = new URL(`${SUPABASE_URL}/functions/v1/customer`);
    url.searchParams.set('lookup', lookup);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  // Upsert customer
  async upsertCustomer(customerData: any) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/customer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};

// Delivery fee calculation
export const deliveryApi = {
  // Calculate delivery fee
  async calculateFee(address: string, dropoffPhoneNumber: string) {
    return callSupabaseFunction('calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ address, dropoffPhoneNumber }),
    });
  },

  // Schedule delivery
  async scheduleDelivery(deliveryData: {
    external_delivery_id: string;
    dropoff_address: string;
    dropoff_phone_number: string;
  }) {
    return callSupabaseFunction('schedule-delivery', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  },

  // Create Shipday order after successful payment (using REST API)
  async createShipdayOrder(orderData: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    pickupTime: string;
    deliveryTime: string;
    orderItems?: any[];
    totalAmount: number;
    deliveryFee: number;
    paymentId?: string;
  }) {
    return callSupabaseFunction('create-shipday-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Create Shipday order using Python SDK (new)
  async createShipdayOrderSDK(orderData: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    orderItems?: any[];
    subtotal: number;
    deliveryFee: number;
    taxAmount: number;
    totalAmount: number;
    paymentId?: string;
  }) {
    return callSupabaseFunction('create-shipday-order-sdk', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Estimate delivery fee using Python SDK
  async estimateDeliveryFee(deliveryAddress: string, orderValue: number = 0) {
    return callSupabaseFunction('estimate-delivery-fee', {
      method: 'POST',
      body: JSON.stringify({ deliveryAddress, orderValue }),
    });
  },

  // Send order confirmation emails
  async sendOrderConfirmation(orderData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress?: string;
    fulfillmentMethod: string;
    orderItems: any[];
    subtotal: number;
    deliveryFee: number;
    taxAmount: number;
    totalAmount: number;
    scheduledTime?: string;
  }) {
    return callSupabaseFunction('send-order-confirmation', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Create Shipday pickup order (no delivery driver)
  async createShipdayPickupOrder(orderData: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderItems?: any[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }) {
    return callSupabaseFunction('create-shipday-pickup-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Send phone call notification
  async sendPhoneNotification(notificationData: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    fulfillmentMethod: string;
    totalAmount: number;
    orderItems: any[];
  }) {
    return callSupabaseFunction('send-phone-notification', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },
};

// Analytics API functions
export const analyticsApi = {
  // Get comprehensive analytics
  async getComprehensiveAnalytics() {
    return callSupabaseFunction('analytics/comprehensive', {
      method: 'GET',
    });
  },

  // Get geographic analytics
  async getGeographicAnalytics() {
    return callSupabaseFunction('analytics/geographic', {
      method: 'GET',
    });
  },
};

// Export data API functions
export const exportApi = {
  // Export orders data
  async exportOrders(format: 'csv' | 'json' = 'csv') {
    return callSupabaseFunction('export-data', {
      method: 'POST',
      body: JSON.stringify({ type: 'orders', format }),
    });
  },

  // Export customers data
  async exportCustomers(format: 'csv' | 'json' = 'csv') {
    return callSupabaseFunction('export-data', {
      method: 'POST',
      body: JSON.stringify({ type: 'customers', format }),
    });
  },
};

// Newsletter API functions
export const newsletterApi = {
  // Subscribe to newsletter
  async subscribe(email: string, name?: string) {
    return callSupabaseFunction('newsletter', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  },

  // Get newsletter subscribers
  async getSubscribers() {
    return callSupabaseFunction('newsletter', {
      method: 'GET',
    });
  },
};

// Reviews API functions
export const reviewsApi = {
  // Get reviews
  async getReviews() {
    return callSupabaseFunction('reviews', {
      method: 'GET',
    });
  },

  // Submit review
  async submitReview(reviewData: any) {
    return callSupabaseFunction('reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },
};

// Email marketing API functions
export const emailMarketingApi = {
  // Send marketing email
  async sendMarketingEmail(emailData: any) {
    return callSupabaseFunction('email-marketing', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },

  // Get email campaigns
  async getEmailCampaigns() {
    return callSupabaseFunction('email-marketing', {
      method: 'GET',
    });
  },
};

// Inventory API functions
export const inventoryApi = {
  // Get inventory
  async getInventory() {
    return callSupabaseFunction('inventory', {
      method: 'GET',
    });
  },

  // Update inventory
  async updateInventory(inventoryData: any) {
    return callSupabaseFunction('inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
  },
};

// Loyalty API functions
export const loyaltyApi = {
  // Redeem loyalty points
  async redeemLoyalty(customerId: string, points: number) {
    return callSupabaseFunction('redeem-loyalty', {
      method: 'POST',
      body: JSON.stringify({ customerId, points }),
    });
  },
};

// Payment API functions
export const paymentApi = {
  // Create payment
  async createPayment(paymentData: any) {
    return callSupabaseFunction('create-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Create payment link
  async createPaymentLink(paymentData: any) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Send order confirmation emails
  async sendOrderConfirmation(orderData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress?: string;
    fulfillmentMethod: string;
    orderItems: any[];
    subtotal: number;
    deliveryFee: number;
    taxAmount: number;
    totalAmount: number;
    scheduledTime?: string;
  }) {
    return callSupabaseFunction('send-order-confirmation', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
};

// Scheduled deliveries API functions
export const scheduledDeliveriesApi = {
  // Process scheduled deliveries
  async processScheduledDeliveries() {
    return callSupabaseFunction('process-scheduled-deliveries', {
      method: 'POST',
    });
  },
};

// Send email API functions
export const emailApi = {
  // Send email
  async sendEmail(emailData: any) {
    return callSupabaseFunction('send-email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },
};

// MENU
export async function getMenu(category?: string) {
  const url = `/functions/v1/menu${category ? `?category=${encodeURIComponent(category)}` : ''}`;
  const res = await fetch(url);
  return res.json();
}

// REVIEWS
export async function getReviews() {
  const res = await fetch('/functions/v1/reviews');
  return res.json();
}

export async function submitReview(review: any) {
  const res = await fetch('/functions/v1/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  return res.json();
}

// NEWSLETTER
export async function getNewsletterSubscribers() {
  const res = await fetch('/functions/v1/newsletter');
  return res.json();
}

export async function subscribeNewsletter(data: any) {
  const res = await fetch('/functions/v1/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// INVENTORY
export async function getInventory() {
  const res = await fetch('/functions/v1/inventory');
  return res.json();
}

export async function updateInventory(updates: any) {
  const res = await fetch('/functions/v1/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

// ANALYTICS
export async function getAnalytics() {
  const res = await fetch('/functions/v1/analytics');
  return res.json();
}

// EXPORT DATA
export async function exportData() {
  const res = await fetch('/functions/v1/export-data', { method: 'POST' });
  if (res.headers.get('Content-Type')?.includes('text/csv')) {
    return res.text();
  }
  return res.json();
}

// LOYALTY
export async function redeemLoyalty(data: any) {
  const res = await fetch('/functions/v1/redeem-loyalty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// SEND EMAIL (Resend)
export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const res = await fetch('/functions/v1/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
  return res.json();
}

// EMAIL MARKETING (Resend)
export async function sendEmailCampaign({ to, subject, html }: { to: string[], subject: string, html: string }) {
  const res = await fetch('/functions/v1/email-marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
  return res.json();
} 