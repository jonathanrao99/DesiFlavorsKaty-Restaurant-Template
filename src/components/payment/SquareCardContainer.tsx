import { useEffect, useState } from 'react';

interface SquareCardContainerProps {
  onCardReady?: (card: any) => void;
  method: 'card' | 'applePay' | 'googlePay' | 'cashApp';
  onWalletReady?: (wallet: any) => void;
  amount?: string;
}

export default function SquareCardContainer({ onCardReady, method, onWalletReady, amount = '1.00' }: SquareCardContainerProps) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    let cardInstance: any = null;
    let walletInstance: any = null;
    
    // Cleanup function to properly destroy instances
    const cleanup = () => {
      if (cardInstance?.destroy) {
        try {
          cardInstance.destroy();
        } catch (e) {
          console.warn('Error destroying card instance:', e);
        }
      }
      if (walletInstance?.destroy) {
        try {
          walletInstance.destroy();
        } catch (e) {
          console.warn('Error destroying wallet instance:', e);
        }
      }
      // Clear container contents
      const container = document.getElementById(
        method === 'card' ? 'card-container' :
        method === 'googlePay' ? 'google-pay-button' :
        method === 'applePay' ? 'apple-pay-button' :
        method === 'cashApp' ? 'cash-app-pay-button' : ''
      );
      if (container) container.innerHTML = '';
    };

    const init = async () => {
      if (typeof window === 'undefined') return;
      
      // Prevent duplicate initialization: if container already has the button, skip
      const containerId =
        method === 'card' ? 'card-container' :
        method === 'googlePay' ? 'google-pay-button' :
        method === 'applePay' ? 'apple-pay-button' :
        method === 'cashApp' ? 'cash-app-pay-button' : '';
      const existingContainer = document.getElementById(containerId);
      if (existingContainer && existingContainer.children.length > 0) return;

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

      try {
        if (method === 'card') {
          cardInstance = await payments.card({ postalCode: 'required' });
          await cardInstance.attach('#card-container');
          onCardReady && onCardReady(cardInstance);
        } else if (method === 'googlePay') {
          const paymentRequest = payments.paymentRequest({
            countryCode: 'US',
            currencyCode: 'USD',
            total: { amount, label: 'Total' },
          });
          walletInstance = await payments.googlePay(paymentRequest);
          await walletInstance.attach('#google-pay-button', {
            buttonColor: 'black',
            buttonType: 'long',
            buttonSizeMode: 'fill'
          });
          onWalletReady && onWalletReady(walletInstance);
        } else if (method === 'applePay') {
          const paymentRequest = payments.paymentRequest({
            countryCode: 'US',
            currencyCode: 'USD',
            total: { amount, label: 'Total' },
          });
          walletInstance = await payments.applePay(paymentRequest);
          await walletInstance.attach('#apple-pay-button');
          onWalletReady && onWalletReady(walletInstance);
        } else if (method === 'cashApp') {
          const paymentRequest = payments.paymentRequest({
            countryCode: 'US',
            currencyCode: 'USD',
            total: { amount, label: 'Total' },
          });
          walletInstance = await payments.cashAppPay(paymentRequest, {
            redirectURL: window.location.origin + window.location.pathname,
            referenceId: 'order-' + Date.now(),
            buttonOptions: {
              width: 'full',
              shape: 'semicircle',
              customButtonColor: '#00D632'
            }
          });
          onWalletReady?.(walletInstance);
          await walletInstance.attach('#cash-app-pay-button');
        }
      } catch (error) {
        console.error(`Failed to initialize ${method}:`, error);
        cleanup();
      }
    };

    if (hasMounted) init();
    return cleanup;
  }, [onCardReady, onWalletReady, method, hasMounted, amount]);

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