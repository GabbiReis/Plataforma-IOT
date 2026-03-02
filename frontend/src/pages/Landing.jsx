import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 10%, rgba(99,214,108,0.25), transparent 40%),
        radial-gradient(circle at 80% 30%, rgba(191,243,167,0.22), transparent 45%),
        linear-gradient(180deg, #07160f, #0f2a1f)
      `,
      color: "white",
      display: "grid",
      placeItems: "center",
      padding: 20
    }}>
      <div style={{
        width: "min(1100px, 100%)",
        borderRadius: 28,
        padding: 26,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)"
      }}>
        <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:16}}>
          <div style={{fontWeight:900, letterSpacing:1}}>AgriNexus</div>
          <nav style={{display:"flex", gap:16, opacity:0.9}}>
            <a href="#about">Sobre</a>
            <a href="#features">Informações</a>
            <a href="#contact">Contato</a>
          </nav>
          <Link to="/dashboard" style={{
            padding:"10px 14px",
            borderRadius: 14,
            background:"linear-gradient(135deg, var(--green-300), var(--green-500))",
            color:"#062114",
            fontWeight:800
          }}>
            Abrir Dashboard
          </Link>
        </header>

        <section style={{
          marginTop: 26,
          display:"grid",
          gridTemplateColumns:"1.2fr 0.8fr",
          gap: 18,
          alignItems:"center"
        }}>
          <div>
            <div style={{opacity:0.85, fontWeight:700}}>Plataforma Kubernetes + IoT</div>
            <h1 style={{
              fontSize: 72,
              lineHeight: 0.95,
              margin: "10px 0 10px",
              letterSpacing: -2
            }}>
              AgriNexus
            </h1>
            <p style={{maxWidth:520, opacity:0.9, marginTop:10}}>
              O AgriNexus integra sensores IoT, Kubernetes e observabilidade para monitoramento agrícola em tempo real.
            </p>

            <div style={{display:"flex", gap:12, marginTop:18}}>
              <Link to="/dashboard" style={{
                padding:"12px 16px",
                borderRadius: 16,
                background:"var(--green-500)",
                color:"#062114",
                fontWeight:900
              }}>
                Comece
              </Link>
              <a href="#features" style={{
                padding:"12px 16px",
                borderRadius: 16,
                border:"1px solid rgba(255,255,255,0.18)",
                fontWeight:800
              }}>
                Ver recursos
              </a>
            </div>
          </div>

          {/* Aqui você coloca uma imagem/ilustração ou um “card vídeo” */}
          <div style={{
            height: 320,
            borderRadius: 22,
            border:"1px solid rgba(255,255,255,0.12)",
            background:"rgba(0,0,0,0.20)",
            display:"flex",
            alignItems:"flex-end",
            padding: 14
          }}>
            <div style={{
              width:"100%",
              padding: 14,
              borderRadius: 18,
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.10)"
            }}>
              <div style={{fontWeight:900}}>Demo / Preview</div>
              <div style={{fontSize:12, opacity:0.85, marginTop:6}}>
                Card para vídeo/print do dashboard.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}