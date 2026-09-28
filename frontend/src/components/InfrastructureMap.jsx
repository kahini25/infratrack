import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ArrowRight, ShieldAlert, Wrench, Eye } from 'lucide-react';

const CONDITION_COLOR_MAP = {
  CRITICAL: { bg: '#ef4444', text: 'text-red-400', label: 'Critical' },
  POOR:     { bg: '#f97316', text: 'text-orange-400', label: 'Poor' },
  FAIR:     { bg: '#eab308', text: 'text-yellow-400', label: 'Fair' },
  GOOD:     { bg: '#22c55e', text: 'text-emerald-400', label: 'Good' },
  EXCELLENT:{ bg: '#06b6d4', text: 'text-cyan-400', label: 'Excellent' }
};

// Component to dynamically adjust map view bounds to fit all valid asset markers
function MapAutoBounds({ validAssets }) {
  const map = useMap();

  useEffect(() => {
    if (!validAssets || validAssets.length === 0) return;

    if (validAssets.length === 1) {
      const { latitude, longitude } = validAssets[0];
      map.setView([latitude, longitude], 13, { animate: true });
    } else {
      const bounds = L.latLngBounds(
        validAssets.map(a => [a.latitude, a.longitude])
      );
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  }, [validAssets, map]);

  return null;
}

export default function InfrastructureMap({
  assets = [],
  height = '520px',
  singleAssetMode = false,
  title = "Geospatial Infrastructure Map"
}) {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'needs_attention'

  // Filter valid assets with non-null lat/lng
  const validAssets = assets.filter(
    (a) =>
      a &&
      a.latitude !== null &&
      a.latitude !== undefined &&
      a.longitude !== null &&
      a.longitude !== undefined &&
      !isNaN(parseFloat(a.latitude)) &&
      !isNaN(parseFloat(a.longitude))
  );

  // Apply "Needs Attention" filter mode if enabled
  const displayedAssets = filterMode === 'needs_attention'
    ? validAssets.filter(
        (a) =>
          a.condition === 'POOR' ||
          a.condition === 'CRITICAL' ||
          a.status === 'UNDER_MAINTENANCE'
      )
    : validAssets;

  const defaultCenter = validAssets.length > 0
    ? [validAssets[0].latitude, validAssets[0].longitude]
    : [22.2587, 71.1924]; // Default Gujarat region center

  return (
    <div className="space-y-3">
      
      {/* Map Control Header & Mode Selector (Only shown when not in single asset detail mode) */}
      {!singleAssetMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-panel p-3.5 rounded-xl border border-slate-800">
          
          {/* Filter Mode Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Mode:</span>
            
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'all'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              All Assets ({validAssets.length})
            </button>

            <button
              onClick={() => setFilterMode('needs_attention')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'needs_attention'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-800 text-orange-400 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Needs Attention ({validAssets.filter(a => a.condition === 'POOR' || a.condition === 'CRITICAL' || a.status === 'UNDER_MAINTENANCE').length})</span>
            </button>
          </div>

          {/* Counter Display with Unpinned Indicator */}
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-300">
            <div>
              Total: <span className="font-bold text-white">{assets.length}</span>
              <span className="text-slate-500 mx-1">•</span>
              Located: <span className="font-bold text-cyan-400">{validAssets.length}</span>
              {assets.length - validAssets.length > 0 && (
                <>
                  <span className="text-slate-500 mx-1">•</span>
                  <span className="text-amber-400 font-medium">○ {assets.length - validAssets.length} unpinned</span>
                </>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Map Container Container Box */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl"
        style={{ height }}
      >
        
        {/* Map Condition Legend Banner */}
        <div className="absolute top-3 left-3 z-[400] glass-panel px-3.5 py-2 rounded-lg flex items-center space-x-3 text-[11px] font-semibold shadow-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <span className="text-slate-400 font-bold uppercase tracking-wider border-r border-slate-700 pr-2.5">Legend</span>
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center space-x-1 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span>Critical</span></span>
            <span className="flex items-center space-x-1 text-orange-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span>Poor</span></span>
            <span className="flex items-center space-x-1 text-yellow-400"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span><span>Fair</span></span>
            <span className="flex items-center space-x-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Good</span></span>
            <span className="flex items-center space-x-1 text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span><span>Excellent</span></span>
          </div>
        </div>

        {/* Empty State when no valid coordinates exist */}
        {displayedAssets.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center">
            <MapPin className="w-10 h-10 text-slate-600 mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-slate-300">
              No geographic locations are available for the selected assets.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select different filters or register asset latitude & longitude coordinates.
            </p>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={8}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            {/* OpenStreetMap Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Automatically adjust bounds to fit visible markers */}
            <MapAutoBounds validAssets={displayedAssets} />

            {/* Circle Markers for each Infrastructure Asset */}
            {displayedAssets.map((asset) => {
              const condMeta = CONDITION_COLOR_MAP[asset.condition] || CONDITION_COLOR_MAP.GOOD;

              return (
                <CircleMarker
                  key={asset.id}
                  center={[asset.latitude, asset.longitude]}
                  radius={singleAssetMode ? 10 : 8}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: condMeta.bg,
                    fillOpacity: 0.9
                  }}
                >
                  <Popup className="dark-leaflet-popup">
                    <div className="p-1 space-y-2 text-slate-100 max-w-[240px]">
                      
                      <div>
                        <h4 className="font-extrabold text-sm text-white leading-tight">{asset.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold border border-slate-700">
                            {asset.asset_code}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-300">
                            {asset.asset_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2">
                        <div><strong className="text-slate-400">Department:</strong> {asset.department || 'N/A'}</div>
                        <div><strong className="text-slate-400">District:</strong> {asset.district || 'N/A'}</div>
                        <div>
                          <strong className="text-slate-400">Condition:</strong>{' '}
                          <span className={`font-bold ${condMeta.text}`}>Condition: {asset.condition}</span>
                        </div>
                        <div>
                          <strong className="text-slate-400">Status:</strong>{' '}
                          <span className="font-semibold text-slate-200">{asset.status.replace('_', ' ')}</span>
                        </div>
                        {asset.location_address && (
                          <div className="text-[10px] text-slate-400 truncate">
                            <strong className="text-slate-400">Location:</strong> {asset.location_address}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {!singleAssetMode && (
                        <div className="pt-2">
                          <button
                            onClick={() => navigate(`/assets/${asset.id}`)}
                            className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Asset</span>
                          </button>
                        </div>
                      )}

                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          </MapContainer>
        )}

      </div>
    </div>
  );
}
