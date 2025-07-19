'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, Clock, Truck, ChefHat, Package } from 'lucide-react';



interface Order {
  id: number;
  status: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  created_at: string;
  scheduled_time?: string;
  external_delivery_id?: string;
  delivery_address?: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', icon: Package, description: 'Your order has been received and is being processed' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed and sent to kitchen' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your delicious food is being prepared' },
  { key: 'ready', label: 'Ready', icon: Clock, description: 'Order is ready for pickup/delivery' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'Driver is on the way to you' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order has been delivered successfully' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, description: 'Order completed' }
];

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        throw new Error('Order not found');
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Tracking</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
              className="flex-grow p-2 border rounded-md"
            />
            <button
              onClick={handleTrackOrder}
              disabled={loading}
              className="p-2 px-4 bg-desi-orange text-white rounded-md disabled:bg-gray-400"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        {order && (
          <>
            {/* Order Details, Status Timeline, etc. */}
          </>
        )}
      </div>
    </div>
  );
}
