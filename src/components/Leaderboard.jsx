import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useAudits } from "../AuditContext";

export default function Leaderboard() {
  const { analytics } = useAudits();

  if (!analytics) return null;

  return (
    <div className="card">

      <div className="card-header">
        <h2>Outlet Leaderboard</h2>

        <Trophy color="#F59E0B" size={22} />
      </div>

      {analytics.outlets.length === 0 ? (
        <p
          style={{
            color: "#64748B",
            padding: "20px",
          }}
        >
          No audits available.
        </p>
      ) : (
        analytics.outlets.map((outlet, index) => (
          <div
            key={outlet.outlet}
            className="leaderboard-row"
          >
            <div className="leaderboard-left">

              <div className="leaderboard-rank">
                #{index + 1}
              </div>

              <div>
                <strong>{outlet.outlet}</strong>

                <p>
                  {outlet.audits} Audit
                  {outlet.audits !== 1 ? "s" : ""}
                </p>
              </div>

            </div>

            <div className="leaderboard-right">

              <span className="leaderboard-score">
                {outlet.score}%
              </span>

              {index === 0 ? (
                <TrendingUp
                  color="#16A34A"
                  size={18}
                />
              ) : (
                <TrendingDown
                  color="#EF4444"
                  size={18}
                />
              )}

            </div>

          </div>
        ))
      )}

    </div>
  );
}