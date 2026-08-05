import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import KPIGrid from "../components/KPIGrid";
import ChartCard from "../components/ChartCard";
import AlertsPanel from "../components/AlertsPanel";
import Leaderboard from "../components/Leaderboard";
import DepartmentPanel from "../components/DepartmentPanel";
import RecentAudits from "../components/RecentAudits";

import "../dashboard/dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-content">
        <Header />

        <FilterBar />

        <KPIGrid />

        <div className="dashboard-row">
          <ChartCard />

          <AlertsPanel />
        </div>

        <Leaderboard />

        <DepartmentPanel />

        <RecentAudits />
      </main>
    </div>
  );
}