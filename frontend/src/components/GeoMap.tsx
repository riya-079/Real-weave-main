'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { getWeather } from '@/lib/api';

interface GeoMapProps {
  organizations?: any[];
  shipment?: any;
  mode: 'partners' | 'shipment';
}

const REGION_COORDS: Record<string, [number, number]> = {
  'North America': [37.0902, -95.7129],
  'Europe': [48.8566, 2.3522],
  'Asia': [31.2304, 121.4737],
  'South America': [-23.5505, -46.6333],
  'Global': [20.0, 0.0],
  'NA': [40.7128, -74.0060],
  'EU': [52.5200, 13.4050],
  'APAC': [1.3521, 103.8198],
  'Suez Canal': [29.9753, 32.5298],
  'Shanghai Port': [31.2304, 121.4737],
  'Rotterdam Hub': [51.9225, 4.4792],
  'LA Long Beach': [33.7701, -118.1937],
  'Panama Crossing': [8.9833, -79.5167],
  'Nexus Logistics': [41.8781, -87.6298],
  'Quantum Warehousing': [51.9225, 4.4792],
  'Apex Manufacturing': [31.2304, 121.4737],
  'Global Freight X': [1.3521, 103.8198],
  'Silk Road Systems': [31.2304, 121.4737],
  'India': [20.5937, 78.9629],
  'Mumbai Port': [18.9438, 72.8389],
  'Delhi Logistics': [28.6139, 77.2090],
  'Bangalore Tech Hub': [12.9716, 77.5946],
  'Chennai Port': [13.0827, 80.2707]
};

export default function GeoMap({ organizations = [], shipment, mode }: GeoMapProps) {
  const [weather, setWeather] = React.useState<any>(null);
  const isShipmentMode = mode === 'shipment' && shipment;
  
  // For shipment mode, try to resolve coords from tracking data, then origin/dest strings
  const trackedCoords: [number, number] | null = isShipmentMode && shipment.last_lat && shipment.last_lon 
    ? [shipment.last_lat, shipment.last_lon] 
    : null;
    
  const originCoords = isShipmentMode ? (REGION_COORDS[shipment.origin] || [34.05, -118.24]) : null;
  const destCoords = isShipmentMode ? (REGION_COORDS[shipment.destination] || [31.23, 121.47]) : null;

  // Actual current visual position is either trackedCoords or the origin fallback
  const currentCoords = trackedCoords || originCoords;

  React.useEffect(() => {
    if (isShipmentMode && originCoords) {
      getWeather(originCoords[0], originCoords[1]).then(setWeather).catch(console.error);
    }
  }, [isShipmentMode, originCoords]);

  return (
    <div className="w-full h-full rounded-[40px] overflow-hidden border border-white/5 relative bg-background">
      <MapContainer 
        center={currentCoords || [20, 0]} 
        zoom={isShipmentMode ? 4 : 2} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        zoomControl={false}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />

        {mode === 'partners' && organizations.map((org) => {
          const coords = REGION_COORDS[org.region] || [Math.random() * 40, Math.random() * 40];
          const trust = org.trust_score || 0.5;
          const statusColor = trust >= 0.85 ? '#22d3ee' : trust >= 0.7 ? '#6366f1' : '#f43f5e';
          
          return (
            <React.Fragment key={org.id}>
              <CircleMarker
                center={coords}
                pathOptions={{ fillColor: statusColor, color: statusColor, weight: 1, opacity: 0.3, fillOpacity: 0.1 }}
                radius={20 + (trust * 10)}
              />
              <CircleMarker
                center={coords}
                pathOptions={{ fillColor: statusColor, color: 'white', weight: 2, opacity: 0.8, fillOpacity: 1 }}
                radius={6}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[150px] bg-background text-white">
                    <h5 className="font-black italic uppercase tracking-tighter text-sm mb-1">{org.name}</h5>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <span>{org.type}</span>
                        <span style={{ color: statusColor }}>{(trust * 100).toFixed(0)}% Trust</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {isShipmentMode && originCoords && destCoords && (
          <>
            {/* Trajectory Vector */}
            <Polyline 
              positions={[originCoords, destCoords]}
              pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.4, dashArray: '10, 10' }}
            />
            
            {/* Origin Node */}
            <CircleMarker 
              center={originCoords} 
              pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }} 
              radius={8}
            >
               <Popup className="custom-popup">
                 <div className="p-2 space-y-2">
                    <div className="text-white font-black text-xs uppercase">ORIGIN: {shipment.origin}</div>
                    {weather && !weather.error && (
                       <div className="pt-2 border-t border-white/10">
                          <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Atmospheric Telemetry</div>
                          <div className="flex justify-between items-center gap-4">
                             <span className="text-xs font-bold text-white">{weather.temp}°C</span>
                             <span className="text-[9px] font-bold text-white/40 uppercase">{weather.condition}</span>
                          </div>
                       </div>
                    )}
                 </div>
               </Popup>
            </CircleMarker>

            {/* Destination Node */}
            <CircleMarker 
              center={destCoords} 
              pathOptions={{ color: '#3b82f6', fillColor: '#1A1A1A', fillOpacity: 1, weight: 2 }} 
              radius={8}
            >
               <Popup className="custom-popup"><div className="p-2 text-white font-black text-xs">DESTINATION: {shipment.destination}</div></Popup>
            </CircleMarker>

            {/* Current Pulse (Controlled by Tracking Data or Animation) */}
            <CircleMarker 
              center={currentCoords || [0,0]} 
              pathOptions={{ 
                color: trackedCoords ? '#3b82f6' : '#22d3ee', 
                fillColor: trackedCoords ? '#3b82f6' : '#22d3ee', 
                fillOpacity: 1, 
                weight: 0 
              }} 
              radius={trackedCoords ? 7 : 5}
              className="pulse-marker"
            >
               <Popup className="custom-popup">
                  <div className="p-2 space-y-1">
                     <div className="text-[10px] font-black text-primary uppercase tracking-widest">Live Asset Tracking</div>
                     <div className="text-white font-bold text-xs">{shipment.status}</div>
                     {trackedCoords && (
                        <div className="text-[9px] text-white/40 font-mono">GPS: {shipment.last_lat}, {shipment.last_lon}</div>
                     )}
                  </div>
               </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container { filter: grayscale(0.2) contrast(1.1); }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #18181b !important; color: white !important;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0;
        }
        .custom-popup .leaflet-popup-tip { background: #18181b !important; }
        .pulse-marker { animation: pulse 2s infinite; }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
