import { useState } from "react"; // 1. Importar useState
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // 2. Importar useNavigate
import { MdAlternateEmail } from "react-icons/md";
import "./SingIn.css";

const SingIn = () => {
  // 3. Definir estados para os campos e para erros
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  
  // 4. Endereço do seu endpoint de cadastro no backend
  const API_SIGNUP_URL = "http://127.0.0.1:8000/register/"; // EX: 'http://localhost:3000/api/register'

  const handleCadastrar = async (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário
    setError("");
    setSuccess("");

    // 5. Validação básica no front-end
    if (!nome || !email || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      // 6. Chamada à API para criar a conta
      const response = await fetch(API_SIGNUP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nome, 
          email: email, 
          password: senha 
        }),
      });

      const data = await response.json().catch(() => ({})); // lê JSON mesmo em erro

      if (response.ok) {
        // 7. Sucesso no cadastro
        setSuccess("Conta criada com sucesso! Redirecionando para o login...");
        setTimeout(() => {
          navigate("/"); // A rota "/" é a página de Login (App.jsx)
        }, 1500);
      } else {
        // 8. Erro no backend (ex: email já existe)
        setError(data.message || "Erro ao tentar cadastrar. Tente novamente.");
      }
    } catch (err) {
      // 9. Erro de rede ou servidor
      setError("Não foi possível conectar ao servidor. Verifique a URL.");
    }
  };

  return (
    // Se você já criou a classe .auth-bg (fundo) no Login, pode reaproveitar aqui:
    <div className="auth-bg d-flex align-items-center">
      <div className="container-fluid px-3 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-4 col-xl-3">
            <div
              className="card auth-card border-0 shadow-sm rounded-4 mx-auto"
              style={{ maxWidth: 360 }}
            >
              <div className="card-body p-3 p-sm-4">
                <h1 className="h4 text-center mb-4">Faça seu Cadastro</h1>

                {/* Mensagens de feedback */}
                {error && (
                  <div className="alert alert-danger text-center" role="alert">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success text-center" role="alert">
                    {success}
                  </div>
                )}

                {/* 10. Associa a função de cadastro ao evento onSubmit */}
                <form onSubmit={handleCadastrar} noValidate>
                  {/* Nome */}
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label mb-1"><b>Nome</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaUser /></span>
                      <input
                        id="nome"
                        type="text"
                        placeholder="Nome"
                        className="form-control"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label mb-1"><b>Email</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><MdAlternateEmail /></span>
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

                  {/* Senha */}
                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label mb-1"><b>Senha</b></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaLock /></span>
                      <input
                        id="senha"
                        type="password"
                        placeholder="Senha"
                        className="form-control"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {/* Botão */}
                  <button type="submit" className="btn btn-primary w-100 btn-lg">
                    <b>Cadastrar</b>
                  </button>

                  {/* link para login */}
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
  )
}

export default SingIn;
