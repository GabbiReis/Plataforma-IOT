import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css"; 
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setErro("");
    setSucesso("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }


    const temLetra = /[a-zA-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    
    if (senha.length < 8 || !temLetra || !temNumero) {
      setErro("A senha deve ter pelo menos 8 caracteres, incluindo letras e números.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_completo: nome,
          email: email,
          senha: senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso("Conta criada com sucesso! Redirecionando para o login...");
        
        setTimeout(() => {
          navigate("/login");
        }, 2500);
        
      } else {
        setErro(data.detail || "Erro ao criar conta.");
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
            <p>Junte-se a nós e transforme o futuro da agricultura com tecnologia de ponta.</p>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-container">
          
          <Link to="/login" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar para o Login
          </Link>

          <h1 className="login-title">Cadastre-se</h1>
          <p className="login-subtitle">Preencha os dados abaixo para criar sua conta no sistema.</p>

          {erro && (
            <div style={{ 
              backgroundColor: "rgba(224, 122, 95, 0.1)", 
              color: "#E07A5F", 
              padding: "12px", 
              borderRadius: "8px", 
              marginBottom: "20px", 
              fontSize: "13px", 
              fontWeight: "600",
              border: "1px solid rgba(224, 122, 95, 0.3)"
            }}>
              ⚠️ {erro}
            </div>
          )}

          {sucesso && (
            <div style={{ 
              backgroundColor: "rgba(132, 224, 52, 0.1)", 
              color: "#84E034", 
              padding: "12px", 
              borderRadius: "8px", 
              marginBottom: "20px", 
              fontSize: "13px", 
              fontWeight: "600",
              border: "1px solid rgba(132, 224, 52, 0.3)"
            }}>
              ✅ {sucesso}
            </div>
          )}

          <form className="login-form" onSubmit={handleRegister}>
            
            <div className="input-group">
              <label htmlFor="name">Nome Completo</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Digite o seu nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Digite o seu e-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <div className="password-wrapper">
                <input 
                  type={mostrarSenha ? "text" : "password"} 
                  id="password" 
                  placeholder="Crie uma senha" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                />
                <div className="password-icon" onClick={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirmar Senha</label>
              <div className="password-wrapper">
                <input 
                  type={mostrarConfirmarSenha ? "text" : "password"} 
                  id="confirm-password" 
                  placeholder="Repita a senha" 
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required 
                />
                <div className="password-icon" onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
                  {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-login" style={{ width: "100%" }}>
              CADASTRAR
            </button>
          </form>

          <div className="register-link">
            Já tem uma conta? <Link to="/login">Fazer login</Link>
          </div>
          
          <div className="login-footer">
            <p>Termos e Serviços | © 2026 AgriNexus</p>
          </div>
        </div>
      </div>
    </div>
  );
}