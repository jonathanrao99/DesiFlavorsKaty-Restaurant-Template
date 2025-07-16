import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  customer_phone?: string | null;
  order_type?: string | null;
}

function isOrder(item: any): item is Order {
  return (
    item &&
    typeof item.id === 'number' &&
    typeof item.created_at === 'string' &&
    typeof item.customer_name === 'string' &&
    typeof item.total_amount === 'number' &&
    typeof item.status === 'string' &&
    (typeof item.delivery_address === 'string' || item.delivery_address === null)
  );
}

export function useOrders() {
  const { data, isLoading, error } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(data) || (data.length > 0 && (data[0] as any).error)) {
        return [];
      }
      return (data as unknown as Order[]).filter(isOrder);
    },
    staleTime: 1000 * 60 * 1,
  });

  // Return orders data
  return {
    orders: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
} 