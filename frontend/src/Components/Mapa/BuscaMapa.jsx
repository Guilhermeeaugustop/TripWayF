// src/Components/Mapa/BuscaMapa.jsx
import { useState } from "react";

/**
 * BuscaMapa usando Photon (photon.komoot.io) - sem backend / sem CORS issue.
 * onResult recebe { lat, lng, display_name, raw }.
 */

export default function BuscaMapa({ onResult, placeholder = "Pesquisar local..." }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    const term = q.trim();
    if (!term) {
      alert("Digite um local.");
      return;
    }
    setLoading(true);
    try {
      // Photon endpoint - funciona diretamente do navegador
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=5`;
      console.log("Photon URL:", url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Photon erro ${res.status}`);
      }
      const js = await res.json();
      console.log("Photon resposta:", js);

      const features = js?.features;
      if (!Array.isArray(features) || features.length === 0) {
        alert("Local não encontrado.");
        return;
      }

      // escolher primeiro resultado
      const first = features[0];
      // Photon usa geometry.coordinates = [lon, lat]
      const coords = first?.geometry?.coordinates || [];
      const lon = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);

      if (!isFinite(lat) || !isFinite(lon)) {
        alert("Resultado inválido do geocoding.");
        console.warn("Photon resultado sem coords:", first);
        return;
      }

      const display = (first.properties && (first.properties.name || first.properties.street || first.properties.city)) 
                      || first.properties?.city || first.properties?.country || term;

      onResult({ lat, lng: lon, display_name: display, raw: first });
    } catch (err) {
      console.error("Erro na busca Photon:", err);
      alert("Erro ao buscar local. Veja o console do navegador.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscar();
    }
  };

  return (
    <div className="d-flex gap-2 align-items-center">
      <input
        className="form-control"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKey}
        disabled={loading}
      />
      <button className="btn btn-primary" onClick={buscar} disabled={loading}>
        {loading ? "Buscando..." : "Buscar"}
      </button>
    </div>
  );
}
