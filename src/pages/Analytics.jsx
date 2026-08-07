import { useState } from "react";
import { useAudits } from "../AuditContext";
import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import KPIGrid from "../components/KPIGrid";
import ChartCard from "../components/ChartCard";
import DepartmentPanel from "../components/DepartmentPanel";
import Leaderboard from "../components/Leaderboard";
import RecentAudits from "../components/RecentAudits";
import AlertsPanel from "../components/AlertsPanel";

import "./analytics.css";
export default function Analytics() {

  const [view, setView] = useState("weekly");
  const { filters, setFilters } = useAudits();

  return (

    <div className="analytics-page">

      <div className="analytics-header">

        <small>GOLPO FOOD COURT</small>

        <h1>Analytics Centre</h1>

        <p>
          Monitor operational performance across every outlet,
          department and brand.
        </p>

      </div>

      <div className="analytics-tabs">

        <button
          className={view==="daily" ? "active" : ""}
          onClick={()=>setView("daily")}
        >
          Daily
        </button>

        <button
          className={view==="weekly" ? "active" : ""}
          onClick={()=>setView("weekly")}
        >
          Weekly
        </button>

        <button
          className={view==="monthly" ? "active" : ""}
          onClick={()=>setView("monthly")}
        >
          Monthly
        </button>

        <button
          className={view==="custom" ? "active" : ""}
          onClick={()=>setView("custom")}
        >
          Custom
        </button>

      </div>

      <FilterBar
  filters={filters}
  setFilters={setFilters}
  onApply={() => {}}
/>

<KPIGrid />

<div className="analytics-grid">

  <div className="analytics-left">

    <ChartCard />

    <DepartmentPanel />

    <RecentAudits />

  </div>

  <div className="analytics-right">

    <Leaderboard />

    <AlertsPanel />

  </div>

</div>
</div>

  );

}
         