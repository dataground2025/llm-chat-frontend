import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Jakarta bounding box (SW and NE corners)
const JAKARTA_BOUNDS = [
  [-6.365, 106.689], // Southwest (lat, lng)
  [-6.089, 106.971], // Northeast (lat, lng)
];

function MapDisplay({ params }) {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    if (!params) return;
    setImgUrl(null);
    if (params.task === 'slr-risk') {
      const threshold = params.threshold !== undefined ? params.threshold : 2.0;
      fetch(`https://web-production-f8e1.up.railway.app/gee/slr-risk?threshold=${threshold}`)
        .then(res => res.json())
        .then(data => setImgUrl(data.url));
    } else if (params.task === 'urban-area') {
      const year = params.year1;
      fetch(`https://web-production-f8e1.up.railway.app/gee/urban-area-map?year=${year}`)
        .then(res => res.json())
        .then(data => setImgUrl(data.url));
    } else if (params.task === 'urban-area-comprehensive') {
      const year = params.year2; // Use end year for the map display
      const threshold = params.threshold !== undefined ? params.threshold : 2.0;
      fetch(`https://web-production-f8e1.up.railway.app/gee/urban-area-risk-combined-map?year=${year}&threshold=${threshold}`)
        .then(res => res.json())
        .then(data => setImgUrl(data.url));
    }
    // Add logic for other tasks as you implement them
  }, [params]);

  if (!params) return <div>Please select options and click Analyze it.</div>;

  let title = '';
  if (params.task === 'slr-risk') title = 'Sea-Level Rise Risk Map';
  if (params.task === 'urban-area') title = 'Urban Area Map';
  if (params.task === 'urban-area-comprehensive') title = 'Urban Area & Risk Map';

  return (
    <div>
      <h2>{title}</h2>
      {params.task === 'urban-area-comprehensive' && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '10px',
          fontSize: '14px'
        }}>
          <strong>Legend:</strong> White = Non-urban, Pink = Urban areas, Red = Urban areas at risk from sea-level rise
        </div>
      )}
      <div style={{ height: 500, width: '100%' }}>
        <MapContainer
          bounds={JAKARTA_BOUNDS}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {imgUrl && (
            <ImageOverlay
              url={imgUrl}
              bounds={JAKARTA_BOUNDS}
              opacity={0.6}
            />
          )}
        </MapContainer>
        {!imgUrl && <p>Loading map...</p>}
      </div>
    </div>
  );
}

export default MapDisplay; 