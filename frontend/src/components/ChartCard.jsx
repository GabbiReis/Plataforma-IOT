import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "JAN", current: 800, last: 300 },
  { name: "FEV", current: 1200, last: 600 },
  { name: "MAR", current: 1500, last: 900 },
  { name: "ABR", current: 2100, last: 1400 },
  { name: "MAI", current: 2800, last: 1800 },
  { name: "JUN", current: 3600, last: 2200 },
  { name: "JUL", current: 3800, last: 2400 },
  { name: "AGO", current: 3400, last: 2100 },
  { name: "SET", current: 2600, last: 1700 },
  { name: "OUT", current: 1900, last: 1200 },
  { name: "NOV", current: 1300, last: 800 },
  { name: "DEZ", current: 900, last: 400 },
];

export default function ChartCard({ customData, labelAtual = "Ano Atual", labelAnterior = "Ano Anterior", corAtual = "#84E034", corAnterior = "#0A2518" }) {
  const chartData = customData || data;

  return (
    <div style={{ width: "100%", height: "250px", marginTop: "20px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} 
            dy={10} 
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#6B7280' }} 
          />
          
          <Tooltip 
            cursor={{ fill: 'rgba(132, 224, 52, 0.1)' }} 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          />

          <Bar 
            dataKey="last" 
            name={labelAnterior} 
            fill={corAnterior} 
            radius={[4, 4, 0, 0]} 
            barSize={12} 
          />
          
          <Bar 
            dataKey="current" 
            name={labelAtual} 
            fill={corAtual} 
            radius={[4, 4, 0, 0]} 
            barSize={12} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}