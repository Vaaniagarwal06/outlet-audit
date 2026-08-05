import { Link } from "react-router-dom";
import { useAudits } from "../AuditContext";

export default function RecentAudits() {
  const { audits } = useAudits();

  if (!audits.length) {
    return (
      <div className="card">
        <h2>Recent Audits</h2>
        <p>No audits created yet.</p>
      </div>
    );
  }

  return (
    <div className="card">

      <details className="recent-audits-dropdown">

        <summary>
          <h2>Recent Audits</h2>
        </summary>

        {audits
          .slice()
          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
          .slice(0, 5)
          .map((audit) => (
            <Link
  key={audit.id}
  to={`/audit/${audit.id}/summary`}
  className="recent-audit"
>
  <div className="recent-left">

    <strong>{audit.outletName}</strong>

    <p>
      {new Date(audit.dateTime).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
      {" • "}
      {new Date(audit.dateTime).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })}
    </p>

  </div>

  <div className="recent-right">

    <span className="audit-score">
      {audit.overallScore}%
    </span>

  </div>

</Link>
          ))}

      </details>

    </div>
  );
}