export default function Topbar() {
  return (
    <div className="card" style={{
      padding: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }}>
      <div style={{flex: 1}}>
        <input
          placeholder="Buscar sensor..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid var(--border)",
            outline: "none"
          }}
        />
      </div>

      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:700, lineHeight:1}}>Administrador</div>
          <div style={{fontSize:12, color:"var(--muted)"}}>Fazenda Inteligente</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 99,
          background: "linear-gradient(135deg, var(--green-300), var(--green-500))"
        }} />
      </div>
    </div>
  );
}