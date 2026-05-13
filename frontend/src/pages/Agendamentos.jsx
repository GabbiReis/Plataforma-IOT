import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import "../styles/dashboard.css";

export default function Agendamentos() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  const [textoBusca, setTextoBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: "",
    horario: "",
    tipo: "Rotina",
    responsavel: ""
  });

  const [tarefas, setTarefas] = useState([
    { id: 1, titulo: "Irrigação Setor Leste", horario: "08:00", tipo: "Rotina", status: "Concluído", responsavel: "Sistema Automático" },
    { id: 2, titulo: "Aplicação de Nutrientes (NPK)", horario: "14:30", tipo: "Manejo", status: "Pendente", responsavel: "Operador" },
    { id: 3, titulo: "Calibração de Sensores", horario: "16:00", tipo: "Manutenção", status: "Pendente", responsavel: "Técnico" },
    { id: 4, titulo: "Inspeção de Pragas", horario: "17:00", tipo: "Prevenção", status: "Atrasado", responsavel: "Agrônomo" }
  ]);

  useEffect(() => {
    const userLogado = localStorage.getItem("usuarioLogado");
    if (!userLogado) navigate("/login");
    else setUsuario(JSON.parse(userLogado));
  }, [navigate]);

  const salvarNovaTarefa = (e) => {
    e.preventDefault();
    
    const tarefaParaSalvar = {
      id: Date.now(),
      ...novaTarefa,
      status: "Pendente"
    };
    
    setTarefas([...tarefas, tarefaParaSalvar]);
    
    setNovaTarefa({ titulo: "", horario: "", tipo: "Rotina", responsavel: "" });
    setModalAberto(false);
  };

  const tarefasFiltradas = tarefas.filter((t) => {
    const termo = textoBusca.toLowerCase();
    return (
      t.titulo.toLowerCase().includes(termo) ||
      t.tipo.toLowerCase().includes(termo) ||
      t.status.toLowerCase().includes(termo) ||
      t.responsavel.toLowerCase().includes(termo)
    );
  });

  const totalTarefas = tarefas.length;
  const qtdPendentes = tarefas.filter(t => t.status === "Pendente").length;
  const qtdAtrasadas = tarefas.filter(t => t.status === "Atrasado").length;

  if (!usuario) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar usuario={usuario} onSearch={setTextoBusca} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#0A2518' }}>Agendamentos e Tarefas</h1>
              <p style={{ color: '#666' }}>Gerencie as atividades e manutenções da sua estufa</p>
            </div>
            <button 
              onClick={() => setModalAberto(true)}
              style={{ background: '#84E034', color: '#0A2518', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.1s' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Plus size={20} /> Nova Tarefa
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', background: 'white', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #0A2518', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Total de Tarefas Hoje</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarIcon size={28} color="#0A2518" /> {totalTarefas}
              </div>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px', background: 'white', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #ED6C02', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Pendentes</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ED6C02', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={28} color="#ED6C02" /> {qtdPendentes}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px', background: 'white', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #D32F2F', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Atrasadas</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={28} color="#D32F2F" /> {qtdAtrasadas}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0A2518' }}>Cronograma do Dia</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                    <th style={{ padding: '12px 8px' }}>Horário</th>
                    <th style={{ padding: '12px 8px' }}>Atividade</th>
                    <th style={{ padding: '12px 8px' }}>Tipo</th>
                    <th style={{ padding: '12px 8px' }}>Responsável</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tarefasFiltradas.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '16px 8px', fontWeight: 'bold', color: '#555' }}>{t.horario}</td>
                      <td style={{ padding: '16px 8px', color: '#0A2518', fontWeight: '500' }}>{t.titulo}</td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>
                         <span style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{t.tipo}</span>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>{t.responsavel}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                          backgroundColor: t.status === 'Concluído' ? '#E8F8E0' : t.status === 'Pendente' ? '#FFF4E5' : '#FDEDED',
                          color: t.status === 'Concluído' ? '#2E7D32' : t.status === 'Pendente' ? '#ED6C02' : '#D32F2F'
                        }}>
                          {t.status === 'Concluído' ? <CheckCircle2 size={14}/> : t.status === 'Pendente' ? <Clock size={14}/> : <AlertCircle size={14}/>}
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {tarefasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                        Nenhuma tarefa encontrada para "{textoBusca}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL DE NOVA TAREFA ================= */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0A2518' }}>Nova Tarefa</h2>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={salvarNovaTarefa} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Título da Atividade</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: Verificar Válvula 3"
                  value={novaTarefa.titulo}
                  onChange={(e) => setNovaTarefa({...novaTarefa, titulo: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Horário</label>
                  <input 
                    required 
                    type="time" 
                    value={novaTarefa.horario}
                    onChange={(e) => setNovaTarefa({...novaTarefa, horario: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Tipo</label>
                  <select 
                    required 
                    value={novaTarefa.tipo}
                    onChange={(e) => setNovaTarefa({...novaTarefa, tipo: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white' }} 
                  >
                    <option value="Rotina">Rotina</option>
                    <option value="Manejo">Manejo</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Prevenção">Prevenção</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Responsável</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: João, Técnico, Sistema"
                  value={novaTarefa.responsavel}
                  onChange={(e) => setNovaTarefa({...novaTarefa, responsavel: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#333', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#84E034', color: '#0A2518', cursor: 'pointer', fontWeight: 'bold' }}>
                  Adicionar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}