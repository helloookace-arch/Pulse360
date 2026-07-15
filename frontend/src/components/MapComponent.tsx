'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Re-configure marker icons for Next.js static asset resolutions
const clinicIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Clinic {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  district: string;
}

interface MapComponentProps {
  userCoords: [number, number];
  clinics: Clinic[];
  selectedClinic: Clinic | null;
}

// Inner helper component to fly to coordinates when props update
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function MapComponent({ userCoords, clinics, selectedClinic }: MapComponentProps) {
  const mapCenter = selectedClinic ? [selectedClinic.lat, selectedClinic.lng] as [number, number] : userCoords;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800">
      <MapContainer 
        center={userCoords} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location marker */}
        <Marker position={userCoords} icon={userIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800">Your Location</div>
          </Popup>
        </Marker>

        {/* Clinic Location markers */}
        {clinics.map(c => (
          <Marker key={c._id} position={[c.lat, c.lng]} icon={clinicIcon}>
            <Popup>
              <div className="space-y-1 p-1 max-w-xs text-slate-800">
                <h4 className="font-extrabold text-xs text-emerald-700">{c.name}</h4>
                <p className="text-[10px] text-slate-500 font-semibold">{c.address}</p>
                <p className="text-[9px] text-slate-400 font-medium">Hours: {c.hours}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fly to active coordinate adjustments */}
        <MapController center={mapCenter} />
      </MapContainer>
    </div>
  );
}
