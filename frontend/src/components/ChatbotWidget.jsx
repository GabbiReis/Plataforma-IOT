import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ChatbotWidget() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([
    { autor: "bot", texto: "Olá! Sou a IA do AgriNexus. Como posso ajudar com a sua plantação hoje? 🌱" }
  ]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Novo estado para controlar o login
  
  const fimDoChatRef = useRef(null);
  const location = useLocation();

  // Efeito para verificar o status de login do localStorage
  useEffect(() => {
    const checkLoginStatus = () => {
      const user = localStorage.getItem("usuarioLogado");
      setIsUserLoggedIn(!!user); // Define como true se o usuário existir, false caso contrário
    };

    // Verifica imediatamente ao montar o componente
    checkLoginStatus();

    // Adiciona um listener para o evento 'storage' para reagir a mudanças em outras abas/janelas
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus); // Limpa o listener
  }, []); // Executa apenas uma vez ao montar

  useEffect(() => {
    if (fimDoChatRef.current) {
      fimDoChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [historico, aberto]);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const novaMensagemUsuario = { autor: "usuario", texto: mensagem };
    setHistorico((prev) => [...prev, novaMensagemUsuario]);
    setMensagem("");

    const idDigitando = Date.now();
    setHistorico((prev) => [...prev, { id: idDigitando, autor: "bot", texto: "Pensando..." }]);

    try {
      const resposta = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: novaMensagemUsuario.texto })
      });

      if (!resposta.ok) {
        if (resposta.status === 429) {
          throw new Error("Limite da IA excedido.");
        } else {
          throw new Error("Erro no servidor");
        }
      }

      const dados = await resposta.json();
      
      if (dados.resposta && typeof dados.resposta === 'string' && (dados.resposta.includes("429 RESOURCE_EXHAUSTED") || dados.resposta.includes("Quota exceeded"))) {
        throw new Error("Limite da IA excedido.");
      }

      setHistorico((prev) => 
        prev.filter(msg => msg.id !== idDigitando).concat({ autor: "bot", texto: dados.resposta })
      );

    } catch (erro) {
      const mensagemErro = erro.message.includes("Limite") ? "⚠️ O limite de uso gratuito da IA foi atingido. Por favor, aguarde cerca de 1 minuto." : "❌ Desculpe, não consegui conectar aos servidores da AgriNexus. Verifique se a API Python está rodando.";
      setHistorico((prev) => 
        prev.filter(msg => msg.id !== idDigitando).concat({ 
          autor: "bot", 
          texto: mensagemErro 
        })
      );
    }
  };

  // TRAVA DE SEGURANÇA DUPLA: 
  // 1. Só mostra se o usuário estiver logado no localStorage
  // 2. Esconde o chat forçadamente se estiver nas telas públicas
  const rotasPublicas = ["/", "/login", "/register", "/cadastro", "/esqueci-senha"];
  if (!isUserLoggedIn || rotasPublicas.includes(location.pathname)) return null;

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>
      
      {aberto && (
        <div style={{ 
          width: "350px", height: "500px", background: "white", borderRadius: "16px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column",
          marginBottom: "20px", overflow: "hidden", border: "1px solid #eee"
        }}>
          
          <div style={{ background: "#0A2518", color: "white", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Bot color="#84E034" size={24} />
              <div>
                <strong style={{ display: "block", fontSize: "15px" }}>AgriNexus AI</strong>
                <span style={{ fontSize: "11px", color: "#84E034" }}>Online e monitorando</span>
              </div>
            </div>
            <button onClick={() => setAberto(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, padding: "16px", overflowY: "auto", background: "#f9f9f9", display: "flex", flexDirection: "column", gap: "12px" }}>
            {historico.map((msg, index) => (
              <div key={index} style={{ 
                display: "flex", gap: "8px", alignItems: "flex-end",
                alignSelf: msg.autor === "usuario" ? "flex-end" : "flex-start",
                flexDirection: msg.autor === "usuario" ? "row-reverse" : "row",
                maxWidth: "85%"
              }}>

                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: msg.autor === "usuario" ? "#e0e0e0" : "#84E034", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {msg.autor === "usuario" ? <User size={14} color="#555" /> : <Bot size={14} color="#0A2518" />}
                </div>
                
                <div style={{ 
                  background: msg.autor === "usuario" ? "#0A2518" : "white", 
                  color: msg.autor === "usuario" ? "white" : "#333",
                  padding: "10px 14px", borderRadius: "12px", fontSize: "13px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  borderBottomRightRadius: msg.autor === "usuario" ? "4px" : "12px",
                  borderBottomLeftRadius: msg.autor === "bot" ? "4px" : "12px",
              lineHeight: "1.4"
                }}>
              {msg.autor === "usuario" ? (
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.texto}</div>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p style={{ margin: "0 0 8px 0" }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ margin: "0 0 8px 0", paddingLeft: "20px" }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ margin: "0 0 8px 0", paddingLeft: "20px" }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: "4px" }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ color: "#0A2518", fontWeight: "900" }} {...props} />
                  }}
                >
                  {msg.texto}
                </ReactMarkdown>
              )}
                </div>
              </div>
            ))}
            <div ref={fimDoChatRef} /> 
          </div>

          <form onSubmit={enviarMensagem} style={{ padding: "12px", background: "white", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
            <input 
              type="text" 
              placeholder="Pergunte sobre a plantação..." 
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #ddd", outline: "none", fontSize: "13px" }}
            />
            <button type="submit" style={{ background: "#84E034", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0A2518" }}>
              <Send size={18} style={{ marginLeft: "2px" }} />
            </button>
          </form>
        </div>
      )}

      {!aberto && (
        <button 
          onClick={() => setAberto(true)}
          style={{ 
            width: "60px", height: "60px", borderRadius: "50%", background: "#0A2518", 
            color: "#84E034", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
}