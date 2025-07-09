'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    google: any;
  }
}

export interface AddressAutocompleteProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onAddressSelect: (address: string) => void;
  onBlur?: () => void;
}

export const AddressAutocomplete = ({
  value = '',
  onValueChange,
  onAddressSelect,
  onBlur,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (
      !scriptLoaded ||
      typeof window === 'undefined' ||
      !window.google?.maps?.places?.Autocomplete
    ) {
      return;
    }
    if (!inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
    });
    autocomplete.setFields(['formatted_address']);
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onValueChange?.(place.formatted_address);
        onAddressSelect(place.formatted_address);
      }
    });
    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, [scriptLoaded, onValueChange, onAddressSelect]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        value={value}
        onChange={e => onValueChange?.(e.target.value)}
        onBlur={onBlur}
        placeholder="Start typing your delivery address..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm"
      />
    </>
  );
}; 