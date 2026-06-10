import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { CreditCard, DollarSign, Download, FileText, Plus, X, Check } from "lucide-react";
import { jsPDF } from "jspdf"; 
import "../styles/dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8000" : "https://backend-production-a8df.up.railway.app");

export default function Pagamentos() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [textoBusca, setTextoBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({
    desc: "",
    data: "",
    valor: "",
    status: "Em Aberto"
  });

  const [faturas, setFaturas] = useState([]);

  useEffect(() => {
    const userLogado = localStorage.getItem("usuarioLogado");
    const token = localStorage.getItem("token");
    
    if (!userLogado || !token) navigate("/login");
    else {
      const user = JSON.parse(userLogado);
      setUsuario(user);
      fetch(`${API_URL}/faturas/${user.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401) throw new Error("Sessão expirada");
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) setFaturas(data);
        })
        .catch(err => console.error("Erro ao buscar faturas:", err));
    }
  }, [navigate]);

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalGasto = faturas
    .filter(f => f.status === "Pago")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalAberto = faturas
    .filter(f => f.status === "Em Aberto")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const salvarNovaDespesa = async (e) => {
    e.preventDefault();
    const idAleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const dataFormatada = novaDespesa.data.split('-').reverse().join('/');

    const despesaParaSalvar = {
      id: `FAT-2026-${idAleatorio}`,
      desc: novaDespesa.desc,
      data: dataFormatada,
      valor: parseFloat(novaDespesa.valor.replace(',', '.')), // Converte texto para número
      status: novaDespesa.status
    };
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/faturas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fatura_id: despesaParaSalvar.id,
          desc: despesaParaSalvar.desc,
          data: despesaParaSalvar.data,
          valor: despesaParaSalvar.valor,
          status: despesaParaSalvar.status,
          usuario_id: usuario.id
        })
      });
      
      if (res.ok) {
        setFaturas([despesaParaSalvar, ...faturas]);
        setNovaDespesa({ desc: "", data: "", valor: "", status: "Em Aberto" });
        setModalAberto(false);
      }
    } catch (error) {
      console.error("Erro ao salvar fatura:", error);
    }
  };

  const pagarFatura = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/faturas/${id}/pagar`, { 
        method: 'PUT',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const faturasAtualizadas = faturas.map(f => 
          f.id === id ? { ...f, status: "Pago" } : f
        );
        setFaturas(faturasAtualizadas);
      }
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
    }
  };

  const baixarRecibo = (fatura) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(10, 37, 24);
    doc.text("AgriNexus - Recibo de Fatura", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Fatura ID: ${fatura.id}`, 20, 40);
    doc.text(`Descrição: ${fatura.desc}`, 20, 50);
    doc.text(`Data de Vencimento/Pagamento: ${fatura.data}`, 20, 60);
    doc.text(`Valor: ${formatarMoeda(fatura.valor)}`, 20, 70);
    doc.text(`Status: ${fatura.status}`, 20, 80);
    
    doc.text("---------------------------------------------------------", 20, 100);
    doc.text(`Emitido por: ${usuario?.nome_completo || 'Sistema'}`, 20, 110);
    
    doc.save(`${fatura.id}_Recibo.pdf`);
  };

  const faturasFiltradas = faturas.filter((f) => {
    const termo = textoBusca.toLowerCase();
    return (
      f.id.toLowerCase().includes(termo) ||
      f.desc.toLowerCase().includes(termo) ||
      f.status.toLowerCase().includes(termo)
    );
  });

  if (!usuario) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar usuario={usuario} onSearch={setTextoBusca} />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#0A2518' }}>Gestão Financeira</h1>
              <p style={{ color: '#666' }}>Acompanhe suas assinaturas e custos operacionais</p>
            </div>
            <button 
              onClick={() => setModalAberto(true)}
              style={{ background: '#0A2518', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.1s' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Plus size={20} /> Registrar Nova Despesa
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
            {/* CARTÃO DINÂMICO 1 */}
            <div style={{ flex: 1, minWidth: '250px', background: 'linear-gradient(135deg, #84E034 0%, #5DB020 100%)', padding: '24px', borderRadius: '16px', color: '#0A2518', boxShadow: '0 4px 15px rgba(132, 224, 52, 0.2)' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>Faturas em Aberto (Pagar)</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {formatarMoeda(totalAberto)}
              </div>
              <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.9 }}>Valor total pendente</div>
            </div>

            <div style={{ flex: 1, minWidth: '250px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Total Gasto Acumulado (Pago)</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0A2518', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign size={32} color="#0A2518" /> {formatarMoeda(totalGasto)}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0A2518' }}>Histórico de Faturas</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                    <th style={{ padding: '12px 8px' }}>Fatura</th>
                    <th style={{ padding: '12px 8px' }}>Descrição</th>
                    <th style={{ padding: '12px 8px' }}>Data</th>
                    <th style={{ padding: '12px 8px' }}>Valor</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {faturasFiltradas.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee', transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 8px', fontWeight: 'bold', color: '#555' }}><FileText size={16} style={{marginRight: '6px', verticalAlign: 'middle'}}/>{f.id}</td>
                      <td style={{ padding: '16px 8px', color: '#0A2518' }}>{f.desc}</td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>{f.data}</td>
                      <td style={{ padding: '16px 8px', fontWeight: 'bold', color: '#0A2518' }}>{formatarMoeda(f.valor)}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                          backgroundColor: f.status === 'Pago' ? '#E8F8E0' : '#FFF4E5',
                          color: f.status === 'Pago' ? '#2E7D32' : '#ED6C02'
                        }}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        
                        {f.status === 'Em Aberto' && (
                          <button 
                            onClick={() => pagarFatura(f.id)}
                            style={{ background: '#84E034', border: 'none', color: '#0A2518', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }} 
                            title="Marcar como Pago"
                          >
                            <Check size={16} /> Pagar
                          </button>
                        )}

                        {/* Botão de Download PDF */}
                        <button 
                          onClick={() => baixarRecibo(f)}
                          style={{ background: '#f5f5f5', border: '1px solid #ddd', color: '#666', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} 
                          title="Baixar Recibo PDF"
                        >
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {faturasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                        Nenhuma fatura encontrada com "{textoBusca}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL DE NOVA DESPESA ================= */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0A2518' }}>Registrar Nova Despesa</h2>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={salvarNovaDespesa} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Descrição da Despesa</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: Compra de Fertilizantes"
                  value={novaDespesa.desc}
                  onChange={(e) => setNovaDespesa({...novaDespesa, desc: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Valor (R$)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    placeholder="Ex: 150.00"
                    value={novaDespesa.valor}
                    onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Vencimento/Data</label>
                  <input 
                    required 
                    type="date" 
                    value={novaDespesa.data}
                    onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                <select 
                  required 
                  value={novaDespesa.status}
                  onChange={(e) => setNovaDespesa({...novaDespesa, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white' }} 
                >
                  <option value="Em Aberto">⚠️ Em Aberto (A pagar)</option>
                  <option value="Pago">✅ Pago</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#333', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0A2518', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  Adicionar Despesa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}