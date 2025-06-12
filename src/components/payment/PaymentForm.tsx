"use client";
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import SquareCardContainer from '@/components/payment/SquareCardContainer';
import { Loader } from '@googlemaps/js-api-loader';

interface PaymentFormProps {
  // Cardholder name input
  cardName: string;
  setCardName: (value: string) => void;
  // Square payments card element ready callback
  onCardReady: (card: any) => void;
  // Error when delivery location cannot be quoted
  feeError?: string;
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
  feeError,
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
}: PaymentFormProps) => {
  const [customerNameError, setCustomerNameError] = useState('');
  const [customerEmailError, setCustomerEmailError] = useState('');
  const [customerPhoneError, setCustomerPhoneError] = useState('');
  const [deliveryAddressError, setDeliveryAddressError] = useState('');

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

  // Use PlaceAutocompleteElement web component
  const placeRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (deliveryMethod === 'delivery') {
      const loader = new Loader({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, libraries: ['places'] });
      loader.load().then(() => {
        const places = (window as any).google.maps.places;
        if (places.PlaceAutocompleteElement && !customElements.get('gmp-place-autocomplete')) {
          customElements.define('gmp-place-autocomplete', places.PlaceAutocompleteElement);
        }
      });
    }
  }, [deliveryMethod]);

  useEffect(() => {
    const el = placeRef.current;
    if (deliveryMethod === 'delivery' && el) {
      const handleSelect = async (e: any) => {
        try {
          const prediction = e.placePrediction || e.detail.placePrediction;
          const place = await prediction.toPlace();
          await place.fetchFields({ fields: ['formattedAddress'] });
          setDeliveryAddress(place.formattedAddress || '');
          setDeliveryAddressError('');
        } catch {
          setDeliveryAddressError('Please select a valid address');
        }
      };
      el.addEventListener('gmp-select', handleSelect as EventListener);
      el.addEventListener('gmp-placeselect', handleSelect as EventListener);
      return () => {
        el.removeEventListener('gmp-select', handleSelect as EventListener);
        el.removeEventListener('gmp-placeselect', handleSelect as EventListener);
      };
    }
  }, [deliveryMethod]);

  return (
    <>
      <div>
        <div className="bg-white rounded-2xl shadow-lg overflow-visible p-6 animate-fade-in">
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
            {deliveryMethod === 'delivery' && (
              <div className="space-y-2">
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                {/* @ts-ignore */}
                <gmp-place-autocomplete
                  ref={placeRef}
                  id="deliveryAddress"
                  placeholder="123 Main St, City, State, ZIP"
                  value={deliveryAddress}
                  required
                  aria-invalid={!!deliveryAddressError}
                  aria-describedby={deliveryAddressError ? 'deliveryAddress-error' : undefined}
                  className="rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none w-full"
                />
                {deliveryAddressError && (
                  <p id="deliveryAddress-error" role="alert" className="mt-1 text-sm text-red-500">
                    {deliveryAddressError}
                  </p>
                )}
                {feeError && (
                  <p className="mt-1 text-sm text-red-500">
                    This location is not deliverable, pick a closer location or try pickup.
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
              {/* Name on Card */}
              <div className="space-y-2">
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">Name on Card</label>
                <div className="relative">
                  <Input
                    id="cardName"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="pl-10 rounded-md border-gray-300 shadow-sm transition-all focus:ring-2 focus:ring-desi-orange focus:outline-none"
                    required
                  />
                  <User size={16} className="absolute left-3 top-3 text-gray-500" />
                </div>
              </div>
              <SquareCardContainer method="card" onCardReady={onCardReady} />
              <Button
                type="submit"
                disabled={!isCustomerValid || isProcessing}
                className="w-full bg-desi-orange hover:bg-desi-orange/90 text-white py-6 text-lg rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing…' : 'Checkout'}
              </Button>
            </form>
          )}
          {selectedMethod === 'applePay' && (
            <div className="flex flex-col items-center justify-center w-full my-8">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-md flex items-center justify-center min-h-[80px]">
                  <SquareCardContainer method="applePay" onWalletReady={handleApplePay} />
                </div>
              </div>
            </div>
          )}
          {selectedMethod === 'googlePay' && (
            <div className="flex flex-col items-center justify-center w-full my-8">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-md flex items-center justify-center min-h-[80px]">
                  <SquareCardContainer method="googlePay" onWalletReady={handleGooglePay} />
                </div>
              </div>
            </div>
          )}
          {selectedMethod === 'cashApp' && (
            <div className="flex flex-col items-center justify-center w-full my-8">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-md flex items-center justify-center min-h-[80px]">
                  <SquareCardContainer method="cashApp" onWalletReady={handleCashApp} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Google Maps Autocomplete deprecation warning
// As of March 1, 2025, google.maps.places.Autocomplete is not available to new customers. See:
// https://developers.google.com/maps/documentation/javascript/places-migration
// Consider migrating to PlaceAutocompleteElement when available for your account.

export default PaymentForm;
