import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
  } from "recharts";
  import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../pages/analytics.css";
const outletData = [
    {
      outlet: "Malda",
      score: 96
    },
    {
      outlet: "Raiganj",
      score: 93
    },
    {
      outlet: "Cooch Behar",
      score: 88
    }
  ];
export default function Leaderboard() {
  return (
    <div className="dashboard">

      <Sidebar />

      <main className="dashboard-content">

        <Header />

        <div className="analytics-page">

          <div className="analytics-header">

            <small>GOLPO FOOD COURT</small>

            <h1>Outlet Performance Leaderboard</h1>

            <p>
              Compare outlet rankings, department performance and operational excellence.
            </p>

          </div>

          <div className="leaderboard-filters">

            <select>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
            </select>

            <select>
              <option>All Outlets</option>
              <option>Malda</option>
              <option>Raiganj</option>
              <option>Cooch Behar</option>
            </select>

            <select>
              <option>All Brands</option>
              <option>Desi Kadai</option>
              <option>Anna's Kitchen</option>
              <option>Bruway</option>
              <option>Bake & Shake</option>
              <option>Little China</option>
            </select>

            <select>
              <option>All Departments</option>
              <option>Kitchen</option>
              <option>Cashier</option>
              <option>Housekeeping</option>
              <option>Store</option>
              <option>Security</option>
              <option>Admin</option>
            </select>

          </div>

          <div className="leaderboard-kpis">

            <div className="leader-card">
              <span>Highest Score</span>
              <h2>96%</h2>
              <p>Malda</p>
            </div>

            <div className="leader-card">
              <span>Lowest Delay</span>
              <h2>4 min</h2>
              <p>Raiganj</p>
            </div>

            <div className="leader-card">
              <span>Best Department</span>
              <h2>Security</h2>
              <p>97%</p>
            </div>

            <div className="leader-card">
              <span>Total Audits</span>
              <h2>48</h2>
              <p>This Month</p>
            </div>

          </div>

          <div className="leaderboard-grid">
          <div className="leaderboard-card">

  <h2>Department Comparison</h2>

  <ResponsiveContainer width="100%" height={320}>

    <BarChart
      data={[
        { department: "Kitchen", score: 95 },
        { department: "Cashier", score: 91 },
        { department: "Housekeeping", score: 87 },
        { department: "Store", score: 90 },
        { department: "Security", score: 97 }
      ]}
    >

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="department" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="score"
        fill="#14B8A6"
        radius={[8,8,0,0]}
      />

    </BarChart>

  </ResponsiveContainer>

</div>

            <div className="leaderboard-card">

              <h2>Outlet Performance</h2>

              <ResponsiveContainer
  width="100%"
  height={320}
>

  <BarChart
    data={outletData}
    layout="vertical"
    margin={{
      left: 20,
      right: 20
    }}
  >

    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#E5E7EB"
    />

    <XAxis
      type="number"
      domain={[0,100]}
    />

    <YAxis
      dataKey="outlet"
      type="category"
    />

    <Tooltip />

    <Bar
      dataKey="score"
      fill="#14B8A6"
      radius={[10,10,10,10]}
    />

  </BarChart>

</ResponsiveContainer>

            </div>

            <div className="leaderboard-card">

              <h2>Top Ranked Outlets</h2>

              <table className="ranking-table">

                <thead>

                  <tr>

                    <th>Rank</th>

                    <th>Outlet</th>

                    <th>Score</th>

                    <th>Trend</th>

                  </tr>

                </thead>

                <tbody>

<tr>
  <td>🥇</td>
  <td>Malda</td>
  <td>96%</td>
  <td>▲ +2%</td>
</tr>

<tr>
  <td>🥈</td>
  <td>Raiganj</td>
  <td>94%</td>
  <td>▲ +1%</td>
</tr>

<tr>
  <td>🥉</td>
  <td>Cooch Behar</td>
  <td>89%</td>
  <td>▼ -1%</td>
</tr>

</tbody> 
</table>

</div>   {/* leaderboard-card */}  
<div className="leaderboard-card">

  <h2>Department Performance</h2>

  <div className="chart-placeholder">
    Department Performance Chart
  </div>

</div>   
</div>   {/* leaderboard-grid */}    
</div> {/* analytics-page */}

</main>

</div>
);
}