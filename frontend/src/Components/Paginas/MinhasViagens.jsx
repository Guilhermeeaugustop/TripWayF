// src/Components/Paginas/MinhasViagens.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRoute, FaPlus, FaTrash } from 'react-icons/fa';
import LogoutButton from '../BotaoLogout/LogoutButton';

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function MinhasViagens() {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NOVO: Estado para mensagens (feedback)
  const [message, setMessage] = useState(null);
  
  const navigate = useNavigate();

  // NOVO: Função auxiliar para mostrar mensagens
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); // Some após 3s
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/trips/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    .then(res => {
      if (res.status === 403) throw new Error("Não autorizado");
      return res.json();
    })
    .then(data => {
      setViagens(data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
      // Não mostramos erro aqui para não assustar se for apenas um login novo
    });
  }, []);

  const handleCreateNewTrip = () => {
    const newTripId = Date.now();
    navigate(`/viagem/${newTripId}`);
  };

  const handleDeleteTrip = async (e, id) => {
    e.preventDefault();
    // Mantemos o confirm nativo pois é uma ação destrutiva importante
    if (!window.confirm("Tem certeza que deseja excluir esta viagem?")) return;

    try {
      await fetch(`${API_BASE}/api/trips/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      setViagens(prev => prev.filter(v => v.id !== id));
      showMessage("Viagem excluída com sucesso.", "success"); // FEEDBACK VISUAL
    } catch (error) {
      showMessage("Erro ao excluir a viagem.", "danger");
    }
  };

  const calcularDias = (items) => {
    if (!items || items.length === 0) return 0;
    const diasUnicos = new Set(items.map(item => item.day_key));
    return diasUnicos.size;
  };

  return (
    <div className="bg-light min-vh-100 position-relative">
      
      {/* MENSAGENS FLUTUANTES (Igual ao Site.jsx) */}
      {message && (
        <div className={`alert alert-${message.type} position-fixed top-0 start-50 translate-middle-x mt-4 z-3 shadow-lg fade show fw-bold`} style={{zIndex: 9999, minWidth: "300px", textAlign: "center"}}>
          {message.text}
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/viagens">
            <FaRoute className="me-2" />
            TripWay
          </Link>
          <div className="ms-auto">
            <LogoutButton className="btn btn-outline-light" />
          </div>
        </div>
      </nav>

      <header className="text-center py-5 bg-white shadow-sm">
        <h1 className="display-5 fw-bold text-primary mb-3">Minhas Viagens</h1>
        <p className="lead text-secondary">
          Transforme sonhos de viagem em planos concretos. <br/> Adicione paradas, calcule rotas e pé na estrada.
        </p>
      </header>

      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Seus Roteiros</h3>
          <button className="btn btn-success" onClick={handleCreateNewTrip}>
            <FaPlus className="me-2" />
            Criar Nova Viagem
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2"></div>
            <p className="text-muted">Carregando suas viagens...</p>
          </div>
        ) : (
          <div className="list-group shadow-sm">
            {viagens.length === 0 ? (
              <div className="list-group-item text-center p-5">
                <h5 className="text-muted mb-3">Você ainda não tem viagens salvas.<br/> Que tal começar a planejar a próxima fuga?</h5>
                <button className="btn btn-outline-primary btn-sm" onClick={handleCreateNewTrip}>
                  Começar meu primeiro roteiro
                </button>
              </div>
            ) : (
              viagens.map(viagem => {
                const qtdDias = calcularDias(viagem.items);
                return (
                  <Link
                    key={viagem.id}
                    to={`/viagem/${viagem.id}`}
                    className="list-group-item list-group-item-action p-3"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1 fw-bold">{viagem.title}</h5>
                        <p className="mb-0 text-muted small">
                          Criado em: {new Date(viagem.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-primary rounded-pill me-3">
                          {qtdDias} {qtdDias === 1 ? 'dia' : 'dias'}
                        </span>
                        
                        <button 
                          className="btn btn-sm btn-outline-danger z-1"
                          onClick={(e) => handleDeleteTrip(e, viagem.id)}
                          title="Excluir Viagem"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}