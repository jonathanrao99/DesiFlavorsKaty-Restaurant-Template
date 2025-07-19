"use client";
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SquareCardContainer from '@/components/payment/SquareCardContainer';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { createPortal } from 'react-dom';

interface PaymentFormProps {
  // Cardholder name input
  cardName: string;
  setCardName: (value: string) => void;
  // Square payments card element ready callback
  onCardReady: (card: any) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (value: string) => void;
  onAddressSelect: () => void;
  onAddressInput: () => void;
  deliveryMethod: string;
  isProcessing: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  deliveryFee: number | null;
  feeLoading: boolean;
  amount: string;
}

// Declare google on window for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

const PaymentForm = ({
  cardName,
  setCardName,
  onCardReady,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  onAddressSelect,
  onAddressInput,
  deliveryMethod,
  isProcessing,
  handleSubmit,
  deliveryFee,
  feeLoading,
  amount
}: PaymentFormProps) => {
  const [customerNameError, setCustomerNameError] = useState('');
  const [customerEmailError, setCustomerEmailError] = useState('');
  const [customerPhoneError, setCustomerPhoneError] = useState('');
  const [deliveryAddressError, setDeliveryAddressError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<{ top: number; left: number; width: number } | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  // Setup Google Places autocomplete using React hook
  const {
    ready,
    value: autoCompleteValue,
    suggestions: { status: suggestionStatus, data: suggestionData },
    setValue: setAutoCompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  // Sync prop deliveryAddress to hook value
  useEffect(() => {
    setAutoCompleteValue(deliveryAddress, false);
  }, [deliveryAddress, setAutoCompleteValue]);

  // Update dropdown position when suggestions appear
  useEffect(() => {
    if (suggestionStatus === 'OK' && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyles({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    } else {
      setDropdownStyles(null);
    }
  }, [suggestionStatus, suggestionData]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryAddress(e.target.value);
    setAutoCompleteValue(e.target.value);
    onAddressInput();
  };

  const handleSelectSuggestion = (description: string) => {
    setDeliveryAddress(description);
    clearSuggestions();
    setDeliveryAddressError('');
    onAddressSelect();
  };

  // Load Google Maps script only when needed
  useEffect(() => {
    if (deliveryMethod === 'delivery' && !scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places';
      script.async = true;
      document.head.appendChild(script);
      setScriptLoaded(true);
    }
  }, [deliveryMethod, scriptLoaded]);

  const handleCheckoutStart = () => {
    // logAnalyticsEvent('checkout_started', {});
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'checkout_started', {});
      window.umami && window.umami('checkout_started', {});
    }
    // ...existing logic...
  };

  const handleCheckoutAbandon = () => {
    // logAnalyticsEvent('checkout_abandoned', {});
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'checkout_abandoned', {});
      window.umami && window.umami('checkout_abandoned', {});
    }
    // ...existing logic...
  };

  const handlePaymentSuccess = (orderId) => {
    // logAnalyticsEvent('payment_success', { orderId });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'payment_success', { orderId });
      window.umami && window.umami('payment_success', { orderId });
    }
    // ...existing logic...
  };

  const handlePaymentFailure = (error) => {
    // logAnalyticsEvent('payment_failed', { error });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'payment_failed', { error });
      window.umami && window.umami('payment_failed', { error });
    }
    // ...existing logic...
  };

  const handleOrderPlaced = (orderId) => {
    // logAnalyticsEvent('order_placed', { orderId });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'order_placed', { orderId });
      window.umami && window.umami('order_placed', { orderId });
    }
    // ...existing logic...
  };

  return (
    <div>
      {/* Disable browser autofill hack: hidden dummy fields */}
      <div style={{ position: 'absolute', top: '-999px', left: '-999px', opacity: 0, height: 0, overflow: 'hidden' }}>
        <input type="text" name="fakeusernameremembered" autoComplete="off" />
        <input type="password" name="fakepasswordremembered" autoComplete="off" />
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-visible p-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold mb-4">Checkout</h1>

        {/* Customer Info Fields */}
        <div className="space-y-4 mb-6 animate-fade-in-delay">
          <div className="space-y-2">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <Input
              id="customerName"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
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
              className="rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
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
              autoComplete="off"
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
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
              className="rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
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
              autoComplete="off"
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
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
              className="rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
            />
            {customerPhoneError && (
              <p id="customerPhone-error" role="alert" className="mt-1 text-sm text-red-500">
                {customerPhoneError}
              </p>
            )}
          </div>
            <div className="space-y-2 relative">
              <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">Delivery Address</label>
              <input
                id="deliveryAddress"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                placeholder="123 Main St, City, State, ZIP"
                value={deliveryAddress}
                onChange={handleInput}
                required
                aria-invalid={!!deliveryAddressError}
                aria-describedby={deliveryAddressError ? 'deliveryAddress-error' : undefined}
                className="rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none w-full"
                ref={inputRef}
              />
              {/* Render suggestions via portal to overlay above all UI */}
              {dropdownStyles && suggestionStatus === 'OK' && createPortal(
                <ul
                  style={{
                    position: 'absolute',
                    top: dropdownStyles.top,
                    left: dropdownStyles.left,
                    width: dropdownStyles.width,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    zIndex: 10000,
                    maxHeight: 240,
                    overflowY: 'auto'
                  }}
                >
                  {suggestionData.map((suggestion) => {
                    const { place_id, structured_formatting } = suggestion;
                    return (
                      <li
                        key={place_id}
                        onClick={() => handleSelectSuggestion(suggestion.description)}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                      >
                        <span style={{ fontWeight: 500 }}>{structured_formatting.main_text}</span>
                        <small style={{ marginLeft: 8, color: '#6b7280' }}>{structured_formatting.secondary_text}</small>
                      </li>
                    );
                  })}
                </ul>,
                document.body
              )}
              {deliveryAddressError && (
                <p id="deliveryAddress-error" role="alert" className="mt-1 text-sm text-red-500">
                  {deliveryAddressError}
                </p>
              )}
            </div>
        </div>

        {/* Payment Method Specific Section */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6 animate-fade-in-delay" role="form">
            {/* Card Details */}
            <h1 className="text-2xl font-display font-bold mb-4 mt-4">Card Details</h1>
            {/* Name on Card */}
            <div className="space-y-2">
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">Name on Card</label>
              <div className="relative">
                <Input
                  id="cardName"
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="pl-10 rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
                  required
                  aria-required="true"
                  aria-label="Name on Card"
                />
                <User size={16} className="absolute left-3 top-3 text-gray-500" />
              </div>
            </div>
          <SquareCardContainer method="card" onCardReady={onCardReady} amount={amount} />
            <Button
              type="submit"
              disabled={!isCustomerValid || isProcessing}
              aria-disabled={!isCustomerValid || isProcessing}
              className="w-full bg-desi-orange hover:bg-desi-orange/90 text-white py-6 text-lg rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing…' : 'Checkout'}
            </Button>
          </form>
      </div>
    </div>
  );
};

// Google Maps Autocomplete deprecation warning
// As of March 1, 2025, google.maps.places.Autocomplete is not available to new customers. See:
// https://developers.google.com/maps/documentation/javascript/places-migration
// Consider migrating to PlaceAutocompleteElement when available for your account.

export default PaymentForm;