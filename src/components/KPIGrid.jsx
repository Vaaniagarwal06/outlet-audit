import { ClipboardList, AlertTriangle, CheckCircle2, Gauge } from "lucide-react";

export default function KPIGrid() {
    const cards = [
        {
          title: "Today's Score",
          value: "92%",
          icon: Gauge,
          color: "#2563eb",
        },
        {
          title: "Open Audits",
          value: "12",
          icon: ClipboardList,
          color: "#7c3aed",
        },
        {
          title: "Critical Issues",
          value: "4",
          icon: AlertTriangle,
          color: "#dc2626",
        },
        {
          title: "Completion",
          value: "86%",
          icon: CheckCircle2,
          color: "#16a34a",
        },
        {
          title: "Average Delay",
          value: "14 min",
          icon: ClipboardList,
          color: "#f59e0b",
        },
        {
          title: "Failed Tasks",
          value: "17",
          icon: AlertTriangle,
          color: "#ef4444",
        },
        {
          title: "Best Outlet",
          value: "Malda",
          icon: CheckCircle2,
          color: "#22c55e",
        },
        {
          title: "Lowest Score",
          value: "Cooch Behar",
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
              style={{ background: `${card.color}15`, color: card.color }}
            >
              <Icon size={22} />
            </div>

            <div className="kpi-info">
              <h2>{card.value}</h2>
              <p>{card.title}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}