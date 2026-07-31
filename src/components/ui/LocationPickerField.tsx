'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import MapPickerModal from '@/components/ui/MapPickerModal';

interface Props {
  label?: string;
  lat?: string;
  lng?: string;
  onChange: (lat: string, lng: string) => void;
  error?: string;
}

export default function LocationPickerField({ label, lat, lng, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const hasLocation = !!(lat && lng);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <i className="fas fa-map-location-dot" />
          </div>
          <div className="flex-1 min-w-0">
            {hasLocation ? (
              <p className="text-sm font-semibold text-dark truncate">
                {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">No location selected yet</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {hasLocation ? 'Click the button to change it' : 'Open the map and pick your location'}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setOpen(true)} leftIcon={<i className="fas fa-map text-xs" />}>
            Get Your Location
          </Button>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {open && (
        <MapPickerModal
          initialLat={lat ? Number(lat) : undefined}
          initialLng={lng ? Number(lng) : undefined}
          onConfirm={(la, ln) => { onChange(String(la), String(ln)); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
