'use client';
import { CheckCircle } from 'lucide-react';
import { Button } from "@heroui/react";
import { useRouter } from 'next/navigation';

interface PaymentSuccessPageProps {
  deliveryMethod: string;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ deliveryMethod }) => {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 md:px-6 pt-10">
      <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-display font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your food will be prepared {deliveryMethod === 'pickup' ? 'for pickup' : 'for delivery'} shortly.
        </p>
        <p className="text-gray-600 mb-6">
          A confirmation has been sent to your email address.
        </p>
        <Button 
          onClick={() => router.push('/')}
          className="bg-desi-orange hover:bg-desi-orange/90 text-white"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
