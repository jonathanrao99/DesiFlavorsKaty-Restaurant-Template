'use client';

import React, { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { useGoogleMapsScript, type Libraries } from 'use-google-maps-script';
import { createPortal } from 'react-dom';

// Static libraries array for performance
const MAP_LIBRARIES: Libraries = ['places'];

export interface AddressAutocompleteProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onAddressSelect: (address: string) => void;
  onBlur?: () => void;
}

export const AddressAutocomplete = ({ value, onValueChange, onAddressSelect, onBlur }: AddressAutocompleteProps) => {
  const { isLoaded, loadError } = useGoogleMapsScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: MAP_LIBRARIES,
  });

  // Always call hooks - only conditionally render UI
  const {
    ready,
    value: autoValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'us' } },
    debounce: 300,
    // Only initialize when Google Maps is loaded
    callbackName: isLoaded ? undefined : '__DISABLED__',
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<{ top: number; left: number; width: number } | null>(null);

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== autoValue && isLoaded) {
      setValue(value, false);
    }
  }, [value, autoValue, setValue, isLoaded]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onValueChange) onValueChange(val);
    
    // Only use Places API if loaded and ready
    if (isLoaded && ready) {
      setValue(val);
    }
  };

  const handleSelect = (address: string) => {
    if (isLoaded && ready) {
    setValue(address, false);
    clearSuggestions();
    }
    if (onValueChange) onValueChange(address);
    onAddressSelect(address);
  };

  // Update dropdown position
  useEffect(() => {
    if (status === 'OK' && inputRef.current && isLoaded) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyles({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      setDropdownStyles(null);
    }
  }, [status, data, isLoaded]);

  // Show loading or error states
  if (loadError) {
    return (
      <input
        type="text"
        autoComplete="off"
        ref={inputRef}
        value={value || ''}
        onChange={handleInput}
        placeholder="Enter your delivery address (Google Maps unavailable)"
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm"
      />
    );
  }

  return (
    <div>
      <input
        type="text"
        autoComplete="off"
        ref={inputRef}
        value={value !== undefined ? value : (isLoaded ? autoValue : '')}
        onChange={handleInput}
        onBlur={onBlur}
        placeholder={isLoaded ? "Start typing your delivery address..." : "Loading address suggestions..."}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm"
      />
      {isLoaded && ready && dropdownStyles && status === 'OK' && createPortal(
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
            overflowY: 'auto',
          }}
        >
          {data.slice(0, 4).map((suggestion) => {
            const description = suggestion.description;
            const formatted = suggestion.structured_formatting;
            return (
              <li
                key={suggestion.place_id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(description);
                }}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <span style={{ fontWeight: 500 }}>{formatted?.main_text || description}</span>
                {formatted?.secondary_text && (
                  <small style={{ marginLeft: 8, color: '#6b7280' }}>{formatted.secondary_text}</small>
      )}
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </div>
  );
}; 