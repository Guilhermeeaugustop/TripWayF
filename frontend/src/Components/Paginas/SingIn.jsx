// src/Components/Paginas/SingIn.jsx
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { MdAlternateEmail } from "react-icons/md";
import "./SingIn.css";

// Configura a URL base correta
const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_REGISTER_URL = `${API_BASE}/api/register/`;

const SingIn = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nome || !email || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nome, 
          email: email, 
          password: senha 
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccess("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          navigate("/"); // Vai para o Login
        }, 1500);
      } else {
        setError(data.error || "Erro ao tentar cadastrar.");
      }
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg min-vh-100 d-flex align-items-center">
      <div className="container-fluid px-3 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="card auth-card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: 360 }}>
              <div className="card-body p-3 p-sm-4">
                <h1 className="h4 text-center mb-4">Faça seu Cadastro</h1>

                {error && <div className="alert alert-danger text-center">{error}</div>}
                {success && <div className="alert alert-success text-center">{success}</div>}

                <form onSubmit={handleCadastrar} noValidate>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label mb-1"><b>Nome</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaUser /></span>
                      <input
                        id="nome"
                        type="text"
                        placeholder="Seu nome"
                        className="form-control"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label mb-1"><b>Email</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><MdAlternateEmail /></span>
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label mb-1"><b>Senha</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaLock /></span>
                      <input
                        id="senha"
                        type="password"
                        placeholder="Sua senha"
                        className="form-control"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                    <b>{loading ? "Criando..." : "Cadastrar"}</b>
                  </button>

                  <p className="text-center text-muted mt-3 small">
                    Já tem conta? <Link to="/">Entrar</Link>
                  </p>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingIn;