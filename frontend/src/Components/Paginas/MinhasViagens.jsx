// src/Components/Paginas/MinhasViagens.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaRoute, FaPlus } from 'react-icons/fa';
import LogoutButton from '../BotaoLogout/LogoutButton';

// DADOS FICTÍCIOS (MOCK DATA)
const MOCK_VIAGENS = [
  { id: 1, titulo: "Viagem para Paris", destino: "Paris, França", dias: 5 },
  { id: 2, titulo: "Fim de semana em Roma", destino: "Roma, Itália", dias: 3 },
  { id: 3, titulo: "Aventura em Tokyo", destino: "Tokyo, Japão", dias: 10 },
];

export default function MinhasViagens() {
  
  const navigate = useNavigate();

  const handleCreateNewTrip = () => {
    const newTripId = Date.now();
    navigate(`/viagem/${newTripId}`);
  };

  return (
    <div className="bg-light min-vh-100">
      
      {/* MODIFICADO: Navbar agora tem a lista de links completa */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/viagens">
            <FaRoute className="me-2" />
            TripWay
          </Link>
          
          {/* NOVO: Toggler button para mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* NOVO: Wrapper dos links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                {/* Este é o link "ativo" nesta página */}
                <Link className="nav-link active" to="/viagens">Minhas Viagens</Link>
              </li>
              <li className="nav-item">
                {/* Este botão funciona como um link para "outra página" (o editor) */}
                <button 
                  className="nav-link btn btn-link text-decoration-none" 
                  onClick={handleCreateNewTrip}
                >
                  Criar Roteiro
                </button>
              </li>
              <li className="nav-item">
                {/* Botão de Sair */}
                <LogoutButton className="nav-link btn btn-link text-decoration-none" />
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="text-center py-5 bg-white shadow-sm">
        <h1 className="display-5 fw-bold text-primary mb-3">TripWay</h1>
        <p className="lead text-secondary">
         Sua próxima grande aventura começa aqui. 
         <br/>Planeje cada passo, viva cada momento.
        </p>
      </header>

      {/* Lista de Viagens */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Seus Roteiros</h3>
          
          {/* Este é o botão no corpo da página (mantido) */}
          <button 
            className="btn btn-success"
            onClick={handleCreateNewTrip}
          >
            <FaPlus className="me-2" />
            Criar Nova Viagem
          </button>
        </div>

        <div className="list-group shadow-sm">
          {MOCK_VIAGENS.length === 0 ? (
            <div className="list-group-item text-center p-4">
              <p className="text-muted mb-0">
                Você ainda não criou nenhuma viagem.
              </p>
            </div>
          ) : (
            MOCK_VIAGENS.map(viagem => (
              <Link
                key={viagem.id}
                to={`/viagem/${viagem.id}`} // Link dinâmico para o editor
                className="list-group-item list-group-item-action p-3"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1 fw-bold">{viagem.titulo}</h5>
                    <p className="mb-0 text-muted small">{viagem.destino}</p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-primary rounded-pill">{viagem.dias} dias</span>
                  </div>
                </div>
              </Link>
            ))
          )}
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