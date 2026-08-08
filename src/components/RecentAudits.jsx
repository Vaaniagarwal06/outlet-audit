import { Link } from "react-router-dom";
import { useAudits } from "../AuditContext";

export default function RecentAudits() {
  const { filteredAudits } = useAudits();

  const recentAudits = [...filteredAudits]
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    .slice(0, 5);

  return (
    <div className="card">
      <details className="recent-audits-dropdown" open>

        <summary>
          <h2>Recent Audits</h2>
        </summary>

        {recentAudits.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#64748B",
            }}
          >
            No audits found.
          </div>
        ) : (
          recentAudits.map((audit) => (
            <Link
              key={audit.id}
              to={`/audit/${audit.id}/summary`}
              className="recent-audit"
            >
              <div className="recent-left">

                <strong>{audit.outletName}</strong>

                <p>
                  {audit.brand}
                  {" • "}
                  {new Date(audit.dateTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <small
                  style={{
                    color: "#64748B",
                  }}
                >
                  {audit.auditorName}
                </small>

              </div>

              <div
                className="recent-right"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                <span className="audit-score">
                  {audit.overallScore}%
                </span>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background:
                      audit.status === "completed"
                        ? "#DCFCE7"
                        : "#FEF3C7",
                    color:
                      audit.status === "completed"
                        ? "#15803D"
                        : "#B45309",
                  }}
                >
                  {audit.status === "completed"
                    ? "Completed"
                    : "In Progress"}
                </span>
              </div>
            </Link>
          ))
        )}

      </details>
    </div>
  );
}