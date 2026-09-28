import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Check, X, Compass, AlertCircle } from 'lucide-react';

// Custom Leaflet marker icon for location picker pin
const customPinIcon = L.divIcon({
  className: 'custom-location-pin',
  html: `<div style="
    background-color: #06b6d4;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="background-color: #ffffff; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

import { DISTRICT_COORDINATES, DEFAULT_GUJARAT_CENTER, calculateDistance } from '../config/districtCoordinates';

// Component listening for click events on the map canvas
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6))
      });
    }
  });
  return null;
}

// Controller component to smoothly center map
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  district = 'Ahmedabad',
  initialLat = null,
  initialLng = null,
  addressHint = ''
}) {
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]);

  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        const coords = { lat: parseFloat(initialLat), lng: parseFloat(initialLng) };
        setSelectedCoords(coords);
        setMapCenter([coords.lat, coords.lng]);
      } else if (district && DISTRICT_COORDINATES[district]) {
        const distCenter = DISTRICT_COORDINATES[district];
        setMapCenter([distCenter.lat, distCenter.lng]);
        setSelectedCoords(null);
      } else {
        setMapCenter([DEFAULT_GUJARAT_CENTER.lat, DEFAULT_GUJARAT_CENTER.lng]);
        setSelectedCoords(null);
      }
      setSearchQuery(addressHint || '');
    }
  }, [isOpen, district, initialLat, initialLng, addressHint]);

  if (!isOpen) return null;

  // Lightweight Nominatim OpenStreetMap Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const q = searchQuery.toLowerCase().includes('gujarat')
        ? searchQuery
        : `${searchQuery}, ${district || ''}, Gujarat, India`;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const coords = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lon.toFixed(6)) };
        setSelectedCoords(coords);
        setMapCenter([lat, lon]);
      } else {
        alert(`Location "${searchQuery}" not found. Please click directly on the map.`);
      }
    } catch (err) {
      console.error('Nominatim search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      if (district && DISTRICT_COORDINATES[district]) {
        const center = DISTRICT_COORDINATES[district];
        const dist = calculateDistance(center.lat, center.lng, selectedCoords.lat, selectedCoords.lng);
        if (dist > 50) {
          const proceed = window.confirm(
            `Warning: The selected location appears to be outside the selected district (${district}).\n\nDistance from district center: ${Math.round(dist)}km.\n\nDo you want to keep this location?`
          );
          if (!proceed) return;
        }
      }
      onConfirm(selectedCoords);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-3xl w-full space-y-4 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Geospatial Location Picker</h3>
              <p className="text-xs text-slate-400">Search area or click anywhere on the map to pin asset coordinates.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nominatim Search Input */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder={`Search area, road, or landmark in ${district || 'Gujarat'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors shrink-0"
          >
            {searchLoading ? 'Searching...' : 'Locate Area'}
          </button>
        </form>

        {/* Leaflet Map Picker Canvas */}
        <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          
          <div className="absolute top-3 left-3 z-[400] glass-panel px-3 py-1.5 rounded-lg text-[11px] font-semibold text-cyan-400 bg-slate-900/90 border border-slate-800 flex items-center space-x-1.5 shadow-md">
            <Compass className="w-3.5 h-3.5" />
            <span>Click map to place pin marker</span>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenterController center={mapCenter} />
            <MapClickHandler onLocationSelect={setSelectedCoords} />

            {selectedCoords && (
              <Marker
                position={[selectedCoords.lat, selectedCoords.lng]}
                icon={customPinIcon}
              />
            )}
          </MapContainer>
        </div>

        {/* Footer & Readonly Selected Coordinates Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-xs">
            {selectedCoords ? (
              <div className="flex items-center space-x-3 text-slate-200 font-semibold">
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Pinned</span>
                </span>
                <span className="font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-cyan-400">
                  Lat: {selectedCoords.lat}, Lng: {selectedCoords.lng}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">No point pinned on map yet. Click on the map.</span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedCoords}
              onClick={handleConfirm}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
