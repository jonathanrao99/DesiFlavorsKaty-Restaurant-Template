'use client';

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { useGoogleMapsScript } from 'use-google-maps-script';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from '@/components/ui/command';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string) => void;
}

export const AddressAutocomplete = ({ onAddressSelect }: AddressAutocompleteProps) => {
  const { isLoaded, loadError } = useGoogleMapsScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'us' },
    },
    debounce: 300,
  });

  const handleSelect = (address: string) => {
    setValue(address, false);
    clearSuggestions();
    onAddressSelect(address);
  };

  if (!isLoaded) return <div>Loading map...</div>;
  if (loadError) return <div>Error loading maps</div>;

  return (
    <Command className="relative">
      <CommandInput
        value={value}
        onValueChange={setValue}
        disabled={!ready}
        placeholder="Start typing your delivery address..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-desi-orange focus:ring-desi-orange sm:text-sm"
      />
      {status === 'OK' && (
        <CommandList className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <CommandGroup>
            {data.map(({ place_id, description }) => (
              <CommandItem key={place_id} onSelect={() => handleSelect(description)}>
                {description}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
}; 