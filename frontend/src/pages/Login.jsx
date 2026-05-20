import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso("Acesso liberado! Entrando no sistema...");
        
        localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setErro(data.detail || "Erro ao fazer login.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-image-side">
        <div className="login-image-overlay">
          <div className="login-branding">
            <span className="logo-icon">🌿</span>
            <h2>AgriNexus</h2>
            <p>Conectando tecnologia ao campo para colheitas mais inteligentes.</p>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-container">
          
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar
          </Link>

          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Bem-vindo de volta! Por favor, insira seus dados.</p>

          {erro && (
            <div style={{ backgroundColor: "rgba(224, 122, 95, 0.1)", color: "#E07A5F", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(224, 122, 95, 0.3)" }}>
              ⚠️ {erro}
            </div>
          )}

          {sucesso && (
            <div style={{ backgroundColor: "rgba(132, 224, 52, 0.1)", color: "#84E034", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(132, 224, 52, 0.3)" }}>
              ✅ {sucesso}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Digite seu e-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Digite sua senha" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </div>

            <div className="form-actions">
              <label className="remember-me">
                <input type="checkbox" /> Lembrar de mim
              </label>
              <Link to="/esqueci-senha" className="forgot-password">Esqueceu a senha?</Link>
            </div>

            <button type="submit" className="btn-login" style={{ width: "100%" }}>
              ENTRAR
            </button>
          </form>

          <div className="register-link">
            Não tem uma conta? <Link to="/register">Cadastre-se agora</Link>
          </div>
          
          <div className="login-footer">
            <p>Termos e Serviços | © 2026 AgriNexus</p>
          </div>
        </div>
      </div>
    </div>
  );
}