'use client';

import React, { useEffect, useRef } from 'react';
import usePlacesAutocomplete, { getGeocode } from 'use-places-autocomplete';

export interface AddressAutocompleteProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onAddressSelect: (address: string) => void;
  onBlur?: () => void | Promise<void>;
  onKeyPress?: (e: React.KeyboardEvent) => void | Promise<void>;
  onClick?: () => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
}

export const AddressAutocomplete = ({
  value = '',
  onValueChange,
  onAddressSelect,
  onBlur,
  onKeyPress,
  onClick,
  onFocus,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    ready,
    value: autoValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300, defaultValue: value });

  // Sync external value to hook
  React.useEffect(() => {
    if (autoValue !== value) setValue(value, false);
  }, [value, autoValue, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onValueChange?.(e.target.value);
  };

  const handleSelect = (description: string) => {
    setValue(description, false);
    clearSuggestions();
    onValueChange?.(description);
    onAddressSelect(description);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={autoValue}
        onChange={handleInput}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        onClick={onClick}
        onFocus={onFocus}
        placeholder="Start typing your delivery address or select from suggestions..."
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm bg-white text-black"
        autoComplete="off"
        style={{ background: '#fff', color: '#111', borderRadius: '0.375rem', border: '1px solid #d1d5db', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
      />
      {status === 'OK' && data.length > 0 && (
        <ul
          className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {data.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
              onMouseDown={() => handleSelect(suggestion.description)}
              style={{ borderBottom: '1px solid #eee' }}
            >
              <span className="font-medium">{suggestion.structured_formatting.main_text}</span>
              <span className="ml-2 text-gray-500">{suggestion.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 