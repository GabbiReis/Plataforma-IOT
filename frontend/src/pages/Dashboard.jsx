import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css"; 
import ChartCard from "../components/ChartCard";
import { AlertTriangle, CheckCircle2, Droplets, ThermometerSun, ArrowLeftRight, Settings2, RefreshCcw } from "lucide-react"; 
import imgAgricultor from "../assets/images/agrucutor-acompanhando.jpg";
import videoDrone from "../assets/videos/drone-monitoramento.mp4";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState(null);
  const [layoutInvertido, setLayoutInvertido] = useState(false);
  const [metrica, setMetrica] = useState("umidade");
  const [dadosHistorico, setDadosHistorico] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [dadosVitais, setDadosVitais] = useState({
    temperatura: "--",
    umidade: "--",
    pressao: "--",
    luz: "--",
    bateria: "--",
    wifi: "--",
    atualizacao: "--"
  });
  
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

  useEffect(() => {
    const userLogado = localStorage.getItem("usuarioLogado");
    if (!userLogado) {
      navigate("/login");
    } else {
      try {
        setUsuario(JSON.parse(userLogado));
      } catch (e) {
        localStorage.removeItem("usuarioLogado");
        navigate("/login");
      }
    }
  }, [navigate]);

  const formatarDataHora = (isoString) => {
    if (!isoString) return "--";
    const data = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).format(data);
  };

  useEffect(() => {
    if (!usuario) return;

    const buscarDadosVitais = async () => {
      setSincronizando(true);
      try {
        const resposta = await fetch(`${API_URL}/api/leituras/ultima`);
        const dadosReais = await resposta.json();
        
        setDadosVitais({
          temperatura: typeof dadosReais.temperatura === 'number' ? dadosReais.temperatura.toFixed(1) : (dadosReais.temperatura ?? "--"),
          umidade: typeof dadosReais.umidade_solo === 'number' ? Math.round(dadosReais.umidade_solo) : (dadosReais.umidade_solo ?? "--"),
          pressao: typeof dadosReais.pressao === 'number' ? dadosReais.pressao.toFixed(1) : (dadosReais.pressao ?? "--"),
          luz: typeof dadosReais.luz === 'number' ? Math.round(dadosReais.luz) : (dadosReais.luz ?? "--"),
          bateria: typeof dadosReais.bateria === 'number' ? dadosReais.bateria.toFixed(2) : (dadosReais.bateria ?? "--"),
          wifi: typeof dadosReais.rssi === 'number' ? Math.round(dadosReais.rssi) : (dadosReais.rssi ?? "--"),
          atualizacao: dadosReais.registrado_em ? formatarDataHora(dadosReais.registrado_em) : "--"
        });

        // Busca o histórico real do banco para desenhar nos gráficos interativos
        const resHist = await fetch(`${API_URL}/api/leituras/historico`);
        const histData = await resHist.json();
        setDadosHistorico(histData);

      } catch (error) {
        console.error("Erro ao buscar dados reais da placa:", error);
      } finally {
        setSincronizando(false);
      }
    };

    buscarDadosVitais();
    const intervalo = setInterval(buscarDadosVitais, 5000); 
    return () => clearInterval(intervalo);
  }, [usuario]);

  if (!usuario) return null;

  const dataAtual = new Date();
  
  const diaDaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(dataAtual);
 
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(dataAtual);

  // Lógica de Inteligência e Alertas (Fase 4 do TCC)
  const soloSeco = dadosVitais.umidade !== "--" && parseFloat(dadosVitais.umidade) < limites.umidMin;
  const muitoQuente = dadosVitais.temperatura !== "--" && parseFloat(dadosVitais.temperatura) > limites.tempMax;

  const configsMetrica = {
     umidade: { labelAtual: "Umidade Atual", labelAnterior: "Leitura Anterior", corAtual: "#3498db", corAnterior: "#dbeaf8", unidade: "%" },
     temperatura: { labelAtual: "Temp. Atual", labelAnterior: "Leitura Anterior", corAtual: "#FF8C00", corAnterior: "#ffe0b2", unidade: "°C" },
     luz: { labelAtual: "Luz Atual", labelAnterior: "Leitura Anterior", corAtual: "#f1c40f", corAnterior: "#fcf3cf", unidade: "lux" }
  };
  
  const ultimas7 = dadosHistorico.slice(-7);

  const dadosSemana = {
    umidade: ultimas7.length > 0 ? ultimas7.map(d => ({ dia: d.hora, atual: d.umidade, anterior: Math.max(0, d.umidade - 5), max: 100 })) : [ { dia: '#1', atual: 60, anterior: 55, max: 100 }, { dia: '#2', atual: 55, anterior: 50, max: 100 }, { dia: '#3', atual: 50, anterior: 45, max: 100 }, { dia: '#4', atual: 48, anterior: 43, max: 100 }, { dia: '#5', atual: 45, anterior: 40, max: 100 }, { dia: '#6', atual: 42, anterior: 37, max: 100 }, { dia: '#7', atual: 38, anterior: 33, max: 100 } ],
    temperatura: ultimas7.length > 0 ? ultimas7.map(d => ({ dia: d.hora, atual: d.temperatura, anterior: Math.max(0, d.temperatura - 2), max: 50 })) : [ { dia: '#1', atual: 24, anterior: 22, max: 50 }, { dia: '#2', atual: 26, anterior: 24, max: 50 }, { dia: '#3', atual: 28, anterior: 26, max: 50 }, { dia: '#4', atual: 31, anterior: 29, max: 50 }, { dia: '#5', atual: 33, anterior: 31, max: 50 }, { dia: '#6', atual: 34, anterior: 32, max: 50 }, { dia: '#7', atual: 35, anterior: 33, max: 50 } ],
    luz: ultimas7.length > 0 ? ultimas7.map(d => ({ dia: d.hora, atual: d.luz || 0, anterior: Math.max(0, (d.luz || 0) - 50), max: 4000 })) : [ { dia: '#1', atual: 800, anterior: 750, max: 4000 }, { dia: '#2', atual: 1200, anterior: 1100, max: 4000 }, { dia: '#3', atual: 1500, anterior: 1400, max: 4000 }, { dia: '#4', atual: 2100, anterior: 2000, max: 4000 }, { dia: '#5', atual: 2800, anterior: 2700, max: 4000 }, { dia: '#6', atual: 3600, anterior: 3500, max: 4000 }, { dia: '#7', atual: 3800, anterior: 3700, max: 4000 } ]
  };

  const dadosAnuais = {
    umidade: dadosHistorico.length > 0 ? dadosHistorico.map(d => ({ name: d.hora, current: d.umidade, last: Math.max(0, d.umidade - 5) })) : [ { name: "#01", current: 65, last: 60 }, { name: "#02", current: 68, last: 62 }, { name: "#03", current: 60, last: 58 }, { name: "#04", current: 55, last: 50 }, { name: "#05", current: 50, last: 48 }, { name: "#06", current: 45, last: 42 }, { name: "#07", current: 40, last: 38 }, { name: "#08", current: 38, last: 35 }, { name: "#09", current: 42, last: 40 }, { name: "#10", current: 50, last: 48 } ],
    temperatura: dadosHistorico.length > 0 ? dadosHistorico.map(d => ({ name: d.hora, current: d.temperatura, last: Math.max(0, d.temperatura - 2) })) : [ { name: "#01", current: 28, last: 26 }, { name: "#02", current: 29, last: 27 }, { name: "#03", current: 27, last: 26 }, { name: "#04", current: 25, last: 24 }, { name: "#05", current: 22, last: 21 }, { name: "#06", current: 20, last: 19 }, { name: "#07", current: 19, last: 18 }, { name: "#08", current: 21, last: 20 }, { name: "#09", current: 24, last: 22 }, { name: "#10", current: 26, last: 24 } ],
    luz: dadosHistorico.length > 0 ? dadosHistorico.map(d => ({ name: d.hora, current: d.luz || 0, last: Math.max(0, (d.luz || 0) - 50) })) : [ { name: "#01", current: 800, last: 700 }, { name: "#02", current: 1200, last: 1100 }, { name: "#03", current: 1500, last: 1400 }, { name: "#04", current: 2100, last: 2000 }, { name: "#05", current: 2800, last: 2600 }, { name: "#06", current: 3600, last: 3400 }, { name: "#07", current: 3800, last: 3600 }, { name: "#08", current: 3400, last: 3200 }, { name: "#09", current: 2600, last: 2500 }, { name: "#10", current: 1900, last: 1800 } ]
  };

  const configAtual = configsMetrica[metrica];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar usuario={usuario} statusIot={dadosVitais} />

        <div className="dashboard-content">

          {/* CABEÇALHO COM A ÚLTIMA SINCRONIZAÇÃO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', color: '#0A2518' }}>Visão Geral da Fazenda</h1>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>Acompanhe os dados da sua estufa em tempo real</p>
            </div>
            <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCcw size={16} color={dadosVitais.atualizacao !== "--" ? "#84E034" : "#ccc"} className={sincronizando ? "spin-animation" : ""} /> 
              <b>Última Sincronização:</b> {dadosVitais.atualizacao}
            </div>
          </div>

          {/* ========================================================== */}
          {/* NOVA SEÇÃO: ALERTAS INTELIGENTES E SINAIS VITAIS DO SENSOR */}
          {/* ========================================================== */}
          <section className="dashboard-alerts-row" style={{ marginBottom: "24px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
            
            {/* CAIXA DE ALERTA DINÂMICA */}
            <div style={{ flex: "1 1 400px", background: (soloSeco || muitoQuente) ? "#FFF0F0" : "#F0FFF4", borderLeft: `5px solid ${(soloSeco || muitoQuente) ? "#FF4D4D" : "#84E034"}`, padding: "20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              {(soloSeco || muitoQuente) ? <AlertTriangle color="#FF4D4D" size={35} /> : <CheckCircle2 color="#84E034" size={35} />}
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: (soloSeco || muitoQuente) ? "#D32F2F" : "#0A2518", fontSize: "16px" }}>
                  {(soloSeco || muitoQuente) ? "Atenção Necessária" : "Ambiente Estável"}
                </h4>
                <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                  {soloSeco && "💧 A umidade do solo está criticamente baixa. Recomendada irrigação. "}
                  {muitoQuente && "🌡️ A temperatura ultrapassou o limite ideal."}
                  {(!soloSeco && !muitoQuente) && "Todos os parâmetros da estufa estão dentro do ideal."}
                </p>
              </div>
            </div>

            {/* DESTAQUE DE DADOS REAIS DO SENSOR */}
            <div style={{ flex: "1 1 200px", background: "white", padding: "15px 20px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
               <div>
                  <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold", textTransform: "uppercase" }}>Umidade do Solo (LILYGO)</span>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: soloSeco ? "#FF4D4D" : "#0A2518" }}>{dadosVitais.umidade}%</div>
               </div>
               <Droplets color={soloSeco ? "#FF4D4D" : "#3498db"} size={32} opacity={0.8} />
            </div>

            <div style={{ flex: "1 1 200px", background: "white", padding: "15px 20px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
               <div>
                  <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold", textTransform: "uppercase" }}>Temperatura Interna</span>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: muitoQuente ? "#FF8C00" : "#0A2518" }}>{dadosVitais.temperatura}°C</div>
               </div>
               <ThermometerSun color={muitoQuente ? "#FF8C00" : "#f1c40f"} size={32} opacity={0.8} />
            </div>
            
          </section>
          {/* ========================================================== */}

          <section className="dashboard-top-row">

            <div className="dash-card weather-card">
              <span className="card-subtitle">Clima hoje</span>
              <h2 style={{ textTransform: 'capitalize' }}>{diaDaSemana}</h2>
              <p className="date-text">{dataFormatada}</p>

              <div className="temp-circle">
                <span className="temp-value">{dadosVitais.temperatura}°C</span>
                <span className="temp-label">Temp ambiente</span>
              </div>

              <div className="weather-stats">
                <span title="Luminosidade">☀️ {dadosVitais.luz} lux</span>
                <span title="Umidade do Solo">💧 {dadosVitais.umidade}%</span>
                <span title="Pressão Atmosférica">☁️ {dadosVitais.pressao} hPa</span>
              </div>
              <div className="weather-stats" style={{ marginTop: '10px' }}>
                <span title="Nível de Bateria">🔋 {dadosVitais.bateria}V</span>
                <span title="Sinal Wi-Fi (RSSI)">📶 {dadosVitais.wifi} dBm</span>
              </div>
            </div>

            <div className="dash-card vertical-farm-card">
              <div className="video-thumbnail" style={{ height: "160px", borderRadius: "12px", overflow: "hidden", background: "#000" }}>
                <video 
                  src={videoDrone} 
                  autoPlay 
                  loop 
                  muted 
                  controls={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="vertical-farm-info">
                <div className="info-header" style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "14px" }}>Monitoramento Drone</h4>
                  <span className="time-range" style={{ background: "#E8F5E9", color: "#2E7D32", padding: "2px 6px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" }}>
                    🟢 Em Rota
                  </span>
                </div>
                <p style={{ marginTop: "8px", fontSize: "11px", opacity: 0.8, lineHeight: 1.5 }}>
                  Imagens aéreas auxiliam os sensores IoT de solo na detecção rápida de anomalias na lavoura.
                </p>
              </div>
            </div>
            
            <div className="dash-card feature-image-card">
              <div className="full-img" style={{ height: '100%' }}>
                 <img 
                   src={imgAgricultor} 
                   alt="Agricultor acompanhando" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} 
                 />
              </div>
            </div>

          </section>

          {/* BARRA DE FERRAMENTAS INTERATIVA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, color: '#0A2518', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Settings2 size={20} color="#84E034" /> Análises Interativas
            </h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
               <select 
                  value={metrica} 
                  onChange={(e) => setMetrica(e.target.value)} 
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', outline: 'none', fontWeight: 'bold', color: '#0A2518', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
               >
                  <option value="umidade">💧 Medir Umidade</option>
                  <option value="temperatura">🌡️ Medir Temperatura</option>
                  <option value="luz">☀️ Medir Luminosidade</option>
               </select>
               <button 
                  onClick={() => setLayoutInvertido(!layoutInvertido)} 
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: '#0A2518', color: '#84E034', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'transform 0.1s' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
               >
                  <ArrowLeftRight size={16} /> Trocar Lados
               </button>
            </div>
          </div>

          <section className="dashboard-bottom-row" style={{ flexDirection: layoutInvertido ? 'row-reverse' : 'row', transition: 'all 0.3s ease' }}>

            <div className="dash-card growth-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#0A2518', fontSize: '16px' }}>Últimos Registros ({configAtual.unidade})</h3>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>7 leituras</span>
              </div>

              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                {dadosSemana[metrica].map((dado, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '12%' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '150px', width: '100%', justifyContent: 'center' }}>
                      <div 
                        title={`${configAtual.labelAnterior}: ${dado.anterior}${configAtual.unidade}`}
                        style={{ width: '12px', height: `${(dado.anterior / dado.max) * 100}%`, background: configAtual.corAnterior, borderRadius: '4px 4px 0 0', cursor: 'pointer', transition: 'height 0.5s ease-out, background 0.5s ease-out' }}
                      ></div>
                      <div 
                        title={`${configAtual.labelAtual}: ${dado.atual}${configAtual.unidade}`}
                        style={{ width: '12px', height: `${(dado.atual / dado.max) * 100}%`, background: configAtual.corAtual, borderRadius: '4px 4px 0 0', cursor: 'pointer', transition: 'height 0.5s ease-out, background 0.5s ease-out', boxShadow: `0 -2px 5px ${configAtual.corAtual}80` }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>{dado.dia}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '15px', fontSize: '13px', fontWeight: 'bold', color: '#0A2518' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: configAtual.corAtual, borderRadius: '3px', transition: 'background 0.5s' }}></div> {configAtual.labelAtual}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: configAtual.corAnterior, borderRadius: '3px', transition: 'background 0.5s' }}></div> {configAtual.labelAnterior}
                </div>
              </div>
            </div>

            <div className="dash-card production-card">
              <div className="card-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#0A2518', fontSize: '16px' }}>Histórico Contínuo ({configAtual.unidade})</h3>
                <div className="chart-legend" style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: configAtual.corAtual, transition: 'background 0.5s' }}></div> 
                    {configAtual.labelAtual}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: configAtual.corAnterior, transition: 'background 0.5s' }}></div> 
                    {configAtual.labelAnterior}
                  </span>
                </div>
              </div>

              <ChartCard 
                 customData={dadosAnuais[metrica]} 
                 labelAtual={configAtual.labelAtual} 
                 labelAnterior={configAtual.labelAnterior} 
                 corAtual={configAtual.corAtual} 
                 corAnterior={configAtual.corAnterior} 
              />
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}