'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import { toastHelper } from '@/lib/toast';

const MapPickerMap = dynamic(() => import('./MapPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-gray-100 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  ),
});

const DEFAULT_CENTER = { lat: 30.0444, lng: 31.2357 } as const;

interface Props {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }: Props) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(() =>
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null,
  );
  const [locating, setLocating] = useState(false);

  function handleUseMyLocation() {
    if (!('geolocation' in navigator)) {
      toastHelper.error('Geolocation is not supported on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => {
        toastHelper.error('Could not fetch your location. Check browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  const center = pos ? { lat: pos.lat, lng: pos.lng } : DEFAULT_CENTER;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-dark text-lg">Pick your location</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <i className="fas fa-xmark text-sm" />
          </button>
        </div>

        <MapPickerMap
          center={[center.lat, center.lng]}
          position={pos ? [pos.lat, pos.lng] : null}
          onPick={(lat, lng) => setPos({ lat, lng })}
        />

        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
              <i className="fas fa-location-crosshairs text-gray-400 shrink-0" />
              {pos ? (
                <span className="font-semibold text-dark truncate">
                  {pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}
                </span>
              ) : (
                <span className="truncate">Click on the map to place a pin</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              loading={locating}
              onClick={handleUseMyLocation}
              className="!px-3 !py-2 !text-xs shrink-0"
            >
              {!locating && <i className="fas fa-crosshairs text-xs" />}
              My Location
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={() => pos && onConfirm(pos.lat, pos.lng)} className="flex-1" disabled={!pos}>
              <i className="fas fa-check mr-1" /> Confirm Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
