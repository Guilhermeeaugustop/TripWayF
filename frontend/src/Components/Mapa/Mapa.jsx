// src/Components/Mapa/Mapa.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Função para criar ícones coloridos dinamicamente
const getMarkerIcon = (color = "blue") => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === "number" && typeof center.lng === "number") {
      try {
        map.setView([center.lat, center.lng], zoom);
      } catch (e) { /* ignore */ }
    }
  }, [center, zoom, map]);
  return null;
}

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    try {
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      console.warn("FitBounds error:", e);
    }
  }, [geojson, map]);
  return null;
}

function ClickHandler({ onClickMap }) {
  useMapEvents({
    click(e) {
      if (typeof onClickMap === "function") {
        onClickMap({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function Mapa({
  center = { lat: -15.793889, lng: -47.882778 },
  markers = [],
  routeGeoJSON = null,
  zoom = 13,
  onClickMap = null,
  onMarkerClick = null, // NOVO: Prop para clique no marcador
  height = "70vh",
}) {
  const safeCenter = {
    lat: Number(center?.lat) || -15.793889,
    lng: Number(center?.lng) || -47.882778,
  };

  return (
    <MapContainer
      center={[safeCenter.lat, safeCenter.lng]}
      zoom={zoom}
      style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%", borderRadius: "12px" }}
    >
      <ChangeView center={safeCenter} zoom={zoom} />
      
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />

      <ClickHandler onClickMap={onClickMap} />

      {Array.isArray(markers) &&
        markers.map((m, i) => {
          const lat = Number(m?.lat);
          const lng = Number(m?.lng);
          if (!isFinite(lat) || !isFinite(lng)) return null;
          
          return (
            <Marker 
              key={i} 
              position={[lat, lng]} 
              icon={getMarkerIcon(m.color || "blue")} 
              // NOVO: Evento de clique no marcador
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(m);
                },
              }}
            >
              <Popup>
                <strong>{m?.title || "Local"}</strong>
                {m.isPoi && <br/>}
                {m.isPoi && <small style={{color: "gray"}}>Clique para selecionar</small>}
              </Popup>
            </Marker>
          );
        })}

      {routeGeoJSON && (
        <>
          <GeoJSON data={routeGeoJSON} style={() => ({ color: "#1976d2", weight: 5, opacity: 0.9 })} />
          <FitBounds geojson={routeGeoJSON} />
        </>
      )}
    </MapContainer>
  );
}