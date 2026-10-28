import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function GeographicMap({ stations = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.0760, 72.8777],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Use standard OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Add stations to map
    stations.forEach(st => {
      if (!st.latitude || !st.longitude) return;

      const hasData = st.hasData;
      const markerColor = st.color || '#94a3b8';
      const radius = hasData ? Math.min(18, Math.max(9, (st.averageAQI || 100) / 10)) : 7;

      const circle = L.circleMarker([st.latitude, st.longitude], {
        radius: radius,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.85
      });

      const popupHtml = `
        <div style="font-family: 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
          <strong style="font-size: 13px; color: #1e293b;">${st.stationname}</strong>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">ID: ${st.stationid} · ${st.city}</div>
          
          ${hasData ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px 6px; background: rgba(0,0,0,0.04); border-radius: 4px;">
              <span>Average AQI:</span>
              <strong style="color: ${markerColor};">${st.averageAQI} (${st.category})</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Max AQI:</span>
              <strong>${st.maxAQI}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Filtered Records:</span>
              <strong>${st.filteredRows} days</strong>
            </div>
          ` : `
            <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 4px; padding: 4px 6px; margin-bottom: 6px; color: #b45309; font-size: 11px;">
              <strong>Data Limitation:</strong> 0 observations in Kaggle dataset. Coordinates mapped from external file.
            </div>
          `}
          <div style="color: #64748b; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <em>${st.coordinate_notes || 'MPCB CAAQMS Station'}</em>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      markersLayer.addLayer(circle);
    });

  }, [stations]);

  return (
    <div className="analytics-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Geographic Station Map</h3>
          <span className="card-subtitle">Mumbai & Navi Mumbai CAAQMS locations</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          ● Bubble radius = AQI severity
        </div>
      </div>
      <div className="card-body" style={{ padding: 0, minHeight: '260px' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '260px' }} />
      </div>
    </div>
  );
}
