import { Link } from "react-router-dom";
import "../styles/login.css"; // Reutilizamos o mesmo estilo!

export default function ForgotPassword() {
  return (
    <div className="login-page">
      
      <div className="login-image-side">
        <div className="login-image-overlay">
          <div className="login-branding">
            <span className="logo-icon">🌿</span>
            <h2>AgriNexus</h2>
            <p>Recupere o acesso à sua plataforma e continue monitorando a sua produção.</p>
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

          <h1 className="login-title">Recuperar Senha</h1>
          <p className="login-subtitle">
            Digite o seu e-mail abaixo. Vamos enviar um link para você redefinir a sua senha.
          </p>

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            
            <div className="input-group">
              <label htmlFor="email">E-mail cadastrado</label>
              <input type="email" id="email" placeholder="Digite o seu e-mail" required />
            </div>

            <Link to="/login" className="btn-login">
              ENVIAR LINK DE RECUPERAÇÃO
            </Link>
          </form>
          
          <div className="login-footer" style={{ marginTop: '80px' }}>
            <p>Termos e Serviços | © 2026 AgriNexus</p>
          </div>
        </div>
      </div>

    </div>
  );
}