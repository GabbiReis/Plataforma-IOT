import { Link } from "react-router-dom";
import "../styles/layout.css";
import farmBg from "../assets/images/farm-bg.png";

export default function Landing() {
  
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="inicio" style={{ width: '100%', overflowX: 'hidden' }}>
      
      <div 
        className="hero-section" 
        style={{
          backgroundImage: `url(${farmBg})`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          minHeight: '100vh', 
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="landing-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <header className="landing-header">
            <div className="logo">
              <span className="logo-icon">🌿</span> AgriNexus
            </div>

            <nav className="menu">
              <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')}>INICIO</a>
              <a href="#info" onClick={(e) => scrollToSection(e, 'info')}>- INFO -</a>
              <a href="#contato" onClick={(e) => scrollToSection(e, 'contato')}>CONTATO</a>
            </nav>

            <Link className="btn-outline" to="/login">
              ABRIR DASHBOARD
            </Link>
          </header>

          <main className="hero-center" style={{ margin: 'auto' }}>
            <h1 className="huge-title">AGRI<span className="text-light">NEXUS</span></h1>
            
            <p className="subtitle">
              Plataforma de agricultura inteligente que integra sensores IoT, 
              Inteligência Artificial e análise de dados para monitoramento agrícola em tempo real.
            </p>

            <Link to="/login" className="btn-primary-pill">
              COMEÇAR AGORA
            </Link>
          </main>

          <footer className="hero-footer">
            
            <div className="features-mini">
              <span>🌱 Monitoramento IoT</span>
              <span>🧠 Inteligência Artificial</span>
              <span>📊 Dashboard Analítico</span>
            </div>

            <div className="social-links">
              <a href="#fb">f</a>
              <a href="#ig">📷</a>
              <a href="#yt">▶</a>
            </div>
          </footer>
        </div>
      </div>
      
      <section id="info" style={{ padding: '100px 20px', backgroundColor: '#f8f9fa', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '36px', color: '#0A2518' }}>Como funciona o AgriNexus?</h2>
        <p style={{ color: '#666', maxWidth: '800px', margin: '20px auto', lineHeight: '1.6' }}>
          Nossa arquitetura moderna coleta dados em tempo real dos sensores espalhados pela fazenda. 
          A inteligência artificial analisa a saúde do solo, umidade e temperatura, enviando dicas 
          diretas para o seu painel de controle.
        </p>
      </section>

      <section id="contato" style={{ padding: '100px 20px', backgroundColor: '#0A2518', color: 'white', textAlign: 'center', minHeight: '50vh' }}>
        <h2 style={{ fontSize: '36px', color: '#84E034' }}>Fale Conosco</h2>
        <p style={{ maxWidth: '600px', margin: '20px auto', opacity: 0.8 }}>
          Pronto para revolucionar a sua gestão agrícola? Entre em contato com a nossa equipe
          para agendar uma demonstração completa do sistema em sua fazenda.
        </p>
        <button style={{ background: '#84E034', color: '#0A2518', padding: '15px 30px', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', marginTop: '20px', cursor: 'pointer' }}>
          Enviar Mensagem
        </button>
      </section>

    </div>
  );
}