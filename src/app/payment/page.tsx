/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { addToast } from '@heroui/react';
import { submitOrder } from '@/services/orderService';
import PaymentForm from '@/components/payment/PaymentForm';
import OrderSummary from '@/components/payment/OrderSummary';
import PaymentSuccessPage from '@/components/payment/PaymentSuccessPage';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import Script from 'next/script';

// Digital wallet types
type WalletMethod = any;

const Payment = () => {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [card, setCard] = useState<any>(null);
  const [applePayMethod, setApplePayMethod] = useState<WalletMethod>(null);
  const [googlePayMethod, setGooglePayMethod] = useState<WalletMethod>(null);
  const [cashAppMethod, setCashAppMethod] = useState<WalletMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup'|'delivery'>('pickup');
  const [selectedMethod, setSelectedMethod] = useState<'card'|'applePay'|'googlePay'|'cashApp'>('card');
  
  // Form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingZip, setBillingZip] = useState('');
  
  // Customer info state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Initialize Square card
  useEffect(() => {
    const initSquare = async () => {
      if (typeof window === 'undefined') return;
      try {
        await loadSquare();
        const payments = (window as any).Square.payments(process.env.NEXT_PUBLIC_SQUARE_APP_ID!, process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!);
        const card = await payments.card();
        await card.attach('#card-container');
        setCard(card);
        // build digital wallet payment request
        const totalAmount = getCartTotal() + (deliveryMethod === 'delivery' ? 3.99 : 0) + getCartTotal() * 0.0825;
        const paymentRequest = payments.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: { amount: totalAmount.toFixed(2), label: 'Total' },
          requestBillingContact: true
        });
        // initialize digital wallets
        const applePay = await payments.applePay(paymentRequest);
        const googlePay = await payments.googlePay(paymentRequest);
        const cashApp = await payments.cashApp(paymentRequest);
        setApplePayMethod(applePay);
        setGooglePayMethod(googlePay);
        setCashAppMethod(cashApp);
      } catch (e) {
        console.error('Square initialize error', e);
      }
    };
    initSquare();
  }, []);

  // Helper to load Square SDK
  const loadSquare = () => {
    return new Promise<void>((resolve) => {
      if (document.getElementById('square-js')) {
        return resolve();
      }
      const script = document.createElement('script');
      script.id = 'square-js';
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  // Calculate order totals
  const subtotal = getCartTotal();
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const deliveryFee = deliveryMethod === 'delivery' ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Redirect if cart is empty
    if (cartItems.length === 0 && !paymentSuccess) {
      router.push('/cart');
      addToast({
        title: "Cart is empty",
        description: "Please add items to your cart before proceeding to payment",
        color: "danger",
      });
    }
  }, [cartItems.length, router, paymentSuccess, deliveryMethod, getCartTotal]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deliveryMethod');
      if (stored === 'delivery' || stored === 'pickup') {
        setDeliveryMethod(stored);
      }
    }
  }, []);

  // Shared function: send nonce to backend, save order, clear cart
  const processPayment = async (sourceId: string) => {
    setIsProcessing(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const paymentRes = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, amount: total, idempotencyKey }),
      });
      const paymentJson = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentJson.error || 'Payment failed');
      const paymentId = paymentJson.id || paymentJson.payment?.id;
      // Build order data
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone.replace(/\D/g, ''),
        items: cartItems,
        total_amount: total,
        delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
        special_instructions: cartItems.some(item => item.specialInstructions)
          ? cartItems.map(item => item.specialInstructions && `${item.name}: ${item.specialInstructions}`).filter(Boolean).join('; ')
          : undefined,
        order_type: deliveryMethod as 'pickup' | 'delivery',
        payment_id: paymentId,
      };
      const submitResult = await submitOrder(orderData);
      if (!submitResult.success) throw new Error('Failed to save order');
      clearCart(); setPaymentSuccess(true); localStorage.removeItem('deliveryMethod');
      setTimeout(() => {
        router.push('/');
        addToast({ title: 'Order placed successfully!', description: 'Thank you for your order. Your food will be ready soon!' });
      }, 3000);
    } catch (error: any) {
      console.error('Payment error:', error);
      addToast({ title: 'Payment failed', description: error.message || 'Please try again.', color: 'danger' });
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async (method: WalletMethod) => {
    if (!method) {
      addToast({ title: 'Payment not ready', color: 'danger' });
      return;
    }
    try {
      const tokenResult = await method.tokenize();
      if (tokenResult.status !== 'OK') {
        const msg = tokenResult.errors?.[0]?.message || 'Tokenization failed';
        addToast({ title: 'Payment error', description: msg, color: 'danger' });
        return;
      }
      await processPayment(tokenResult.token);
    } catch (error: any) {
      console.error('Wallet payment error:', error);
      // processPayment will handle toast/reset
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate customer info
    if (!customerName || !customerEmail || !customerPhone) {
      addToast({
        title: "Missing information",
        description: "Please fill in all customer information",
        color: "danger",
      });
      return;
    }
    
    // Validate delivery address for delivery orders
    if (deliveryMethod === 'delivery' && !deliveryAddress) {
      addToast({
        title: "Missing address",
        description: "Please provide your delivery address",
        color: "danger",
      });
      return;
    }
    
    try {
      if (!card) {
        addToast({ title: 'Payment not ready', color: 'danger' });
      return;
    }
      const tokenResult = await card.tokenize();
      if (tokenResult.status !== 'OK') {
        const msg = tokenResult.errors?.[0]?.message || 'Tokenization failed';
        addToast({ title: 'Payment error', description: msg, color: 'danger' });
      return;
    }
      await processPayment(tokenResult.token);
    } catch (error: any) {
      console.error('Payment error:', error);
      // processPayment handles toast/reset
    }
  };

  if (paymentSuccess) {
    return (
      <main className="min-h-screen pt-24 pb-20 bg-gray-50 animate-fade-in">
        <PaymentSuccessPage deliveryMethod={deliveryMethod} />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-gray-50 animate-fade-in">
      {/* Load Square Web Payments SDK */}
      <Script src="https://sandbox.web.squarecdn.com/v1/square.js" strategy="beforeInteractive" />
      <div className="container mx-auto px-4 md:px-6 pt-4 animate-fade-in-delay">
        <button 
          onClick={() => router.push('/cart')}
          className="flex items-center font-semibold text-desi-orange hover:text-black transition-colors mb-8 text-base"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Cart</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in-delay">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selector */}
            <PaymentMethodSelector value={selectedMethod} onChange={setSelectedMethod} />

            {/* Payment Form and Actions */}
            <PaymentForm 
              cardName={cardName}
              setCardName={setCardName}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expiryDate={expiryDate}
              setExpiryDate={setExpiryDate}
              cvv={cvv}
              setCvv={setCvv}
              billingZip={billingZip}
              setBillingZip={setBillingZip}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              deliveryMethod={deliveryMethod}
              selectedMethod={selectedMethod}
              isProcessing={isProcessing}
              handleApplePay={() => handleWalletPayment(applePayMethod)}
              handleGooglePay={() => handleWalletPayment(googlePayMethod)}
              handleCashApp={() => handleWalletPayment(cashAppMethod)}
              handleSubmit={handleSubmit}
            />

            <div className="mt-4 text-center text-gray-600 text-sm animate-fade-in-delay">
              Place an order to create your customer profile and start earning loyalty points!
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary 
              cartItems={cartItems}
              subtotal={subtotal}
              tax={tax}
              deliveryFee={deliveryFee}
              total={total}
              deliveryMethod={deliveryMethod}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Payment;
