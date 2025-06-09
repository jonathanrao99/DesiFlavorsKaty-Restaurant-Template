import { FC } from 'react';

export interface SquarePaymentMethodsProps {
  total: number;
  onSuccess: () => void;
  customerInfo: { customerName: string; customerEmail: string; customerPhone: string };
}

const SquarePaymentMethods: FC<SquarePaymentMethodsProps> = ({ total, onSuccess, customerInfo }) => {
  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-sm">Select a payment method:</p>
      <button className="w-full bg-desi-orange text-white py-2 rounded-lg" onClick={onSuccess}>
        Pay with Card (${total.toFixed(2)})
      </button>
      <button className="w-full bg-black text-white py-2 rounded-lg" onClick={onSuccess}>
        Apple Pay
      </button>
      <button className="w-full bg-red-600 text-white py-2 rounded-lg" onClick={onSuccess}>
        Google Pay
      </button>
      <button className="w-full bg-green-500 text-white py-2 rounded-lg" onClick={onSuccess}>
        Cash App Pay
      </button>
    </div>
  );
};

export default SquarePaymentMethods; 
