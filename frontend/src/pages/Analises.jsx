import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, Activity, Thermometer, Droplets, Sun, Battery } from "lucide-react";
import "../styles/dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Analises() {
  const [usuario, setUsuario] = useState(null);
  
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [dicaIA, setDicaIA] = useState("Aguardando coleta de dados suficientes para análise preditiva...");
  const [carregandoIA, setCarregandoIA] = useState(true);
  const [dadosVitais, setDadosVitais] = useState({
    temperatura: "--", umidade_solo: "--", luz: "--", bateria: "--"
  });

  useEffect(() => {
    const userLogado = localStorage.getItem("usuarioLogado");
    if (userLogado) setUsuario(JSON.parse(userLogado));
  }, []);

  useEffect(() => {
    const buscarGrafico = async () => {
      try {
        const resGrafico = await fetch(`${API_URL}/api/leituras/historico`);
        const dataGrafico = await resGrafico.json();
        
        const dadosFormatados = dataGrafico.map((leitura) => ({
          tempo: leitura.hora,
          temperatura: leitura.temperatura,
          umidade_solo: leitura.umidade 
        }));
        
        setDadosGrafico(dadosFormatados);
      } catch (error) {
        console.error("Erro ao carregar Gráfico:", error);
      }
    };

    buscarGrafico();
    const intervaloGrafico = setInterval(buscarGrafico, 10000);
    return () => clearInterval(intervaloGrafico);
  }, []);

  useEffect(() => {
    const buscarDicaIA = async () => {
      setCarregandoIA(true);
      try {
        const resIA = await fetch(`${API_URL}/analises/dica-ia`);
        
        if (!resIA.ok) {
          if (resIA.status === 429) {
             setDicaIA("A Inteligência Artificial está temporariamente indisponível (limite de requisições gratuito atingido). Tente novamente daqui a pouco.");
             return;
          }
          throw new Error(`Erro na API HTTP: ${resIA.status}`);
        }

        const dataIA = await resIA.json();
        if(dataIA.dica) setDicaIA(dataIA.dica);
      } catch (error) {
        console.error("Erro ao carregar IA:", error);
        setDicaIA("Falha na comunicação com a IA. Modo de espera ativado monitorando novos padrões climáticos na estufa.");
      } finally {
        setCarregandoIA(false);
      }
    };

    buscarDicaIA();
    const intervaloIA = setInterval(buscarDicaIA, 300000); // Atualiza IA a cada 5 min
    return () => clearInterval(intervaloIA);
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const buscarDadosVitais = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/leituras/ultima`);
        const dadosReais = await resposta.json();
        
        setDadosVitais({
          temperatura: typeof dadosReais.temperatura === 'number' ? dadosReais.temperatura.toFixed(1) : (dadosReais.temperatura ?? "--"),
          umidade_solo: typeof dadosReais.umidade_solo === 'number' ? Math.round(dadosReais.umidade_solo) : (dadosReais.umidade_solo ?? "--"),
          luz: typeof dadosReais.luz === 'number' ? Math.round(dadosReais.luz) : (dadosReais.luz ?? "--"),
          bateria: typeof dadosReais.bateria === 'number' ? dadosReais.bateria.toFixed(2) : (dadosReais.bateria ?? "--"),
          wifi: typeof dadosReais.rssi === 'number' ? Math.round(dadosReais.rssi) : (dadosReais.rssi ?? "--")
        });

      } catch (error) {
        console.error("Erro ao buscar dados vitais:", error);
      }
    };

    buscarDadosVitais();
    const intervalo = setInterval(buscarDadosVitais, 5000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  if (!usuario) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar usuario={usuario} statusIot={dadosVitais} /> {/* Passando dados pro Topbar igual no Dash! */}

        <div className="dashboard-content">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', color: '#0A2518' }}>Análises e Inteligência Artificial</h1>
            <p style={{ color: '#666' }}>Análise cruzada de dados da Estufa Principal via LILYGO T-Higrow</p>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* CARD DA IA */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0A2518 0%, #154734 100%)', 
              padding: '24px', 
              borderRadius: '16px', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(10, 37, 24, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Sparkles size={24} color="#84E034" />
                <h3 style={{ margin: 0, fontSize: '18px', color: '#84E034' }}>AgriNexus AI Insights</h3>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px' }}>
                {carregandoIA ? (
                  <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8 }}>Analisando padrões recentes e cruzando com histórico agrícola...</p>
                ) : (
                  <p style={{ margin: 0, lineHeight: '1.6', fontSize: '15px' }}>{dicaIA}</p>
                )}
              </div>
            </div>

            {/* CARDS DE DADOS EXATOS DO SENSOR LILYGO */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#0A2518' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Temperatura</span>
                    <Thermometer size={18} color="#FF8C00" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px' }}>{dadosVitais.temperatura}°C</div>
                </div>

                <div style={{ flex: 1, minWidth: '150px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#0A2518' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Umidade Solo</span>
                    <Droplets size={18} color="#3498db" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px' }}>{dadosVitais.umidade_solo}%</div>
                </div>

                <div style={{ flex: 1, minWidth: '150px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#0A2518' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Luminosidade</span>
                    <Sun size={18} color="#f1c40f" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px' }}>{dadosVitais.luz} <span style={{fontSize: '14px'}}>lux</span></div>
                </div>

                <div style={{ flex: 1, minWidth: '150px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#0A2518' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Tensão (Pilha)</span>
                    <Battery size={18} color="#84E034" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px' }}>{dadosVitais.bateria}V</div>
                </div>
            </div>

            {/* GRÁFICO AVANÇADO (TEMPERATURA X UMIDADE) */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Activity size={20} color="#0A2518" />
                <h3 style={{ margin: 0, color: '#0A2518' }}>Correlação Clima vs. Solo (Tempo Real)</h3>
              </div>

              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="tempo" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0A2518', marginBottom: '5px' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    
                    {/* Linha da Temperatura */}
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      name="Temperatura (°C)"
                      dataKey="temperatura" 
                      stroke="#FF8C00" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'white', stroke: '#FF8C00', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#FF8C00', stroke: 'white', strokeWidth: 2 }}
                    />
                    
                    {/* Linha da Umidade */}
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      name="Umidade do Solo (%)"
                      dataKey="umidade_solo" 
                      stroke="#3498db" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'white', stroke: '#3498db', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#3498db', stroke: 'white', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}