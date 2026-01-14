
import React, { useEffect, useRef } from 'react';
import { Location } from '../types';
import * as L from 'leaflet';

interface TrackingMapProps {
  driverLoc?: Location;
  customerLoc?: Location;
  isSimulating?: boolean;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ driverLoc, customerLoc, isSimulating }) => {
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // التأكد من وجود العنصر في DOM قبل التهيئة
    const container = document.getElementById('map');
    if (!container) return;

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([32.8872, 13.1913], 12); // طرابلس كإعداد افتراضي
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    if (driverLoc) {
      if (!driverMarkerRef.current) {
        const driverIcon = L.divIcon({
          html: '<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 13.1V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>',
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        driverMarkerRef.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: driverIcon }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng([driverLoc.lat, driverLoc.lng]);
      }
    }

    if (customerLoc) {
      if (!customerMarkerRef.current) {
        const customerIcon = L.divIcon({
          html: '<div class="bg-red-600 p-2 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>',
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        customerMarkerRef.current = L.marker([customerLoc.lat, customerLoc.lng], { icon: customerIcon }).addTo(map);
      } else {
        customerMarkerRef.current.setLatLng([customerLoc.lat, customerLoc.lng]);
      }
    }

    if (driverLoc || customerLoc) {
      const markers = [];
      if (driverMarkerRef.current) markers.push(driverMarkerRef.current);
      if (customerMarkerRef.current) markers.push(customerMarkerRef.current);
      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [40, 40] });
      }
    }
  }, [driverLoc, customerLoc]);

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full min-h-[300px] z-0"></div>
      {isSimulating && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full animate-pulse z-[1000] font-bold">
          LIVE TRACKING
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
