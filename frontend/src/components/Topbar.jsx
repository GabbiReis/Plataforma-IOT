import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, Bell, ChevronDown, Settings, LogOut, Menu, Battery, Wifi } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Topbar({ usuario, onSearch, statusIot }) {
  const navigate = useNavigate();
  const primeiroNome = usuario?.nome_completo?.split(" ")[0] || "Usuário";

  const [menuAberto, setMenuAberto] = useState(null); 
  const [dadosGlobais, setDadosGlobais] = useState(null);
  
  const [limites, setLimites] = useState(() => {
    const salvos = localStorage.getItem("limitesAlertas");
    return salvos ? JSON.parse(salvos) : { tempMax: 32, umidMin: 40 };
  });

  useEffect(() => {
    const atualizarLimites = () => {
      const salvos = localStorage.getItem("limitesAlertas");
      if (salvos) setLimites(JSON.parse(salvos));
    };
    window.addEventListener("limitesAtualizados", atualizarLimites);
    return () => window.removeEventListener("limitesAtualizados", atualizarLimites);
  }, []);

  // Busca dados IoT automaticamente para as páginas que não possuem a prop "statusIot"
  useEffect(() => {
    if (!statusIot) {
      fetch(`${API_URL}/api/leituras/ultima`)
        .then(res => res.json())
        .then(data => {
          setDadosGlobais({
            temperatura: typeof data.temperatura === 'number' ? data.temperatura.toFixed(1) : (data.temperatura ?? "--"),
            umidade_solo: typeof data.umidade_solo === 'number' ? Math.round(data.umidade_solo) : (data.umidade_solo ?? "--"),
            pressao: typeof data.pressao === 'number' ? data.pressao.toFixed(1) : (data.pressao ?? "--"),
            luz: typeof data.luz === 'number' ? Math.round(data.luz) : (data.luz ?? "--"),
            bateria: typeof data.bateria === 'number' ? data.bateria.toFixed(2) : (data.bateria ?? "--"),
            wifi: typeof data.rssi === 'number' ? Math.round(data.rssi) : (data.rssi ?? "--")
          });
        })
        .catch(err => console.error("Erro ao buscar IoT global:", err));
    }
  }, [statusIot]);

  const dadosAtuais = statusIot || dadosGlobais;

  const toggleMenu = (menu) => {
    if (menuAberto === menu) setMenuAberto(null);
    else setMenuAberto(menu);
  };

  const fazerLogout = () => {
    localStorage.removeItem("usuarioLogado");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  // Lógica para cor da bateria
  const getBatteryColor = (volts) => {
    if (volts > 3.8) return "#84E034"; // Verde (Cheia)
    if (volts > 3.5) return "#FFD700"; // Amarelo (Média)
    return "#FF4D4D"; // Vermelho (Fraca)
  };

  // Gera notificações baseadas nos dados REAIS dos sensores
  const gerarNotificacoes = () => {
    if (!dadosAtuais || dadosAtuais.temperatura === "--") return [{ id: 0, tipo: 'aviso', titulo: '🔄 Sincronizando', texto: 'Aguardando dados dos sensores IoT...' }];
    
    const alertas = [];
    const temp = parseFloat(dadosAtuais.temperatura);
    const umid = parseFloat(dadosAtuais.umidade ?? dadosAtuais.umidade_solo);
    const bat = parseFloat(dadosAtuais.bateria);
    const sinal = parseFloat(dadosAtuais.wifi ?? dadosAtuais.rssi);

    if (!isNaN(temp) && temp > limites.tempMax) {
      alertas.push({ id: 1, tipo: 'critico', titulo: '⚠️ Alerta de Temperatura', texto: `A estufa atingiu ${temp}°C (Limite: ${limites.tempMax}°C). Risco de estresse térmico!` });
    }
    if (!isNaN(temp) && temp < 20) {
      alertas.push({ id: 2, tipo: 'aviso', titulo: '❄️ Temperatura Baixa', texto: `A temperatura caiu para ${temp}°C. Verifique o ambiente.` });
    }
    if (!isNaN(umid) && umid < limites.umidMin) {
      alertas.push({ id: 3, tipo: 'critico', titulo: '💧 Umidade Crítica', texto: `O solo está muito seco (${umid}%). O mínimo ideal é ${limites.umidMin}%. Irrigação imediata recomendada.` });
    }
    if (!isNaN(bat) && bat <= 3.5) {
      alertas.push({ id: 4, tipo: 'aviso', titulo: '🔋 Bateria Fraca', texto: `A tensão do sensor caiu para ${bat}V. Recarregue a LILYGO em breve.` });
    }
    if (!isNaN(sinal) && sinal < -80) {
      alertas.push({ id: 5, tipo: 'aviso', titulo: '📶 Sinal Instável', texto: `A conexão Wi-Fi do sensor está muito fraca (${sinal} dBm).` });
    }
    
    if (alertas.length === 0) {
      alertas.push({ id: 6, tipo: 'sucesso', titulo: '✅ Ambiente Estável', texto: 'Todas as métricas da estufa estão dentro do padrão ideal.' });
    }
    return alertas;
  };

  const notificacoesReais = gerarNotificacoes();
  const temAlertasCriticos = notificacoesReais.some(n => n.tipo === 'critico' || n.tipo === 'aviso');

  return (
    <header className="topbar">

      <button 
        className="mobile-menu-btn" 
        onClick={() => document.querySelector('.sidebar').classList.toggle('mobile-open')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0A2518', display: window.innerWidth <= 900 ? 'block' : 'none' }}
      >
        <Menu size={28} />
      </button>
      
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar plantação, sensor ou estufa..." 
          className="search-input"
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>

      {dadosAtuais && dadosAtuais.temperatura !== "--" && (
        <div className="topbar-status" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginLeft: 'auto', marginRight: '20px' }}>
          {/* ÍCONE DE WI-FI */}
          <div className="status-item" title={`Sinal: ${dadosAtuais.wifi ?? dadosAtuais.rssi ?? '--'} dBm`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold', color: '#0A2518' }}>
            <Wifi size={20} color={(dadosAtuais.wifi ?? dadosAtuais.rssi) > -70 ? "#84E034" : "#FF4D4D"} />
            <span>{(dadosAtuais.wifi ?? dadosAtuais.rssi) > -70 ? "Estável" : "Fraco"}</span>
          </div>

          {/* ÍCONE DE BATERIA */}
          <div className="status-item" title={`${dadosAtuais.bateria}V`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold', color: '#0A2518' }}>
            <Battery size={20} color={getBatteryColor(dadosAtuais.bateria)} />
            <span>{dadosAtuais.bateria}V</span>
          </div>
        </div>
      )}

      <div className="topbar-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: dadosAtuais ? '0' : 'auto' }}>
        
        <div style={{ position: 'relative' }}>
          <button className="action-btn" onClick={() => toggleMenu('mensagens')}>
            <MessageSquare size={20} />
          </button>
          
          {menuAberto === 'mensagens' && (
            <div style={{ position: 'absolute', top: '50px', right: '-50px', width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', zIndex: 100, padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0A2518' }}>Mensagens (2)</h4>
              
              <div style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong style={{ color: '#0A2518' }}>Agrônomo Carlos:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>A estufa Leste precisa de atenção na irrigação hoje à tarde.</p>
              </div>
              <div style={{ fontSize: '13px' }}>
                <strong style={{ color: '#0A2518' }}>Suporte AgriNexus:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>Sua fatura de manutenção foi gerada com sucesso.</p>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative' }}>
          <button className={`action-btn ${temAlertasCriticos ? 'has-notification' : ''}`} onClick={() => toggleMenu('notificacoes')}>
            <Bell size={20} />
            {temAlertasCriticos && <span className="notification-dot"></span>}
          </button>

          {menuAberto === 'notificacoes' && (
            <div style={{ position: 'absolute', top: '50px', right: '-20px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', zIndex: 100, padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0A2518' }}>Notificações IoT</h4>
              
              {notificacoesReais.map(notif => (
                <div key={notif.id} style={{ 
                  fontSize: '13px', 
                  background: notif.tipo === 'critico' ? '#FFF0F0' : notif.tipo === 'sucesso' ? '#E8F8E0' : '#FFF4E5', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '10px', 
                  color: notif.tipo === 'critico' ? '#D32F2F' : notif.tipo === 'sucesso' ? '#1B5E20' : '#8A3C00' 
                }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>{notif.titulo}</strong>
                  {notif.texto}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <div className="user-profile" style={{ cursor: 'pointer' }} onClick={() => toggleMenu('perfil')}>
            <img 
              src={`https://ui-avatars.com/api/?name=${usuario?.nome_completo || 'User'}&background=84E034&color=0A2518&bold=true`} 
              alt="Avatar do Usuário" 
              className="avatar"
            />
            <div className="user-info">
              <span className="user-name">{primeiroNome}</span>
              <span className="user-location">Fazenda Principal</span>
            </div>
            <ChevronDown size={16} className="dropdown-icon" />
          </div>

          {menuAberto === 'perfil' && (
            <div style={{ position: 'absolute', top: '60px', right: '0', width: '200px', background: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
              
              <div 
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#0A2518', fontSize: '14px', fontWeight: '500' }}
                onClick={() => { toggleMenu(null); navigate('/configuracoes'); }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={18} /> Configurações
              </div>
              
              <div 
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#D32F2F', fontSize: '14px', fontWeight: '500' }}
                onClick={fazerLogout}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fdfdfd'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={18} /> Sair do Sistema
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}