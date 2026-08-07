import { useState } from "react";

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

  const [filters, setFilters] = useState({
    outlet: "",
    brand: "",
    status: "",
    from: "",
    to: ""
  });

  const handleApplyFilters = () => {
    console.log("Filters Applied:", filters);

    // Next step:
    // We'll call the backend API here
  };

  return (
    <div className="dashboard">

      <Sidebar />

      <main className="dashboard-content">

        <Header />

        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onApply={handleApplyFilters}
        />

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