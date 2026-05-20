import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/layout.css";
import farmBg from "../assets/images/farm-bg.png";

export default function Landing() {
  const [formContato, setFormContato] = useState({ nome: "", email: "", mensagem: "" });
  const [enviado, setEnviado] = useState(false);
  
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnviarContato = (e) => {
    e.preventDefault();
    // Aqui simulamos o envio da mensagem. Num sistema real, mandaria para o backend.
    setEnviado(true);
    setFormContato({ nome: "", email: "", mensagem: "" });
    
    // Oculta a mensagem de sucesso após 5 segundos
    setTimeout(() => setEnviado(false), 5000);
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
        
        <div style={{ maxWidth: '500px', margin: '40px auto', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(132, 224, 52, 0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          {enviado ? (
            <div style={{ color: '#84E034', fontWeight: 'bold', fontSize: '18px', padding: '30px 0', animation: 'fadeInDown 0.5s' }}>
              ✅ Mensagem enviada com sucesso!<br/>
              <span style={{ fontSize: '14px', color: '#A0B2A6', display: 'block', marginTop: '10px' }}>Entraremos em contato em breve.</span>
            </div>
          ) : (
            <form onSubmit={handleEnviarContato} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#A0B2A6', fontWeight: 'bold' }}>Seu Nome</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Como podemos te chamar?" 
                  value={formContato.nome} 
                  onChange={(e) => setFormContato({...formContato, nome: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#A0B2A6', fontWeight: 'bold' }}>Seu E-mail</label>
                <input 
                  required 
                  type="email" 
                  placeholder="Para onde enviamos a resposta?" 
                  value={formContato.email} 
                  onChange={(e) => setFormContato({...formContato, email: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#A0B2A6', fontWeight: 'bold' }}>Sua Mensagem</label>
                <textarea 
                  required 
                  placeholder="Conte-nos um pouco sobre a sua necessidade..." 
                  rows="4" 
                  value={formContato.mensagem} 
                  onChange={(e) => setFormContato({...formContato, mensagem: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                ></textarea>
              </div>
              <button type="submit" style={{ background: '#84E034', color: '#0A2518', padding: '15px 30px', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                Enviar Mensagem
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}