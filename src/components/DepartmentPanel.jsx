import { useAudits } from "../AuditContext";

export default function DepartmentPanel() {
  const { analytics } = useAudits();

  if (!analytics) return null;

  return (
    <div className="card">

      <details className="department-dropdown" open>

        <summary className="card-header">
          <h2>Department Performance</h2>
        </summary>

        {analytics.departments.length === 0 ? (
          <p
            style={{
              padding: "20px",
              color: "#64748B",
            }}
          >
            No department data available.
          </p>
        ) : (
          analytics.departments.map((department) => (
            <div
              key={department.name}
              className="department-row"
            >

              <div className="department-top">

                <strong>{department.name}</strong>

                <span>{department.score}%</span>

              </div>

              <div className="department-progress">

                <div
                  className="department-progress-fill"
                  style={{
                    width: `${department.score}%`,
                    background:
                      department.score >= 85
                        ? "#16A34A"
                        : department.score >= 70
                        ? "#F59E0B"
                        : "#DC2626",
                  }}
                />

              </div>

              <div className="department-bottom">

                <small>
                  {department.failures} Failed
                </small>

                <small>
                  {department.delays} Delayed
                </small>

              </div>

            </div>
          ))
        )}

      </details>

    </div>
  );
}

