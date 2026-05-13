import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart2, 
  Leaf, 
  Calendar, 
  CreditCard, 
  Settings, 
  LogOut,
  Plus
} from "lucide-react";

export default function Sidebar() {
  const [fotoFazenda, setFotoFazenda] = useState(null);
  const inputFotoRef = useRef(null);

  useEffect(() => {
    const fotoSalva = localStorage.getItem("fotoFazenda");
    if (fotoSalva) setFotoFazenda(fotoSalva);
  }, []);

  const handleAdicionarFoto = () => {
    inputFotoRef.current.click();
  };

  const handleMudancaFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoFazenda(reader.result);
        localStorage.setItem("fotoFazenda", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="sidebar">
      
      <div className="sidebar-logo">
        <Leaf className="logo-icon" size={28} />
        <span>AgriNexus</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item" end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/analises" className="nav-item">
          <BarChart2 size={20} />
          <span>Análises</span>
        </NavLink>
        <NavLink to="/colheita" className="nav-item">
          <Leaf size={20} />
          <span>Colheita</span>
        </NavLink>
        <NavLink to="/agendamentos" className="nav-item">
          <Calendar size={20} />
          <span>Agendamentos</span>
        </NavLink>
        <NavLink to="/pagamentos" className="nav-item">
          <CreditCard size={20} />
          <span>Pagamentos</span>
        </NavLink>
        <NavLink to="/configuracoes" className="nav-item">
          <Settings size={20} />
          <span>Configurações</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        
        {/* BLOCO DA FOTO DA FAZENDA */}
        <div style={{ background: '#E8F5E9', padding: '16px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}>
          
          {/* Input invisível que faz a magia acontecer */}
          <input 
            type="file" 
            accept="image/*" 
            ref={inputFotoRef} 
            onChange={handleMudancaFoto} 
            style={{ display: 'none' }} 
          />

          {/* O quadrado branco com a folha ou a foto */}
          <div 
            style={{ 
              width: '60px', height: '60px', margin: '0 auto 12px', background: 'white', 
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid #ddd'
            }}
            onClick={handleAdicionarFoto}
          >
            {fotoFazenda ? (
              <img src={fotoFazenda} alt="Fazenda" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Leaf size={24} color="#0A2518" />
            )}
          </div>

          <button 
            onClick={handleAdicionarFoto}
            style={{ background: 'white', border: '1px solid #eee', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: '#0A2518', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', width: '100%', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            {fotoFazenda ? "Trocar Imagem" : "+ Adicionar"}
          </button>
        </div>

        <NavLink to="/login" className="nav-item logout">
          <LogOut size={20} />
          <span>Sair</span>
        </NavLink>
      </div>

    </aside>
  );
}