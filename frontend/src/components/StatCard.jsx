export default function StatCard({ title, value, subtitle, right }) {
  return (
    <div className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{fontSize:12, color:"var(--muted)"}}>{title}</div>
        <div style={{fontSize:28, fontWeight:800, marginTop:6}}>{value}</div>
        <div style={{fontSize:12, color:"var(--muted)", marginTop:6}}>{subtitle}</div>
      </div>
      <div style={{display:"flex", alignItems:"center"}}>{right}</div>
    </div>
  );
}