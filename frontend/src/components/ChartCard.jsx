import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ChartCard({ data }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h3 style={{margin:0}}>Resumo da produção</h3>
        <span style={{fontSize:12, color:"var(--muted)"}}>Comparando com o ano passado</span>
      </div>

      <div style={{height: 280, marginTop: 12}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="current" />
            <Bar dataKey="last" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}