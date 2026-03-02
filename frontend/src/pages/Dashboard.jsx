import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";

// depois a gente troca por dados da API
const chartData = [
  { name: "Jan", current: 1200, last: 800 },
  { name: "Fev", current: 1700, last: 900 },
  { name: "Mar", current: 2100, last: 1100 },
  { name: "Abr", current: 2600, last: 1500 },
  { name: "Mai", current: 3200, last: 1900 },
  { name: "Jun", current: 3800, last: 2200 },
];

export default function Dashboard() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main" style={{display:"flex", flexDirection:"column", gap:16}}>
        <Topbar />

        <section style={{display:"grid", gridTemplateColumns:"1.1fr 1fr 1fr", gap:16}}>
          <StatCard
            title="🌡 Temperatura Média"
            value="29°C"
            subtitle="Leitura atual"
            right={<div style={{
              width: 64, height: 64, borderRadius: 99,
              background: "radial-gradient(circle, var(--green-300), var(--green-500))"
            }} />}
          />
          <StatCard title="Umidade" value="86%" subtitle="Umidade do solo" />
          <div className="card" style={{
            padding: 16,
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            gap: 16
          }}>
            <div>
              <div style={{fontSize:12, color:"var(--muted)"}}>Crescimento da Planta</div>
              <div style={{fontSize:18, fontWeight:800, marginTop:8}}>Semanalmente</div>
              <div style={{fontSize:12, color:"var(--muted)", marginTop:6}}>Semente → Crescimento → Vegetação</div>
            </div>
            {/* aqui entra a sua ilustração */}
            <div style={{
              width: 120, height: 80, borderRadius: 16,
              background: "rgba(99,214,108,0.18)",
              border: "1px solid var(--border)"
            }}/>
          </div>
        </section>

        <section style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
          <ChartCard data={chartData} />

          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            <div className="card" style={{
              padding: 16,
              height: 200,
              background: "linear-gradient(135deg, rgba(99,214,108,0.22), rgba(15,42,31,0.08))",
              display:"flex",
              justifyContent:"space-between"
            }}>
              <div>
                <div style={{fontWeight:800}}>Fazendas de colheita vertical</div>
                <div style={{fontSize:12, color:"var(--muted)", marginTop:8}}>
                  Card para vídeo/notícia.
                </div>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 99,
                background: "var(--green-500)",
                opacity: 0.9
              }}/>
            </div>

            <div className="card" style={{ padding: 16, height: 200 }}>
              <div style={{fontWeight:800}}>Últimas leituras</div>
              <div style={{fontSize:12, color:"var(--muted)", marginTop:6}}>
                Aqui entra uma listinha (sensor_id + temp + humidity + time).
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}