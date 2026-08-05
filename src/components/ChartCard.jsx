import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } from "recharts";
  
  const data = [
    { day: "Mon", score: 86 },
    { day: "Tue", score: 91 },
    { day: "Wed", score: 88 },
    { day: "Thu", score: 95 },
    { day: "Fri", score: 92 },
    { day: "Sat", score: 97 },
    { day: "Sun", score: 94 },
  ];
  
  export default function ChartCard() {
    return (
      <div className="card">
  
        <div className="card-header">
          <h2>Performance Trend</h2>
          <span>This Week</span>
        </div>
  
        <ResponsiveContainer width="100%" height={320}>
  
          <LineChart data={data}>
  
            <CartesianGrid strokeDasharray="3 3" />
  
            <XAxis dataKey="day" />
  
            <YAxis domain={[70,100]} />
  
            <Tooltip />
  
            <Line
              type="monotone"
              dataKey="score"
              stroke="#166534"
              strokeWidth={3}
            />
  
          </LineChart>
  
        </ResponsiveContainer>
  
      </div>
    );
  }