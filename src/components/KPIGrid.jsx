import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Gauge,
} from "lucide-react";

import { useAudits } from "../AuditContext";

export default function KPIGrid() {
  const { analytics } = useAudits();

  if (!analytics) return null;

  const completedAudits = analytics.audits.filter(
    (audit) => audit.status === "completed"
  ).length;

  const openAudits = analytics.totalAudits - completedAudits;

  const cards = [
    {
      title: "Today's Score",
      value: `${analytics.averageScore}%`,
      subtitle: `${analytics.totalAudits} Audits`,
      icon: Gauge,
      color: "#2563eb",
    },
    {
      title: "Open Audits",
      value: openAudits,
      subtitle: `${completedAudits} Completed`,
      icon: ClipboardList,
      color: "#7c3aed",
    },
    {
      title: "Critical Issues",
      value: analytics.failedTasks,
      subtitle: "Failed Checkpoints",
      icon: AlertTriangle,
      color: "#dc2626",
    },
    {
      title: "Completion",
      value: `${analytics.completionPercent}%`,
      subtitle: "Tasks Completed",
      icon: CheckCircle2,
      color: "#16a34a",
    },
    {
      title: "Average Delay",
      value: `${analytics.averageDelay} min`,
      subtitle: "Per Audit",
      icon: ClipboardList,
      color: "#f59e0b",
    },
    {
      title: "Failed Tasks",
      value: analytics.failedTasks,
      subtitle: `${analytics.passPercent}% Pass Rate`,
      icon: AlertTriangle,
      color: "#ef4444",
    },
    {
      title: "Best Outlet",
      value: analytics.bestOutlet || "—",
      subtitle: "Highest Score",
      icon: CheckCircle2,
      color: "#22c55e",
    },
    {
      title: "Lowest Score",
      value: analytics.worstOutlet || "—",
      subtitle: "Needs Attention",
      icon: Gauge,
      color: "#0f766e",
    },
  ];

  return (
    <section className="kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div className="kpi-card" key={card.title}>
            <div
              className="kpi-icon"
              style={{
                background: `${card.color}15`,
                color: card.color,
              }}
            >
              <Icon size={22} />
            </div>

            <div className="kpi-info">
              <h2>{card.value}</h2>
              <p>{card.title}</p>

              <small
                style={{
                  color: "#64748B",
                  fontSize: "12px",
                }}
              >
                {card.subtitle}
              </small>
            </div>
          </div>
        );
      })}
    </section>
  );
}