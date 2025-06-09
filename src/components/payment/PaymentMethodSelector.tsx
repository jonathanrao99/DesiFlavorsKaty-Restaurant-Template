import React from 'react';
import { CreditCard, Apple, Globe, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  value: 'card' | 'applePay' | 'googlePay' | 'cashApp';
  onChange: (method: 'card' | 'applePay' | 'googlePay' | 'cashApp') => void;
}

const options = [
  { value: 'card', label: 'Card', icon: <CreditCard size={20} /> },
  { value: 'applePay', label: 'Apple Pay', icon: <Apple size={20} /> },
  { value: 'googlePay', label: 'GPay', icon: <Globe size={20} /> },
  { value: 'cashApp', label: 'Cash App', icon: <DollarSign size={20} /> },
] as const;

// Styles for selected and unselected states
const selectedStyles: Record<string, string> = {
  card: 'bg-desi-orange text-white',
  applePay: 'bg-black text-white',
  googlePay: 'bg-red-600 text-white',
  cashApp: 'bg-green-500 text-white',
};

const unselectedStyles: Record<string, string> = {
  card: 'border border-desi-orange text-desi-orange hover:bg-desi-orange/10',
  applePay: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  googlePay: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  cashApp: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
};

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Payment Methods"
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-2xl py-4 px-2 cursor-pointer transition-colors duration-300 ease-in-out',
            value === opt.value
              ? selectedStyles[opt.value]
              : unselectedStyles[opt.value]
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{opt.icon}</span>
            <span className="text-base font-medium">{opt.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
} 
