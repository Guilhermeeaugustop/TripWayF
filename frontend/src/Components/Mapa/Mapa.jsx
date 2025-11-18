// src/Components/Mapa/Mapa.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrige ícone padrão do Leaflet em bundlers modernos
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

/* Atualiza a view quando "center" mudar */
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === "number" && typeof center.lng === "number") {
      try {
        map.setView([center.lat, center.lng], zoom);
      } catch (e) {
        // ignore
      }
    }
  }, [center, zoom, map]);
  return null;
}

/* Ajusta bounds para caber o GeoJSON (rota) */
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

/* Captura cliques no mapa e repassa via onClickMap prop */
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
  height = "70vh",
}) {
  // safe defaults
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

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* captura cliques */}
      <ClickHandler onClickMap={onClickMap} />

      {/* marcadores */}
      {Array.isArray(markers) &&
        markers.map((m, i) => {
          const lat = Number(m?.lat);
          const lng = Number(m?.lng);
          if (!isFinite(lat) || !isFinite(lng)) return null;
          return (
            <Marker key={i} position={[lat, lng]}>
              <Popup>{m?.title || m?.display_name || "Local"}</Popup>
            </Marker>
          );
        })}

      {/* rota / geojson */}
      {routeGeoJSON && (
        <>
          <GeoJSON data={routeGeoJSON} style={() => ({ color: "#1976d2", weight: 5, opacity: 0.9 })} />
          <FitBounds geojson={routeGeoJSON} />
        </>
      )}
    </MapContainer>
  );
}
