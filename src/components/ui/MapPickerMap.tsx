'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: '<i class="fas fa-map-pin" style="color:#059669;font-size:2.6rem;text-shadow:0 1px 4px rgba(0,0,0,0.35);"></i>',
  iconSize: [42, 42],
  iconAnchor: [21, 40],
});

interface Props {
  center: [number, number];
  position: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 0.5 });
  }, [lat, lng, map]);
  return null;
}

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function MapPickerMap({ center, position, onPick }: Props) {
  return (
    <div className="h-80 w-full">
      <MapContainer center={center} zoom={13} className="h-full w-full z-0" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && <Marker position={position} icon={pinIcon} />}
        <Recenter lat={center[0]} lng={center[1]} />
        <ClickCatcher onPick={onPick} />
      </MapContainer>
    </div>
  );
}
