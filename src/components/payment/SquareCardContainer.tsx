import { useEffect } from 'react';

export default function SquareCardContainer({ onCardReady }: { onCardReady: (card: any) => void }) {
  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;
      await loadSquare();
      const payments = (window as any).Square.payments(process.env.NEXT_PUBLIC_SQUARE_APP_ID!, process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!);
      const card = await payments.card();
      await card.attach('#card-container');
      onCardReady(card);
    };
    init();
  }, [onCardReady]);

  const loadSquare = () => {
    return new Promise<void>((resolve) => {
      if (document.getElementById('square-js')) return resolve();
      const script = document.createElement('script');
      script.id = 'square-js';
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  return <div id="card-container" className="w-full" />;
} 