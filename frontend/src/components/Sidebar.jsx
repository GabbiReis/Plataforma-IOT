import { Link, useLocation } from "react-router-dom";

const itens = [
  { label: "Painel", to: "/dashboard" },
  { label: "Análises", to: "/dashboard?tab=analises" },
  { label: "Sensores", to: "/dashboard?tab=sensores" },
  { label: "Agendamentos", to: "/dashboard?tab=agenda" },
  { label: "Configurações", to: "/dashboard?tab=config" },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside style={{
      background:
        "linear-gradient(180deg, var(--green-900), var(--green-800))",
      color: "white",
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 18
    }}>
      <div style={{ fontWeight: 800 }}>
        🌱 AgriNexus
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {itens.map((item) => {
          const ativo = pathname === item.to;

          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: ativo
                  ? "rgba(255,255,255,0.15)"
                  : "transparent"
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }} />

      <Link to="/">← Página Inicial</Link>
    </aside>
  );
}