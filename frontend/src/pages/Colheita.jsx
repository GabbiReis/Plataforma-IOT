import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Leaf, Calendar, CheckCircle, Clock, Plus, FileDown, X } from "lucide-react";
import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";
import "../styles/dashboard.css";

export default function Colheita() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [textoBusca, setTextoBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [novaPlantacao, setNovaPlantacao] = useState({
    cultura: "",
    setor: "",
    plantio: "",
    previsao: "",
    quantidade: "",
    status: "Crescendo"
  });

  const [colheitas, setColheitas] = useState([
    { id: 1, cultura: "Alface Crespa", setor: "Fazenda Vertical 01", plantio: "15/02/2026", previsao: "28/03/2026", status: "Pronto", quantidade: "500 pés" },
    { id: 2, cultura: "Tomate Cereja", setor: "Estufa Leste", plantio: "05/01/2026", previsao: "15/04/2026", status: "Crescendo", quantidade: "120 kg" },
    { id: 3, cultura: "Morango", setor: "Fazenda Vertical 01", plantio: "10/01/2026", previsao: "10/04/2026", status: "Crescendo", quantidade: "80 kg" },
    { id: 4, cultura: "Manjericão", setor: "Estufa Leste", plantio: "01/03/2026", previsao: "25/03/2026", status: "Colhido", quantidade: "300 maços" }
  ]);

  useEffect(() => {
    const userLogado = localStorage.getItem("usuarioLogado");
    if (!userLogado) navigate("/login");
    else setUsuario(JSON.parse(userLogado));
  }, [navigate]);

  const salvarNovaPlantacao = (e) => {
    e.preventDefault(); 
    
    const plantacaoParaSalvar = {
      id: Date.now(),
      ...novaPlantacao
    };
    
    setColheitas([plantacaoParaSalvar, ...colheitas]);
    
    setNovaPlantacao({ cultura: "", setor: "", plantio: "", previsao: "", quantidade: "", status: "Crescendo" });
    setModalAberto(false);
  };

  const colheitasFiltradas = colheitas.filter((item) => {
    const termo = textoBusca.toLowerCase();
    return (
      item.cultura.toLowerCase().includes(termo) ||
      item.setor.toLowerCase().includes(termo) ||
      item.status.toLowerCase().includes(termo)
    );
  });

  const qtdCrescendo = colheitas.filter(c => c.status === "Crescendo").length;
  const qtdPronto = colheitas.filter(c => c.status === "Pronto").length;
  const qtdColhido = colheitas.filter(c => c.status === "Colhido").length;

  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(10, 37, 24);
    doc.text("AgriNexus - Relatório de Safra", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataHoje} | Usuário: ${usuario?.nome_completo || 'Sistema'}`, 14, 28);
    
    const colunas = ["Cultura", "Setor", "Data Plantio", "Previsão", "Quantidade", "Status"];
    const linhas = colheitasFiltradas.map(item => [item.cultura, item.setor, item.plantio, item.previsao, item.quantidade, item.status]);

    autoTable(doc, {
      startY: 35, head: [colunas], body: linhas, theme: 'grid',
      headStyles: { fillColor: [132, 224, 52], textColor: [10, 37, 24], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`Relatorio_Colheita_${dataHoje.replace(/\//g, '-')}.pdf`);
  };

  if (!usuario) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar usuario={usuario} onSearch={setTextoBusca} />

        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#0A2518' }}>Gestão de Colheitas</h1>
              <p style={{ color: '#666' }}>Acompanhe o ciclo de vida das suas plantações</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={gerarPDF} style={{ background: 'white', color: '#0A2518', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <FileDown size={20} /> Baixar Relatório PDF
              </button>

              <button 
                onClick={() => setModalAberto(true)} 
                style={{ background: '#84E034', color: '#0A2518', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.1s' }}
              >
                <Plus size={20} /> Nova Plantação
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #0A2518', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Em Crescimento</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={28} color="#0A2518" /> {qtdCrescendo} {qtdCrescendo === 1 ? 'Lote' : 'Lotes'}
              </div>
            </div>
            <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #84E034', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Pronto para Colher</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={28} color="#84E034" /> {qtdPronto} {qtdPronto === 1 ? 'Lote' : 'Lotes'}
              </div>
            </div>
            <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #ccc', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Já Colhidos (Mês)</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Leaf size={28} color="#ccc" /> {qtdColhido} {qtdColhido === 1 ? 'Lote' : 'Lotes'}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0A2518' }}>Lotes Ativos</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                    <th style={{ padding: '12px 8px' }}>Cultura</th>
                    <th style={{ padding: '12px 8px' }}>Local</th>
                    <th style={{ padding: '12px 8px' }}>Data Plantio</th>
                    <th style={{ padding: '12px 8px' }}>Previsão</th>
                    <th style={{ padding: '12px 8px' }}>Quantidade Estimada</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {colheitasFiltradas.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '16px 8px', fontWeight: 'bold', color: '#0A2518' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Leaf size={16} color="#84E034" /> {item.cultura}</div>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>{item.setor}</td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {item.plantio}</div>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>{item.previsao}</td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>{item.quantidade}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                          backgroundColor: item.status === 'Pronto' ? '#E8F8E0' : item.status === 'Crescendo' ? '#FFF4E5' : '#F0F0F0',
                          color: item.status === 'Pronto' ? '#2E7D32' : item.status === 'Crescendo' ? '#ED6C02' : '#666'
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {colheitasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Nenhuma colheita encontrada para "{textoBusca}"</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL DE NOVA PLANTAÇÃO ================= */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0A2518' }}>Registrar Nova Plantação</h2>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={salvarNovaPlantacao} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Cultura (Ex: Tomate, Alface)</label>
                <input 
                  required 
                  type="text" 
                  value={novaPlantacao.cultura}
                  onChange={(e) => setNovaPlantacao({...novaPlantacao, cultura: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Setor / Local</label>
                <input 
                  required 
                  type="text" 
                  value={novaPlantacao.setor}
                  onChange={(e) => setNovaPlantacao({...novaPlantacao, setor: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Data de Plantio</label>
                  <input 
                    required 
                    type="date" 
                    value={novaPlantacao.plantio}
                    onChange={(e) => setNovaPlantacao({...novaPlantacao, plantio: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Previsão de Colheita</label>
                  <input 
                    required 
                    type="date" 
                    value={novaPlantacao.previsao}
                    onChange={(e) => setNovaPlantacao({...novaPlantacao, previsao: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                  />
                </div>
              </div>

              {/* ===== NOVA LINHA DIVIDIDA: QUANTIDADE E STATUS ===== */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Qtd. Estimada</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: 50 kg"
                    value={novaPlantacao.quantidade}
                    onChange={(e) => setNovaPlantacao({...novaPlantacao, quantidade: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Status Inicial</label>
                  <select 
                    required 
                    value={novaPlantacao.status}
                    onChange={(e) => setNovaPlantacao({...novaPlantacao, status: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white', cursor: 'pointer' }} 
                  >
                    <option value="Crescendo">🌱 Crescendo</option>
                    <option value="Pronto">✅ Pronto</option>
                    <option value="Colhido">📦 Colhido</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#333', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#84E034', color: '#0A2518', cursor: 'pointer', fontWeight: 'bold' }}>
                  Salvar Plantação
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}