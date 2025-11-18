// src/Components/Paginas/Site.jsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaRoute, FaSearch, FaPlus, FaClock, FaMapMarkerAlt, FaTimes, FaCloudSun, FaSave } from "react-icons/fa";
import LogoutButton from "../BotaoLogout/LogoutButton.jsx";
import Mapa from "../Mapa/Mapa.jsx";
import BuscaMapa from "../Mapa/BuscaMapa.jsx";
import "leaflet/dist/leaflet.css";

import paris from "../../assets/Paris.jpg";
import roma from "../../assets/Roma.jpg";
import tokyo from "../../assets/Tokyo.jpg";
import Rj from "../../assets/Rj.jpg";
import Praga from "../../assets/Praga.jpg";
import "./Site.css";

const DESTINOS = [
  { id: 1, nome: "Paris", img: paris },
  { id: 2, nome: "Roma", img: roma },
  { id: 3, nome: "Tokyo", img: tokyo },
  { id: 4, nome: "Rio de Janeiro", img: Rj },
  { id: 5, nome: "Praga", img: Praga },
];

function formatPhotonFeature(feature) {
  const props = feature?.properties;
  if (!props) return "Local desconhecido";
  return props.name || props.street || props.city || props.county || props.country || "Local selecionado";
}


export default function Site() {
  const { viagemId } = useParams();
  const [q, setQ] = useState("");

  // mapa e marcadores
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [mapMarkers, setMapMarkers] = useState([]); // Marcador de preview

  // rota
  const [rotaAtiva, setRotaAtiva] = useState(false);
  const [pontoA, setPontoA] = useState(null);
  const [pontoB, setPontoB] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeProfile, setRouteProfile] = useState("driving-car");
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Gerenciamento de Itinerário por Dias
  const [itineraryDays, setItineraryDays] = useState({
    "Dia 1": [], 
  });
  const [activeDayKey, setActiveDayKey] = useState("Dia 1");
  const activeItineraryList = itineraryDays[activeDayKey] || [];

  // Estados do painel de adição
  const [lastSearchResult, setLastSearchResult] = useState(null);
  const [itineraryTime, setItineraryTime] = useState("09:00");
  const [itemName, setItemName] = useState("");

  const ORS_KEY = import.meta.env.VITE_ORS_KEY || "";
  const OWM_KEY = import.meta.env.VITE_OPENWEATHER_KEY || "";

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? DESTINOS.filter((d) => d.nome.toLowerCase().includes(t)) : DESTINOS;
  }, [q]);


  const onBuscaResult = (r) => {
    setMapCenter({ lat: r.lat, lng: r.lng });
    setMapZoom(13);
    setMapMarkers([{ lat: r.lat, lng: r.lng, title: r.display_name }]);
    setLastSearchResult(r);
    setItemName(r.display_name); 
  };

  const handleItemNameChange = (e) => {
    setItemName(e.target.value);
    setLastSearchResult(null);
  };
  
  async function fetchWeather(lat, lng) {
    if (!OWM_KEY) {
      // console.log("Sem chave VITE_OPENWEATHER_KEY, pulando busca de clima."); // REMOVIDO
      return null;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric&lang=pt_br`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao buscar clima");
      const data = await res.json();
      const description = data.weather[0]?.description || "";
      const temp = Math.round(data.main?.temp || 0);
      const icon = data.weather[0]?.icon || null; 
      return {
        text: `${temp}°C - ${description.charAt(0).toUpperCase() + description.slice(1)}`,
        icon: icon,
      };
    } catch (err) {
      console.error("Erro ao buscar clima:", err);
      return null;
    }
  }

  const handleAddItem = async () => {
    if (!itemName.trim() || !itineraryTime) {
      alert("Preencha o horário e a atividade.");
      return;
    }
    setIsAddingItem(true);
    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      time: itineraryTime,
      lat: lastSearchResult ? lastSearchResult.lat : null,
      lng: lastSearchResult ? lastSearchResult.lng : null,
      weather: null,
    };
    if (newItem.lat && newItem.lng) {
      const weatherInfo = await fetchWeather(newItem.lat, newItem.lng);
      newItem.weather = weatherInfo;
    }
    setItineraryDays(prevDays => {
      const currentDayList = prevDays[activeDayKey] || [];
      const updatedDayList = [...currentDayList, newItem];
      return {
        ...prevDays,
        [activeDayKey]: updatedDayList,
      };
    });
    setLastSearchResult(null);
    setItemName("");
    setMapMarkers([]);
    setIsAddingItem(false);
  };

  const handleRemoveItem = (idToRemove) => {
    setItineraryDays(prevDays => {
      const currentDayList = prevDays[activeDayKey] || [];
      const updatedDayList = currentDayList.filter(item => item.id !== idToRemove);
      return {
        ...prevDays,
        [activeDayKey]: updatedDayList,
      };
    });
  };

  const handleViewItem = (item) => {
    if (item.lat && item.lng) {
      setMapCenter({ lat: item.lat, lng: item.lng });
      setMapZoom(13);
    }
  };

  const handleAddDay = () => {
    const nextDayNum = Object.keys(itineraryDays).length + 1;
    const nextDayKey = `Dia ${nextDayNum}`;
    setItineraryDays(prevDays => ({
      ...prevDays,
      [nextDayKey]: [],
    }));
    setActiveDayKey(nextDayKey);
  };

  const handleRemoveDay = (dayKeyToRemove) => {
    const dayKeys = Object.keys(itineraryDays);
    if (dayKeys.length <= 1) {
      alert("Você não pode remover o último dia.");
      return;
    }
    if (window.confirm(`Tem certeza que quer remover o ${dayKeyToRemove} e todos os seus itens?`)) {
      setItineraryDays(prevDays => {
        const newDays = { ...prevDays };
        delete newDays[dayKeyToRemove]; 
        if (activeDayKey === dayKeyToRemove) {
          setActiveDayKey(Object.keys(newDays)[0]);
        }
        return newDays;
      });
    }
  };

  async function fetchReverseGeocode(lat, lng) {
    setIsGeocoding(true);
    setMapMarkers([]);
    try {
      const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Photon erro ${res.status}`);
      const js = await res.json();
      const firstFeature = js?.features?.[0];
      if (!firstFeature) throw new Error("Local não encontrado");
      const displayName = formatPhotonFeature(firstFeature);
      setItemName(displayName);
      setLastSearchResult({ lat, lng, display_name: displayName, raw: firstFeature });
      setMapMarkers([{ lat, lng, title: displayName }]);
      setMapCenter({ lat, lng });
      setMapZoom(13);
    } catch (err) {
      console.error("Erro na geocodificação reversa:", err);
      alert("Não foi possível identificar o local clicado.");
      setItemName("");
      setLastSearchResult(null);
    } finally {
      setIsGeocoding(false);
    }
  }

  // --- Lógica de Rota ---
  async function fetchRoute(locations) {
    if (!locations || locations.length < 2) {
      alert("São necessários pelo menos 2 pontos para traçar uma rota.");
      return;
    }
    setIsLoadingRoute(true);
    setRouteGeoJSON(null);
    setRouteInfo(null);
    setPontoA(null);
    setPontoB(null);
    const coords = locations.map(loc => [Number(loc.lng), Number(loc.lat)]);
    if (!coords.every((c) => c.every((v) => isFinite(v)))) {
      alert("Coordenadas inválidas para a rota.");
      setIsLoadingRoute(false);
      return;
    }
    if (!ORS_KEY) {
      const lineFeature = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: { fallback: true },
      };
      setRouteGeoJSON(lineFeature);
      setRouteInfo({ fallback: true, distance: null, duration: null });
      setIsLoadingRoute(false);
      return;
    }
    const profile = routeProfile || "driving-car";
    const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
    const body = { coordinates: coords };
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_KEY,
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`ORS error ${resp.status}: ${txt}`);
      }
      const geo = await resp.json();
      setRouteGeoJSON(geo);
      const summary = geo?.features?.[0]?.properties?.summary;
      if (summary) {
        setRouteInfo({ distance: summary.distance, duration: summary.duration, fallback: false });
      } else {
        setRouteInfo({ distance: null, duration: null, fallback: false });
      }
    } catch (err) {
      console.error("Erro ao obter rota ORS:", err);
      alert("Erro ao calcular rota. Veja console.");
    } finally {
      setIsLoadingRoute(false);
    }
  }
  
  function buscarRotaORS(a, b) {
    if (a && b) {
      fetchRoute([a, b]);
    }
  }
  
  const handleClearRoute = () => {
    setRouteGeoJSON(null);
    setRouteInfo(null);
    setPontoA(null);
    setPontoB(null);
    if (rotaAtiva) {
      setRotaAtiva(false);
    }
    setMapCenter({ lat: 20, lng: 0 });
    setMapZoom(2);
  };
  const handleRouteItinerary = () => {
    const locations = activeItineraryList.filter(item => item.lat && item.lng);
    locations.sort((a, b) => a.time.localeCompare(b.time));
    fetchRoute(locations); 
  };
  
  function handleClickMapa(pos) {
    if (rotaAtiva) {
      if (!pontoA) {
        setPontoA(pos);
        return;
      }
      if (!pontoB) {
        setPontoB(pos);
        buscarRotaORS(pontoA, pos);
        return;
      }
      setPontoA(pos);
      setPontoB(null);
    } else {
      fetchReverseGeocode(pos.lat, pos.lng);
    }
  }
  function toggleRota() {
    const next = !rotaAtiva;
    setRotaAtiva(next);
    if (next) {
      setPontoA(null);
      setPontoB(null);
      setRouteGeoJSON(null);
      setRouteInfo(null);
      setMapMarkers([]);
      setLastSearchResult(null);
    }
  }

  // MODIFICADO: Função 'Salvar' não imprime mais no console
  const handleSaveTrip = () => {
    // console.log("Salvando Viagem:", { // REMOVIDO
    //   id: viagemId,
    //   dias: itineraryDays
    // });
    
    alert("Falto o backend, calmo!");
    
    // fetch(`/api/viagem/${viagemId}`, {
    //   method: 'PUT', // ou 'POST'
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ dias: itineraryDays })
    // })
    // .then(res => res.json())
    // .then(data => alert("Viagem salva com sucesso!"));
  };


  const itineraryMarkers = (activeItineraryList || [])
    .filter(item => item.lat && item.lng)
    .map(item => ({
      lat: item.lat,
      lng: item.lng,
      title: `${item.time} - ${item.name}`
  }));

  const markersForMap = [
    ...mapMarkers,
    ...itineraryMarkers,
    pontoA && { lat: pontoA.lat, lng: pontoA.lng, title: "Ponto A" },
    pontoB && { lat: pontoB.lat, lng: pontoB.lng, title: "Ponto B" },
  ].filter(Boolean);

  return (
    <div className="bg-light min-vh-100">
      {/* 🔹 NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
         <div className="container">
          <Link className="navbar-brand fw-bold" to="/viagens"> 
            <FaRoute className="me-2" />
            TripWay
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/viagens">Minhas Viagens</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to={`/viagem/${viagemId}`}>Editor</Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item me-2">
                <button 
                  className="btn btn-success d-flex align-items-center"
                  onClick={handleSaveTrip}
                >
                  Salvar Viagem
                </button>
              </li>
              <li className="nav-item">
                <LogoutButton className="nav-link btn btn-link text-decoration-none" />
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 🔹 CABEÇALHO */}
      <header className="text-center py-5 bg-white shadow-sm">
         <h1 className="display-5 fw-bold text-primary mb-3">Editor de Roteiro</h1>
        <p className="lead text-secondary">
          Monte o itinerário perfeito para sua viagem.
        </p>
      </header>

      {/* 🔹 MAPA INTERATIVO */}
      <div className="container my-4">
        <h5 className="mb-3">Mapa Interativo</h5>
        <div className="d-flex align-items-center gap-2">
          <BuscaMapa
            onResult={onBuscaResult}
            placeholder="Buscar local para adicionar..."
            disabled={isGeocoding || isLoadingRoute || isAddingItem}
          />
          <div className="d-flex align-items-center gap-2 ms-auto">
            <button 
              className={`btn btn-sm ${rotaAtiva ? "btn-danger" : "btn-primary"}`} 
              onClick={toggleRota}
              disabled={isGeocoding || isLoadingRoute || isAddingItem}
            >
              {rotaAtiva ? "Cancelar" : "Rota A/B"}
            </button>
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: 160 }}
              value={routeProfile}
              onChange={(e) => setRouteProfile(e.target.value)}
              title="Modo de transporte (ORS)"
              disabled={isGeocoding || isLoadingRoute || isAddingItem}
            >
              <option value="driving-car">Carro</option>
              <option value="cycling-regular">Bicicleta</option>
              <option value="foot-walking">A pé</option>
            </select>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleClearRoute}
              disabled={!routeGeoJSON && !pontoA}
              title="Limpar rota do mapa"
            >
              <FaTimes />
            </button>
            {isLoadingRoute && (
              <div className="spinner-border spinner-border-sm text-primary ms-2" role="status">
                <span className="visually-hidden">Carregando rota...</span>
              </div>
            )}
            <div className="ms-2" style={{minWidth: "120px", textAlign: "right"}}>
              <small className="text-muted">
                {routeInfo
                  ? routeInfo.fallback
                    ? "Rota (linha reta)"
                    : `Dist: ${routeInfo.distance ? (routeInfo.distance / 1000).toFixed(1) + " km" : "—"} • ${routeInfo.duration ? Math.round(routeInfo.duration / 60) + " min" : "—"}`
                  : ""}
              </small>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Mapa
            center={mapCenter}
            zoom={mapZoom}
            markers={markersForMap}
            routeGeoJSON={routeGeoJSON}
            height={420}
            onClickMap={handleClickMapa}
          />
        </div>
        <div className="mt-2">
          <small className="text-muted d-flex align-items-center">
            {isGeocoding ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Identificando local...
              </>
            ) : rotaAtiva ? (
              "Modo Rota A/B ativado — clique no mapa para Ponto A e Ponto B."
            ) : (
              <>
                <FaMapMarkerAlt className="me-2" />
                Clique no mapa ou use a busca para selecionar um local.
              </>
            )}
          </small>
        </div>
      </div>

      {/* 🔹 PAINEL: ADICIONAR AO ROTEIRO */}
      <div className="container my-4 p-4 bg-white shadow-sm rounded-3">
         <h4 className="fw-bold text-primary mb-3">Adicionar ao Roteiro</h4>
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label htmlFor="itemTime" className="form-label fw-bold small">Horário</label>
            <input
              type="time"
              id="itemTime"
              className="form-control"
              value={itineraryTime}
              onChange={(e) => setItineraryTime(e.target.value)}
              disabled={isAddingItem}
            />
          </div>
          <div className="col-md-8">
            <label htmlFor="itemName" className="form-label fw-bold small">Atividade ou Local</label>
            <input
              type="text"
              id="itemName"
              className="form-control"
              placeholder={`Adicionar em ${activeDayKey}...`}
              value={itemName}
              onChange={handleItemNameChange}
              disabled={isAddingItem}
            />
            
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-success w-100"
              onClick={handleAddItem}
              disabled={!itemName.trim() || !itineraryTime || isGeocoding || isLoadingRoute || isAddingItem}
            >
              {isAddingItem ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adicionando...
                </>
              ) : (
                <><FaPlus className="me-1" /> Adicionar</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 LISTA DO ITINERÁRIO */}
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold text-primary mb-0">Itinerário de {activeDayKey}</h3>
          <button 
            className="btn btn-primary"
            onClick={handleRouteItinerary}
            disabled={activeItineraryList.filter(item => item.lat).length < 2 || isLoadingRoute}
          >
            <FaRoute className="me-2" />
            {isLoadingRoute ? "Calculando..." : `Traçar Rota (${activeDayKey})`}
          </button>
        </div>

        <ul className="nav nav-tabs mb-3">
          {Object.keys(itineraryDays).map(dayKey => (
            <li className="nav-item" key={dayKey}>
              <button
                className={`nav-link d-flex align-items-center ${activeDayKey === dayKey ? "active fw-bold" : ""}`}
                onClick={() => setActiveDayKey(dayKey)}
              >
                {dayKey}
                {Object.keys(itineraryDays).length > 1 && (
                  <span
                    className="btn btn-sm btn-outline-danger ms-2 p-0 px-1"
                    style={{ fontSize: "0.7em", lineHeight: "1" }}
                    title={`Remover ${dayKey}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDay(dayKey);
                    }}
                  >
                    <FaTimes />
                  </span>
                )}
              </button>
            </li>
          ))}
          <li className="nav-item">
            <button className="nav-link" onClick={handleAddDay}>
              <FaPlus /> Adicionar Dia
            </button>
          </li>
        </ul>

        <div className="list-group shadow-sm">
          {activeItineraryList.length === 0 && (
            <div className="list-group-item">
              <p className="text-muted mb-0">
                Este dia está vazio. Use o painel acima para adicionar locais ou atividades.
              </p>
            </div>
          )}
          
          {activeItineraryList
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((item) => (
              <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center flex-wrap">
                  <span 
                    className="badge bg-primary rounded-pill me-3" 
                    style={{ minWidth: "60px", fontSize: "0.9em", padding: "0.5em 0.7em" }}
                  >
                    {item.time}
                  </span>
                  <strong className="ms-2 me-2">{item.name}</strong>
                  {!item.lat && (
                    <span className="badge bg-light text-dark ms-2">Manual</span>
                  )}
                  
                  {item.weather && (
                    <span className="ms-2 text-muted small d-flex align-items-center" style={{fontSize: "0.9em"}}>
                      {item.weather.icon ? (
                        <img 
                          src={`https://openweathermap.org/img/wn/${item.weather.icon}.png`} 
                          alt="clima" 
                          style={{width: "24px", height: "24px", marginRight: "4px"}}
                        />
                      ) : (
                        <FaCloudSun className="me-1" />
                      )}
                      {item.weather.text}
                    </span>
                  )}
                </div>
                <div className="ms-auto">
                  <button 
                    className="btn btn-sm btn-outline-secondary me-1" 
                    onClick={() => handleViewItem(item)}
                    title="Ver no mapa"
                    disabled={!item.lat}
                  >
                    Ver
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remover"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* 🔹 FOOTER */}
      <footer className="container py-4 mt-5 border-top">
        <p className="text-center text-muted">
          &copy; 2025 TripWay. Todos os direitos reservados.
        </p>
      </footer>
      
    </div>
  );
}