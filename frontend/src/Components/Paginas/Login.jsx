// src/Components/Paginas/Login.jsx
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { setAuth } from "../../auth/authStorage"; // ajuste o caminho se seu arquivo estiver em outro lugar

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_LOGIN_URL = `${API_BASE}/login/`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha o email e a senha.");
      return;
    }

    try {
      setLoading(true);
      const resp = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        // credentials: "include",
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok) {
        setAuth(data?.user, remember);
        navigate("/viagens"); // MODIFICADO: Redireciona para o novo dashboard
      } else {
        setError(data.error || data.message || `Erro ${resp.status}`);
      }
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique a URL.");
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
                <h1 className="h4 text-center mb-4">TripWay</h1>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label mb-1"><b>Email</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaUser /></span>
                      <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label mb-1"><b>Senha</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaLock /></span>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="remember">Lembre de mim</label>
                    </div>
                    <p className="m-0 small">
                      Não possui conta? <Link to="/SingIn">Click aki</Link>
                    </p>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                    <b>{loading ? "Entrando..." : "Entrar"}</b>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}