import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { User, Bell, Shield, Cpu, Save, Wifi, PlusCircle, CheckCircle2, Activity, Eye, EyeOff } from "lucide-react";
import "../styles/dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Configuracoes() {
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState({ nome_completo: "", email: "" });
  const [novoSensor, setNovoSensor] = useState({ nome: "", tipo: "", estufa_id: 1 });
  const [mensagemSensor, setMensagemSensor] = useState("");
  
  const [senhaForm, setSenhaForm] = useState({ nova: "", confirmar: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  
  const [salvando, setSalvando] = useState(false);
  const [mensagemSalvo, setMensagemSalvo] = useState(false);

  const [sensoresAtivos, setSensoresAtivos] = useState([
    { id: "SENS-001", nome: "LILYGO T-Higrow (Solo)", tipo: "Múltiplo", estufa: 1, status: "Online" },
    { id: "SENS-002", nome: "Sensor DHT22 (Teto)", tipo: "Temperatura Ar", estufa: 1, status: "Online" }
  ]);

  const [limites, setLimites] = useState(() => {
    const salvos = localStorage.getItem("limitesAlertas");
    return salvos ? JSON.parse(salvos) : { tempMax: 32, umidMin: 40, nitro: 20 };
  });
  const [notificacoes, setNotificacoes] = useState(() => {
    const salvos = localStorage.getItem("notificacoesPrefs");
    return salvos ? JSON.parse(salvos) : { email: true, ia: true, faturas: false };
  });

  useEffect(() => {
    const userLogado = localStorage.getItem("usuarioLogado");
    if (!userLogado) {
      navigate("/login");
    } else {
      setUsuario(JSON.parse(userLogado));
    }
  }, [navigate]);

  const handleSalvarConfiguracoes = async () => {
    setErroSenha("");
    
    // Validação da senha se o usuário preencheu algum dos campos
    if (senhaForm.nova || senhaForm.confirmar) {
      if (senhaForm.nova !== senhaForm.confirmar) {
        setErroSenha("❌ As senhas não coincidem!");
        return;
      }
      if (senhaForm.nova.length < 8) {
        setErroSenha("❌ A senha deve ter pelo menos 8 caracteres.");
        return;
      }
    }

    setSalvando(true);
    
    try {
      const token = localStorage.getItem("token");

      // Se tiver senha pra atualizar, chama a API Python
      if (senhaForm.nova && usuario.id) {
        const res = await fetch(`${API_URL}/usuarios/${usuario.id}/senha`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nova_senha: senhaForm.nova })
        });
        if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
        if (!res.ok) throw new Error("Falha ao atualizar senha no servidor");
        setSenhaForm({ nova: "", confirmar: "" }); // Limpa os campos se deu certo
      }

      // Atualiza os dados pessoais (nome e e-mail) no backend
      if (usuario.id) {
        const resDados = await fetch(`${API_URL}/usuarios/${usuario.id}/dados`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nome_completo: usuario.nome_completo,
            email: usuario.email
          })
        });
        if (!resDados.ok) {
          const erroData = await resDados.json();
          throw new Error(erroData.detail || "Falha ao atualizar dados pessoais no servidor");
        }
      }

      // Atualiza os dados do usuário no localStorage caso tenha mudado nome/email
      const usuarioStorage = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
      usuarioStorage.nome_completo = usuario.nome_completo;
      usuarioStorage.email = usuario.email;
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioStorage));
      window.dispatchEvent(new Event("storage"));

      // Salva os novos limites e emite um aviso para atualizar os alertas na hora
      localStorage.setItem("limitesAlertas", JSON.stringify(limites));
      localStorage.setItem("notificacoesPrefs", JSON.stringify(notificacoes));
      window.dispatchEvent(new Event("limitesAtualizados"));

      setSalvando(false);
      setMensagemSalvo(true);
      
      setTimeout(() => setMensagemSalvo(false), 3000);
    } catch (error) {
      setErroSenha("❌ " + error.message);
      setSalvando(false);
    }
  };


  const handleCadastrarSensor = async (e) => {
    e.preventDefault();
    setMensagemSensor("Cadastrando...");

    const idAleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sensorParaTabela = {
      id: `SENS-${idAleatorio}`,
      nome: novoSensor.nome,
      tipo: novoSensor.tipo,
      estufa: novoSensor.estufa_id,
      status: "Sincronizando..." // Status temporário
    };

    try {
      const resposta = await fetch(`${API_URL}/sensores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoSensor)
      });

      if (resposta.ok) {
        setMensagemSensor("✅ Sensor cadastrado com sucesso!");
        
        setSensoresAtivos([sensorParaTabela, ...sensoresAtivos]);
        setNovoSensor({ nome: "", tipo: "", estufa_id: 1 });
        
        setTimeout(() => {
          setSensoresAtivos(prev => prev.map(s => s.id === sensorParaTabela.id ? { ...s, status: "Online" } : s));
        }, 3000);

        setTimeout(() => setMensagemSensor(""), 3000);
      } else {
        setMensagemSensor("❌ Erro ao cadastrar. Verifique o backend.");
      }
    } catch (erro) {
      setMensagemSensor("⚠️ Sensor adicionado offline (Falha no servidor).");
      setSensoresAtivos([sensorParaTabela, ...sensoresAtivos]);
      setTimeout(() => {
        setSensoresAtivos(prev => prev.map(s => s.id === sensorParaTabela.id ? { ...s, status: "Offline" } : s));
      }, 3000);
    }
  };

  if (!usuario.nome_completo) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={{ position: 'relative' }}>
        <Topbar usuario={usuario} />
        
        {/* TOAST DE SUCESSO FLUTUANTE */}
        {mensagemSalvo && (
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#0A2518', color: '#84E034', padding: '12px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, animation: 'fadeInDown 0.3s' }}>
            <CheckCircle2 size={20} /> Configurações salvas com sucesso!
          </div>
        )}

        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#0A2518' }}>Configurações do Sistema</h1>
              <p style={{ color: '#666' }}>Gerencie seu perfil, segurança e parâmetros dos sensores IoT</p>
            </div>
            <button 
              onClick={handleSalvarConfiguracoes}
              disabled={salvando}
              style={{ background: salvando ? '#ccc' : '#84E034', color: '#0A2518', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: salvando ? 'wait' : 'pointer', transition: '0.2s' }}
            >
              {salvando ? <Activity size={20} className="spin-animation" /> : <Save size={20} />} 
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            
            {/* DADOS PESSOAIS */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#84E034" /> Dados Pessoais
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Nome Completo</label>
                  <input type="text" value={usuario.nome_completo} onChange={(e) => setUsuario({...usuario, nome_completo: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>E-mail de Acesso</label>
                  <input type="email" value={usuario.email} onChange={(e) => setUsuario({...usuario, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* LIMITES DE SENSORES */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#84E034" /> Limites dos Sensores (Alertas)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Temp. Máx (°C)</label>
                    <input type="number" value={limites.tempMax} onChange={(e) => setLimites({...limites, tempMax: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Umid. Mín (%)</label>
                    <input type="number" value={limites.umidMin} onChange={(e) => setLimites({...limites, umidMin: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Nível Crítico Nitrogênio (mg/kg)</label>
                  <input type="number" value={limites.nitro} onChange={(e) => setLimites({...limites, nitro: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* NOTIFICAÇÕES */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="#84E034" /> Notificações
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notificacoes.email} onChange={(e) => setNotificacoes({...notificacoes, email: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#0A2518' }} />
                  <span style={{ color: '#555' }}>Receber alertas de sensores por E-mail</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notificacoes.ia} onChange={(e) => setNotificacoes({...notificacoes, ia: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#0A2518' }} />
                  <span style={{ color: '#555' }}>Relatório semanal da Inteligência Artificial</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notificacoes.faturas} onChange={(e) => setNotificacoes({...notificacoes, faturas: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#0A2518' }} />
                  <span style={{ color: '#555' }}>Avisos de faturas e pagamentos</span>
                </label>
              </div>
            </div>

            {/* SEGURANÇA */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#84E034" /> Segurança
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {erroSenha && (
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#D32F2F', background: '#FDEDED', padding: '10px', borderRadius: '8px' }}>
                {erroSenha}
              </div>
            )}
            
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Nova Senha</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={mostrarSenha ? "text" : "password"} value={senhaForm.nova} onChange={(e) => setSenhaForm({...senhaForm, nova: e.target.value})} placeholder="••••••••" style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                <div onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '15px', cursor: 'pointer', color: '#999', display: 'flex' }}>
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Confirmar Nova Senha</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={mostrarConfirmarSenha ? "text" : "password"} value={senhaForm.confirmar} onChange={(e) => setSenhaForm({...senhaForm, confirmar: e.target.value})} placeholder="••••••••" style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                <div onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)} style={{ position: 'absolute', right: '15px', cursor: 'pointer', color: '#999', display: 'flex' }}>
                  {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
                </div>
              </div>
            </div>

            {/* GERENCIAMENTO IoT */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#0A2518', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wifi size={20} color="#84E034" /> Gerenciamento de Dispositivos IoT
                </h3>
              </div>
              
              <form onSubmit={handleCadastrarSensor} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', background: '#fcfcfc', padding: '20px', borderRadius: '12px', border: '1px solid #eee', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Nome do Equipamento</label>
                  <input required type="text" placeholder="Ex: Temp-Sul" value={novoSensor.nome} onChange={(e) => setNovoSensor({...novoSensor, nome: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                </div>
                
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Tipo de Leitura</label>
                  <select required value={novoSensor.tipo} onChange={(e) => setNovoSensor({...novoSensor, tipo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', outline: 'none' }}>
                    <option value="">Selecione o tipo...</option>
                    <option value="Múltiplo">Sensor Múltiplo (LILYGO)</option>
                    <option value="Temperatura Ar">Temperatura Ar</option>
                    <option value="Umidade Ar">Umidade do Ar</option>
                    <option value="Nutriente (N)">Nutriente (Nitrogênio)</option>
                  </select>
                </div>

                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>ID Estufa</label>
                  <input type="number" required value={novoSensor.estufa_id} onChange={(e) => setNovoSensor({...novoSensor, estufa_id: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                </div>

                <button type="submit" style={{ background: '#0A2518', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '40px' }}>
                  <PlusCircle size={18} /> Adicionar
                </button>
              </form>
              
              {mensagemSensor && (
                <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 'bold', color: mensagemSensor.includes('✅') ? '#2E7D32' : '#D32F2F' }}>
                  {mensagemSensor}
                </div>
              )}

              {/* NOVA TABELA DE SENSORES */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#555', fontSize: '14px' }}>Sensores Ativos na Rede</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                        <th style={{ padding: '10px' }}>ID Hardware</th>
                        <th style={{ padding: '10px' }}>Nome</th>
                        <th style={{ padding: '10px' }}>Tipo</th>
                        <th style={{ padding: '10px' }}>Estufa</th>
                        <th style={{ padding: '10px' }}>Status da Conexão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensoresAtivos.map((sensor) => (
                        <tr key={sensor.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#0A2518' }}>{sensor.id}</td>
                          <td style={{ padding: '12px 10px', color: '#555' }}>{sensor.nome}</td>
                          <td style={{ padding: '12px 10px', color: '#555' }}>{sensor.tipo}</td>
                          <td style={{ padding: '12px 10px', color: '#555' }}>Estufa {sensor.estufa}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ 
                              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold',
                              color: sensor.status === 'Online' ? '#2E7D32' : sensor.status === 'Offline' ? '#D32F2F' : '#ED6C02' 
                            }}>
                              <div style={{ 
                                width: '8px', height: '8px', borderRadius: '50%', 
                                background: sensor.status === 'Online' ? '#84E034' : sensor.status === 'Offline' ? '#FF4D4D' : '#FFA000',
                                boxShadow: sensor.status === 'Online' ? '0 0 8px #84E034' : 'none'
                              }}></div>
                              {sensor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      {/* Classe CSS extra para animação de loading caso não exista no seu arquivo */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}