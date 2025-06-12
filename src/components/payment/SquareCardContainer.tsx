import { useEffect, useState } from 'react';

interface SquareCardContainerProps {
  onCardReady?: (card: any) => void;
  method: 'card' | 'applePay' | 'googlePay' | 'cashApp';
  onWalletReady?: (wallet: any) => void;
}

export default function SquareCardContainer({ onCardReady, method, onWalletReady }: SquareCardContainerProps) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    let cardInstance: any = null;
    let walletInstance: any = null;
    const init = async () => {
      if (typeof window === 'undefined') return;
      if (!(window as any).Square) {
        try {
          await loadSquare();
        } catch (err) {
          console.error('Failed to load Square.js:', err);
          return;
        }
      }
      const { Square } = window as any;
      if (!Square || !Square.payments) {
        console.error('Square payments not available');
        return;
      }
      const payments = Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      );
      if (!payments) {
        console.error('Failed to initialize Square payments');
        return;
      }
      if (method === 'card') {
        const container = document.getElementById('card-container');
        if (container) container.innerHTML = '';
        cardInstance = await payments.card({ postalCode: 'required' });
        await cardInstance.attach('#card-container');
        onCardReady && onCardReady(cardInstance);
      } else if (method === 'googlePay') {
        const container = document.getElementById('google-pay-button');
        if (container) container.innerHTML = '';
        const paymentRequest = payments.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: { amount: '1.00', label: 'Total' }, // Replace with dynamic amount if needed
        });
        walletInstance = await payments.googlePay(paymentRequest);
        await walletInstance.attach('#google-pay-button', { width: '100%', height: '56px' });
        onWalletReady && onWalletReady(walletInstance);
      } else if (method === 'applePay') {
        const container = document.getElementById('apple-pay-button');
        if (container) container.innerHTML = '';
        const paymentRequest = payments.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: { amount: '1.00', label: 'Total' }, // Replace with dynamic amount if needed
        });
        walletInstance = await payments.applePay(paymentRequest);
        await walletInstance.attach('#apple-pay-button', { width: '100%', height: '56px' });
        onWalletReady && onWalletReady(walletInstance);
      } else if (method === 'cashApp') {
        const container = document.getElementById('cash-app-pay-button');
        if (container) container.innerHTML = '';
        const paymentRequest = payments.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: { amount: '1.00', label: 'Total' }, // Replace with dynamic amount if needed
        });
        walletInstance = await payments.cashAppPay(paymentRequest);
        await walletInstance.attach('#cash-app-pay-button', { width: '100%', height: '56px' });
        onWalletReady && onWalletReady(walletInstance);
      }
    };
    if (hasMounted) init();
    return () => {
      if (cardInstance && cardInstance.destroy) cardInstance.destroy();
      if (walletInstance && walletInstance.destroy) walletInstance.destroy();
      if (method === 'card') {
        const container = document.getElementById('card-container');
        if (container) container.innerHTML = '';
      } else if (method === 'googlePay') {
        const container = document.getElementById('google-pay-button');
        if (container) container.innerHTML = '';
      } else if (method === 'applePay') {
        const container = document.getElementById('apple-pay-button');
        if (container) container.innerHTML = '';
      } else if (method === 'cashApp') {
        const container = document.getElementById('cash-app-pay-button');
        if (container) container.innerHTML = '';
      }
    };
  }, [onCardReady, onWalletReady, method, hasMounted]);

  const loadSquare = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('square-js')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'square-js';
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  if (!hasMounted) return null;
  if (method === 'card') return <div id="card-container" />;
  if (method === 'googlePay') return <div id="google-pay-button" />;
  if (method === 'applePay') return <div id="apple-pay-button" />;
  if (method === 'cashApp') return <div id="cash-app-pay-button" />;
  return null;
} 