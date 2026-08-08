import { useCallback } from "react";
import { useAudits } from "../AuditContext";

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

const DEFAULT_FILTERS = {
  outlet: "",
  brand: "",
  status: "",
  from: "",
  to: "",
};

export default function Dashboard() {
  const {
    draftFilters,
    setDraftFilters,
    setFilters,
  } = useAudits();

  const handleApplyFilters = useCallback(() => {
    setFilters(draftFilters);
  }, [draftFilters, setFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }, [setDraftFilters, setFilters]);

  return (
    <div className="dashboard">

      <Sidebar />

      <main className="dashboard-content">

        <Header />

        <FilterBar
          filters={draftFilters}
          setFilters={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
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