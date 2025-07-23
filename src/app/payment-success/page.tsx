'use client';
import PaymentSuccessPage from '@/components/payment/PaymentSuccessPage';
import { useEffect, Suspense } from 'react';

function PaymentSuccessContent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') window.gtag('event', 'payment_success', {});
      if (typeof window.gtag === 'function') window.gtag('event', 'order_placed', {});
      if (typeof window.umami === 'function') window.umami('payment_success', {});
      if (typeof window.umami === 'function') window.umami('order_placed', {});
    }
  }, []);

  return <PaymentSuccessPage />;
}

export default function PaymentSuccessRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
} 