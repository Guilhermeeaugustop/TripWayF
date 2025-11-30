// src/Components/Paginas/Site.jsx
import { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaRoute, FaSearch, FaPlus, FaClock, FaMapMarkerAlt, FaTimes, FaCloudSun, FaSave, FaLandmark } from "react-icons/fa";
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

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Site() {
  const { viagemId } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const [mapCenter, setMapCenter] = useState({ lat: -22.9068, lng: -43.1729 });
  const [mapZoom, setMapZoom] = useState(13);
  const [mapMarkers, setMapMarkers] = useState([]); 
  const [poiMarkers, setPoiMarkers] = useState([]); 

  const [rotaAtiva, setRotaAtiva] = useState(false);
  const [pontoA, setPontoA] = useState(null);
  const [pontoB, setPontoB] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeProfile, setRouteProfile] = useState("driving-car");
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false); 

  const [itineraryDays, setItineraryDays] = useState({ "Dia 1": [] });
  const [activeDayKey, setActiveDayKey] = useState("Dia 1");
  const activeItineraryList = itineraryDays[activeDayKey] || [];

  const [lastSearchResult, setLastSearchResult] = useState(null);
  const [itineraryTime, setItineraryTime] = useState("09:00");
  const [itemName, setItemName] = useState("");
  
  const [tripData, setTripData] = useState(null);

  // NOVO: Estado para mensagens nativas (sem biblioteca extra)
  const [message, setMessage] = useState(null); // { text: "Ola", type: "success" }

  const ORS_KEY = import.meta.env.VITE_ORS_KEY || "";
  const OWM_KEY = import.meta.env.VITE_OPENWEATHER_KEY || "";

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? DESTINOS.filter((d) => d.nome.toLowerCase().includes(t)) : DESTINOS;
  }, [q]);

  // NOVO: Função para mostrar mensagens na tela
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    // Some depois de 3 segundos
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (!viagemId) return;

    const fetchTripData = async () => {
      if (!tripData) setIsLoadingData(true);
      try {
        const res = await fetch(`${API_BASE}/api/trips/${viagemId}/`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTripData(data); 
          const loadedDays = {};
          if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
              if (!loadedDays[item.day_key]) loadedDays[item.day_key] = [];
              loadedDays[item.day_key].push({
                id: item.id,
                name: item.name,
                time: item.time.slice(0, 5), 
                lat: item.lat,
                lng: item.lng,
                weather: item.weather_text ? { text: item.weather_text, icon: item.weather_icon } : null
              });
            });
            setItineraryDays(loadedDays);
            if (!activeItineraryList.length) setActiveDayKey(Object.keys(loadedDays)[0] || "Dia 1");
            if (!tripData) {
                const firstItem = data.items.find(i => i.lat);
                if (firstItem) setMapCenter({ lat: firstItem.lat, lng: firstItem.lng });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar viagem:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchTripData();
  }, [viagemId]);

  const onBuscaResult = (r) => {
    setMapCenter({ lat: r.lat, lng: r.lng });
    setMapZoom(13);
    setMapMarkers([{ lat: r.lat, lng: r.lng, title: r.display_name, color: "blue" }]);
    setLastSearchResult(r);
    setItemName(r.display_name); 
    setPoiMarkers([]); 
  };

  const handleItemNameChange = (e) => {
    setItemName(e.target.value);
    setLastSearchResult(null);
  };
  
  async function fetchWeather(lat, lng) {
    if (!OWM_KEY) return null;
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
      return null;
    }
  }

  const handleAddItem = async () => {
    if (!itemName.trim() || !itineraryTime) {
      showMessage("Preencha o horário e a atividade.", "warning");
      return;
    }
    setIsAddingItem(true);
    
    const lat = lastSearchResult ? lastSearchResult.lat : null;
    const lng = lastSearchResult ? lastSearchResult.lng : null;

    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      time: itineraryTime,
      lat: lat,
      lng: lng,
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
    showMessage("Item adicionado!", "success");
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
    showMessage("Item removido.", "info");
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
    showMessage(`Dia ${nextDayNum} adicionado!`, "success");
  };

  const handleRemoveDay = (dayKeyToRemove) => {
    const dayKeys = Object.keys(itineraryDays);
    if (dayKeys.length <= 1) {
      showMessage("Você não pode remover o último dia.", "danger");
      return;
    }
    if (window.confirm(`Tem certeza que quer remover o ${dayKeyToRemove}?`)) {
      setItineraryDays(prevDays => {
        const newDays = { ...prevDays };
        delete newDays[dayKeyToRemove]; 
        if (activeDayKey === dayKeyToRemove) {
          setActiveDayKey(Object.keys(newDays)[0]);
        }
        return newDays;
      });
      showMessage("Dia removido.", "info");
    }
  };

  async function fetchReverseGeocode(lat, lng) {
    setIsGeocoding(true);
    setMapMarkers([]);
    try {
      const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Photon erro`);
      const js = await res.json();
      const firstFeature = js?.features?.[0];
      if (!firstFeature) throw new Error("Local não encontrado");
      const displayName = formatPhotonFeature(firstFeature);
      setItemName(displayName);
      setLastSearchResult({ lat, lng, display_name: displayName, raw: firstFeature });
      setMapMarkers([{ lat, lng, title: displayName, color: "blue" }]);
      setMapCenter({ lat, lng });
      setMapZoom(13);
    } catch (err) {
      showMessage("Não foi possível identificar o local.", "danger");
      setItemName("");
      setLastSearchResult(null);
    } finally {
      setIsGeocoding(false);
    }
  }

  const fetchPOIs = async () => {
    const radius = 5000; 
    const { lat, lng } = mapCenter;

    if (lat === 20 && lng === 0) {
      showMessage("Aproxime o mapa de uma cidade antes de explorar.", "warning");
      return;
    }

    setIsLoadingPOIs(true);
    setPoiMarkers([]); 

    const query = `
      [out:json];
      (
        node["tourism"](around:${radius},${lat},${lng});
        node["amenity"="restaurant"](around:${radius},${lat},${lng});
        node["amenity"="cafe"](around:${radius},${lat},${lng});
      );
      out 30;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.elements || data.elements.length === 0) {
        showMessage("Nenhum ponto encontrado nesta área.", "warning");
      } else {
        const newMarkers = data.elements.map(el => {
          let cor = "blue";
          if (el.tags.tourism) cor = "gold"; 
          else if (el.tags.amenity === "restaurant" || el.tags.amenity === "cafe") cor = "red";
          if (!el.tags.name) return null;
          return {
            lat: el.lat, lng: el.lon, title: `📍 ${el.tags.name}`, isPoi: true, color: cor 
          };
        }).filter(Boolean);

        if (newMarkers.length === 0) {
           showMessage("Locais encontrados, mas sem nome.", "warning");
        } else {
           setPoiMarkers(newMarkers);
           showMessage(`${newMarkers.length} locais encontrados!`, "success");
        }
      }
    } catch (err) {
      showMessage("Erro ao buscar pontos turísticos.", "danger");
    } finally {
      setIsLoadingPOIs(false);
    }
  };

  async function fetchRoute(locations) {
    if (!locations || locations.length < 2) {
      showMessage("Selecione pelo menos 2 pontos com localização.", "warning");
      return;
    }
    setIsLoadingRoute(true);
    setRouteGeoJSON(null);
    setRouteInfo(null);
    setPontoA(null);
    setPontoB(null);
    const coords = locations.map(loc => [Number(loc.lng), Number(loc.lat)]);
    
    if (!ORS_KEY) {
      const lineFeature = {
        type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: { fallback: true },
      };
      setRouteGeoJSON(lineFeature);
      setRouteInfo({ fallback: true, distance: null, duration: null });
      setIsLoadingRoute(false);
      showMessage("Rota em linha reta (Sem chave ORS).", "info");
      return;
    }
    const profile = routeProfile || "driving-car";
    const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
    const body = { coordinates: coords };
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: ORS_KEY },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`ORS error`);
      const geo = await resp.json();
      setRouteGeoJSON(geo);
      const summary = geo?.features?.[0]?.properties?.summary;
      if (summary) setRouteInfo({ distance: summary.distance, duration: summary.duration, fallback: false });
      else setRouteInfo({ distance: null, duration: null, fallback: false });
      
      showMessage("Rota calculada!", "success");
    } catch (err) {
      showMessage("Não foi possível calcular a rota.", "danger");
    } finally {
      setIsLoadingRoute(false);
    }
  }
  
  function buscarRotaORS(a, b) { if (a && b) fetchRoute([a, b]); }
  
  const handleClearRoute = () => {
    setRouteGeoJSON(null); setRouteInfo(null); setPontoA(null); setPontoB(null); setPoiMarkers([]); 
    if (rotaAtiva) setRotaAtiva(false);
    setMapCenter({ lat: -22.9068, lng: -43.1729 }); setMapZoom(13);
    showMessage("Mapa limpo.", "info");
  };
  const handleRouteItinerary = () => {
    const locations = activeItineraryList.filter(item => item.lat && item.lng);
    locations.sort((a, b) => a.time.localeCompare(b.time));
    fetchRoute(locations); 
  };
  function handleClickMapa(pos) {
    if (rotaAtiva) {
      if (!pontoA) { setPontoA(pos); return; }
      if (!pontoB) { setPontoB(pos); buscarRotaORS(pontoA, pos); return; }
      setPontoA(pos); setPontoB(null);
    } else { fetchReverseGeocode(pos.lat, pos.lng); }
  }
  function toggleRota() {
    const next = !rotaAtiva; setRotaAtiva(next);
    if (next) {
      setPontoA(null); setPontoB(null); setRouteGeoJSON(null); setRouteInfo(null); setMapMarkers([]); setLastSearchResult(null);
      showMessage("Modo Rota: Marque A e B no mapa.", "info");
    }
  }
  const handleMarkerClick = (marker) => {
    const cleanName = marker.title.replace(/^[^a-zA-Z0-9]*\s?/, ''); 
    setItemName(cleanName);
    setLastSearchResult({ lat: marker.lat, lng: marker.lng, display_name: cleanName });
  };

  const handleSaveTrip = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const itemsPayload = [];
    Object.keys(itineraryDays).forEach(dayKey => {
      itineraryDays[dayKey].forEach(item => {
        itemsPayload.push({
          day_key: dayKey,
          name: item.name,
          time: item.time + ":00", 
          lat: item.lat || null,
          lng: item.lng || null,
          weather_text: item.weather ? item.weather.text : "",
          weather_icon: item.weather ? item.weather.icon : ""
        });
      });
    });

    const payload = {
      title: tripData ? tripData.title : `Roteiro - ${new Date().toLocaleDateString()}`,
      items: itemsPayload
    };

    const method = tripData ? 'PUT' : 'POST';
    const url = tripData ? `${API_BASE}/api/trips/${tripData.id}/` : `${API_BASE}/api/trips/`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setTripData(data);
        showMessage(`Viagem salva com sucesso!`, "success");
        
        if (method === 'POST') navigate(`/viagem/${data.id}`, { replace: true });
      } else {
        const err = await response.json();
        if (err.detail === "Authentication credentials were not provided.") {
            showMessage("Sessão expirada. Faça login novamente.", "danger");
        } else {
            showMessage("Erro ao salvar viagem.", "danger");
        }
      }
    } catch (error) {
      showMessage("Erro de conexão.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const itineraryMarkers = (activeItineraryList || []).filter(item => item.lat && item.lng).map(item => ({
      lat: item.lat, lng: item.lng, title: `${item.time} - ${item.name}`, color: "green" 
  }));

  const markersForMap = [
    ...mapMarkers, ...itineraryMarkers, ...poiMarkers, 
    pontoA && { lat: pontoA.lat, lng: pontoA.lng, title: "Ponto A", color: "black" },
    pontoB && { lat: pontoB.lat, lng: pontoB.lng, title: "Ponto B", color: "black" },
  ].filter(Boolean);

  if (isLoadingData) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div><p>Carregando roteiro...</p></div>;
  }

  return (
    <div className="bg-light min-vh-100 position-relative">
      
      {/* MENSAGENS FLUTUANTES (NATIVO - BOOTSTRAP) */}
      {message && (
        <div className={`alert alert-${message.type} position-fixed top-0 start-50 translate-middle-x mt-4 z-3 shadow-lg fade show fw-bold`} style={{zIndex: 9999, minWidth: "300px", textAlign: "center"}}>
          {message.text}
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
         <div className="container">
          <Link className="navbar-brand fw-bold" to="/viagens"> <FaRoute className="me-2" /> TripWay </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span className="navbar-toggler-icon"></span></button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className="nav-link" to="/viagens">Minhas Viagens</Link></li>
              <li className="nav-item"><Link className="nav-link active" to="#">Editor</Link></li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item me-2">
                <button className="btn btn-success d-flex align-items-center" onClick={(e) => handleSaveTrip(e)} disabled={isSaving}>
                  {isSaving ? "Salvando..." : <><FaSave className="me-1" /> Salvar Viagem</>}
                </button>
              </li>
              <li className="nav-item"><LogoutButton className="nav-link btn btn-link text-decoration-none" /></li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="text-center py-5 bg-white shadow-sm">
         <h1 className="display-5 fw-bold text-primary mb-3">{tripData ? tripData.title : "Novo Roteiro"}</h1>
         <p className="lead text-secondary">Comece adicionando seu primeiro destino.<br/> A aventura te espera.</p>
      </header>

      <div className="container my-4">
        <h5 className="mb-3">Mapa Interativo</h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <BuscaMapa onResult={onBuscaResult} placeholder="Buscar local..." disabled={isGeocoding || isLoadingRoute || isAddingItem} />
          <button className="btn btn-info text-white" onClick={fetchPOIs} disabled={isLoadingPOIs || rotaAtiva} title="Buscar atrações e restaurantes">
            {isLoadingPOIs ? <span className="spinner-border spinner-border-sm"></span> : <><FaLandmark className="me-1" /> Explorar</>}
          </button>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <button className={`btn btn-sm ${rotaAtiva ? "btn-danger" : "btn-primary"}`} onClick={toggleRota} disabled={isGeocoding || isLoadingRoute || isAddingItem}>{rotaAtiva ? "Cancelar" : "Rota A/B"}</button>
            <select className="form-select form-select-sm" style={{ maxWidth: 160 }} value={routeProfile} onChange={(e) => setRouteProfile(e.target.value)} disabled={isGeocoding || isLoadingRoute || isAddingItem}>
              <option value="driving-car">Carro</option> <option value="cycling-regular">Bicicleta</option> <option value="foot-walking">A pé</option>
            </select>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleClearRoute} disabled={!routeGeoJSON && !pontoA && poiMarkers.length === 0} title="Limpar mapa"><FaTimes /></button>
            {isLoadingRoute && <div className="spinner-border spinner-border-sm text-primary ms-2"></div>}
            <div className="ms-2" style={{minWidth: "120px", textAlign: "right"}}><small className="text-muted">{routeInfo ? (routeInfo.fallback ? "Rota" : `${(routeInfo.distance / 1000).toFixed(1)} km`) : ""}</small></div>
          </div>
        </div>
        <div className="mt-3">
          <Mapa center={mapCenter} zoom={mapZoom} markers={markersForMap} routeGeoJSON={routeGeoJSON} height={420} onClickMap={handleClickMapa} onMarkerClick={handleMarkerClick} />
        </div>
        <div className="mt-2">
          <small className="text-muted d-flex align-items-center">{isGeocoding ? <div className="spinner-border spinner-border-sm me-2"></div> : rotaAtiva ? "Modo Rota A/B." : <><FaMapMarkerAlt className="me-2" /> Clique no mapa para selecionar.</>}</small>
        </div>
      </div>

      <div className="container my-4 p-4 bg-white shadow-sm rounded-3">
         <h4 className="fw-bold text-primary mb-3">Adicionar ao Roteiro</h4>
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label fw-bold small">Horário</label>
            <input type="time" className="form-control" value={itineraryTime} onChange={(e) => setItineraryTime(e.target.value)} disabled={isAddingItem} />
          </div>
          <div className="col-md-8">
            <label className="form-label fw-bold small">Atividade ou Local</label>
            <input type="text" className="form-control" placeholder={`Adicionar em ${activeDayKey}...`} value={itemName} onChange={handleItemNameChange} disabled={isAddingItem} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" onClick={handleAddItem} disabled={!itemName.trim() || !itineraryTime || isGeocoding || isLoadingRoute || isAddingItem}>{isAddingItem ? "Adicionando..." : <><FaPlus className="me-1" /> Adicionar</>}</button>
          </div>
        </div>
      </div>

      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold text-primary mb-0">Itinerário de {activeDayKey}</h3>
          <button className="btn btn-primary" onClick={handleRouteItinerary} disabled={activeItineraryList.filter(item => item.lat).length < 2 || isLoadingRoute}><FaRoute className="me-2" /> {isLoadingRoute ? "Calculando..." : `Traçar Rota (${activeDayKey})`}</button>
        </div>
        <ul className="nav nav-tabs mb-3">
          {Object.keys(itineraryDays).map(dayKey => (
            <li className="nav-item" key={dayKey}>
              <button className={`nav-link d-flex align-items-center ${activeDayKey === dayKey ? "active fw-bold" : ""}`} onClick={() => setActiveDayKey(dayKey)}>
                {dayKey}
                {Object.keys(itineraryDays).length > 1 && <span className="btn btn-sm btn-outline-danger ms-2 p-0 px-1" onClick={(e) => { e.stopPropagation(); handleRemoveDay(dayKey); }}><FaTimes /></span>}
              </button>
            </li>
          ))}
          <li className="nav-item"><button className="nav-link" onClick={handleAddDay}><FaPlus /> Adicionar Dia</button></li>
        </ul>
        <div className="list-group shadow-sm">
          {activeItineraryList.length === 0 && <div className="list-group-item"><p className="text-muted mb-0">Dia vazio.</p></div>}
          {activeItineraryList.sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
              <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center flex-wrap">
                  <span className="badge bg-primary rounded-pill me-3">{item.time}</span> <strong className="ms-2 me-2">{item.name}</strong> {!item.lat && <span className="badge bg-light text-dark ms-2">Manual</span>} {item.weather && <span className="ms-2 text-muted small d-flex align-items-center" style={{fontSize: "0.9em"}}>{item.weather.icon ? <img src={`https://openweathermap.org/img/wn/${item.weather.icon}.png`} alt="clima" style={{width: "24px", height: "24px"}} /> : <FaCloudSun className="me-1" />} {item.weather.text}</span>}
                </div>
                <div className="ms-auto"><button className="btn btn-sm btn-outline-secondary me-1" onClick={() => handleViewItem(item)} title="Ver" disabled={!item.lat}>Ver</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)} title="Remover">Remover</button></div>
              </div>
            ))}
        </div>
      </div>
      <footer className="container py-4 mt-5 border-top"><p className="text-center text-muted">&copy; 2025 TripWay. Todos os direitos reservados.</p></footer>
    </div>
  );
}