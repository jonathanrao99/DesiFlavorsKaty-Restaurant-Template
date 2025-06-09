import React from 'react';
import { useState } from 'react';
import { 
  CreditCard, 
  Calendar,
  CreditCardIcon,
  User
} from 'lucide-react';
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";

interface PaymentFormProps {
  cardName: string;
  setCardName: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  expiryDate: string;
  setExpiryDate: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
  billingZip: string;
  setBillingZip: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (value: string) => void;
  deliveryMethod: string;
  selectedMethod: 'card' | 'applePay' | 'googlePay' | 'cashApp';
  handleApplePay: () => void;
  handleGooglePay: () => void;
  handleCashApp: () => void;
  isProcessing: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  cardName,
  setCardName,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  billingZip,
  setBillingZip,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  deliveryMethod,
  selectedMethod,
  handleApplePay,
  handleGooglePay,
  handleCashApp,
  isProcessing,
  handleSubmit
}) => {
  const [customerNameError, setCustomerNameError] = useState('');
  const [customerEmailError, setCustomerEmailError] = useState('');
  const [customerPhoneError, setCustomerPhoneError] = useState('');
  const [deliveryAddressError, setDeliveryAddressError] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const formatPhoneNumber = (value: string) => {
    const v = value.replace(/\D/g, '');

    if (v.length <= 3) {
      return v;
    } else if (v.length <= 6) {
      return `(${v.slice(0, 3)}) ${v.slice(3)}`;
    } else {
      return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerPhone(formatted);
  };

  // Determine if all required customer fields are valid
  const digits = customerPhone.replace(/\D/g, '');
  const isCustomerValid =
    customerName.trim() !== '' &&
    /\S+@\S+\.\S+/.test(customerEmail) &&
    /^\d+$/.test(digits) &&
    digits.length >= 10 &&
    (deliveryMethod !== 'delivery' || deliveryAddress.trim() !== '');

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6 transition-shadow duration-300 ease-in-out hover:shadow-2xl animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-4">Customer Information</h1>

      {/* Customer Info Fields */}
      <div className="space-y-4 mb-6 animate-fade-in-delay">
        <div className="space-y-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <Input
            id="customerName"
            aria-invalid={!!customerNameError}
            aria-describedby={customerNameError ? 'customerName-error' : undefined}
            placeholder="John Smith"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onBlur={() => {
              if (!customerName.trim()) setCustomerNameError('Name is required');
              else setCustomerNameError('');
            }}
            required
            className="rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
          />
          {customerNameError && (
            <p id="customerName-error" role="alert" className="mt-1 text-sm text-red-500">
              {customerNameError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
          <Input
            id="customerEmail"
            aria-invalid={!!customerEmailError}
            aria-describedby={customerEmailError ? 'customerEmail-error' : undefined}
            type="email"
            placeholder="john@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            onBlur={() => {
              if (!customerEmail.trim()) setCustomerEmailError('Email is required');
              else if (!/\S+@\S+\.\S+/.test(customerEmail)) setCustomerEmailError('Enter a valid email address');
              else setCustomerEmailError('');
            }}
            required
            className="rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
          />
          {customerEmailError && (
            <p id="customerEmail-error" role="alert" className="mt-1 text-sm text-red-500">
              {customerEmailError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <Input
            id="customerPhone"
            aria-invalid={!!customerPhoneError}
            aria-describedby={customerPhoneError ? 'customerPhone-error' : undefined}
            placeholder="(123) 456-7890"
            value={customerPhone}
            onChange={handlePhoneChange}
            onBlur={() => {
              const digits = customerPhone.replace(/\D/g, '');
              if (!digits) setCustomerPhoneError('Phone number is required');
              else if (!/^\d+$/.test(digits)) setCustomerPhoneError('Phone number must be numeric');
              else setCustomerPhoneError('');
            }}
            required
            className="rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
          />
          {customerPhoneError && (
            <p id="customerPhone-error" role="alert" className="mt-1 text-sm text-red-500">
              {customerPhoneError}
            </p>
          )}
        </div>
        {deliveryMethod === 'delivery' && (
          <div className="space-y-2">
            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">Delivery Address</label>
            <Input
              id="deliveryAddress"
              aria-invalid={!!deliveryAddressError}
              aria-describedby={deliveryAddressError ? 'deliveryAddress-error' : undefined}
              placeholder="123 Main St, City, State, ZIP"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              onBlur={() => {
                if (!deliveryAddress.trim()) setDeliveryAddressError('Delivery address is required');
                else setDeliveryAddressError('');
              }}
              required
              className="rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
            />
            {deliveryAddressError && (
              <p id="deliveryAddress-error" role="alert" className="mt-1 text-sm text-red-500">
                {deliveryAddressError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payment Method Specific Section */}
      {selectedMethod === 'card' && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-delay">
          {/* Card Details */}
          <h1 className="text-2xl font-display font-bold mb-4 mt-4">Card Details</h1>
          <div className="space-y-2">
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">Name on Card</label>
            <div className="relative">
              <Input id="cardName" placeholder="John Smith" value={cardName} onChange={(e) => setCardName(e.target.value)} className="pl-10 rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none" required />
              <User size={16} className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
            <div className="relative">
              <Input id="cardNumber" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={handleCardNumberChange} maxLength={19} className="pl-10 rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none" required />
              <CreditCardIcon size={16} className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <div className="relative">
                <Input id="expiryDate" placeholder="MM/YY" value={expiryDate} onChange={handleExpiryDateChange} maxLength={5} className="pl-10 rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none" required />
                <Calendar size={16} className="absolute left-3 top-3 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2 col-span-1">
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
              <Input id="cvv" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} maxLength={4} type="password" className="rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none" required />
            </div>
            <div className="space-y-2 col-span-1">
              <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700">Billing Zip</label>
              <Input id="billingZip" placeholder="12345" value={billingZip} onChange={(e) => setBillingZip(e.target.value.replace(/\D/g, ''))} maxLength={5} className="rounded-half border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none" required />
            </div>
          </div>
          <div className="flex items-center pt-4">
            <CreditCard size={16} className="text-gray-500 mr-2" />
            <p className="text-sm text-gray-500">Your payment information is secure and encrypted</p>
          </div>
          <Button
            type="submit"
            disabled={!isCustomerValid || isProcessing}
            className="w-full bg-desi-orange hover:bg-desi-orange/90 text-white py-6 text-lg rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Checkout'}
          </Button>
        </form>
      )}
      {selectedMethod === 'applePay' && (
        <button
          onClick={handleApplePay}
          disabled={!isCustomerValid || isProcessing}
          className="w-full bg-black text-white py-3 text-lg rounded-xl transition-all shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pay with Apple Pay
        </button>
      )}
      {selectedMethod === 'googlePay' && (
        <button
          onClick={handleGooglePay}
          disabled={!isCustomerValid || isProcessing}
          className="w-full bg-red-600 text-white py-3 text-lg rounded-xl transition-all shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pay with GPay
        </button>
      )}
      {selectedMethod === 'cashApp' && (
        <button
          onClick={handleCashApp}
          disabled={!isCustomerValid || isProcessing}
          className="w-full bg-green-500 text-white py-3 text-lg rounded-xl transition-all shadow-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pay with Cash App Pay
        </button>
      )}
    </div>
  );
};

export default PaymentForm;
