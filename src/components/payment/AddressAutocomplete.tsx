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
}

export const AddressAutocomplete = ({ value, onValueChange, onAddressSelect }: AddressAutocompleteProps) => {
  const { isLoaded, loadError } = useGoogleMapsScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: MAP_LIBRARIES,
  });

  // Always call hooks
  const {
    ready,
    value: autoValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'us' } },
    debounce: 300,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<{ top: number; left: number; width: number } | null>(null);

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== autoValue) {
      setValue(value, false);
    }
  }, [value, autoValue, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    if (onValueChange) onValueChange(val);
  };

  const handleSelect = (address: string) => {
    setValue(address, false);
    clearSuggestions();
    if (onValueChange) onValueChange(address);
    onAddressSelect(address);
  };

  // Update dropdown position
  useEffect(() => {
    if (status === 'OK' && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyles({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      setDropdownStyles(null);
    }
  }, [status, data]);

  return (
    <div>
      <input
        type="text"
        autoComplete="off"
        ref={inputRef}
        value={value !== undefined ? value : autoValue}
        onChange={handleInput}
        placeholder="Start typing your delivery address..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm"
      />
      {isLoaded && dropdownStyles && status === 'OK' && createPortal(
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