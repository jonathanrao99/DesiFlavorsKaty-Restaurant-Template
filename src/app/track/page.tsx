import TrackOrderClient from '@/components/track/TrackOrderClient';

export default function TrackOrderPage() {
  return (
    <TrackOrderClient
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
    />
  );
}
