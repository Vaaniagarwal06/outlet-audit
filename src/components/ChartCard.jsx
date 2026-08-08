import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { useAudits } from "../AuditContext";

export default function ChartCard() {
  const { analytics } = useAudits();

  if (!analytics) return null;

  const chartData = analytics.scoreTrend.map((item) => ({
    date: item.date,
    score: item.score,
  }));

  return (
    <div className="card">

      <div className="card-header">
        <h2>Audit Score Trend</h2>
      </div>

      {chartData.length === 0 ? (
        <div
          style={{
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748B",
          }}
        >
          No audit data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="date" />

            <YAxis
              domain={[0, 100]}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#14B8A6"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />

          </LineChart>
        </ResponsiveContainer>
      )}

    </div>
  );
}
            