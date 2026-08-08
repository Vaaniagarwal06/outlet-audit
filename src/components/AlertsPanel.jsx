import {
  AlertTriangle,
  Clock3,
  Trophy,
  Building2,
} from "lucide-react";

import { useMemo } from "react";
import { useAudits } from "../AuditContext";

export default function AlertsPanel() {
  const { analytics } = useAudits();

  if (!analytics) return null;

  const alerts = useMemo(() => {
    const list = [];

    // Critical failures
    if (analytics.failedTasks > 0) {
      list.push({
        icon: AlertTriangle,
        color: "#DC2626",
        title: "Critical Issues",
        message: `${analytics.failedTasks} failed checkpoints need attention.`,
      });
    }

    // Delay alert
    if (analytics.averageDelay > 10) {
      list.push({
        icon: Clock3,
        color: "#F59E0B",
        title: "Average Delay",
        message: `Average delay is ${analytics.averageDelay} minutes.`,
      });
    }

    // Best outlet
    if (analytics.bestOutlet && analytics.bestOutlet !== "—") {
      list.push({
        icon: Trophy,
        color: "#16A34A",
        title: "Top Performing Outlet",
        message: `${analytics.bestOutlet} is leading this period.`,
      });
    }

    // Lowest outlet
    if (analytics.worstOutlet && analytics.worstOutlet !== "—") {
      list.push({
        icon: Building2,
        color: "#2563EB",
        title: "Needs Improvement",
        message: `${analytics.worstOutlet} has the lowest average score.`,
      });
    }
       // Department alerts
       analytics.departments.forEach((department) => {
        if (department.score < 70) {
          list.push({
            icon: AlertTriangle,
            color: "#DC2626",
            title: `${department.name} Performance`,
            message: `${department.name} score has dropped to ${department.score}%.`,
          });
        }
  
        if (department.delays > 5) {
          list.push({
            icon: Clock3,
            color: "#F59E0B",
            title: `${department.name} Delays`,
            message: `${department.delays} delayed checkpoints detected.`,
          });
        }
      });
  
      // No alerts
      if (list.length === 0) {
        list.push({
          icon: Trophy,
          color: "#16A34A",
          title: "Everything Looks Good",
          message: "No operational issues detected.",
        });
      }
  
      return list;
    }, [analytics]);
  
    return (
      <div className="card">
  
        <div className="card-header">
          <h2>Operations Alerts</h2>
        </div>
  
        <div className="alerts-list">
  
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
  
            return (
              <div
                key={index}
                className="alert-item"
              >
                <div
                  className="alert-icon"
                  style={{
                    background: `${alert.color}15`,
                    color: alert.color,
                  }}
                >
                  <Icon size={20} />
                </div>
  
                <div className="alert-content">
  
                  <strong>{alert.title}</strong>
  
                  <p>{alert.message}</p>
  
                </div>
              </div>
            );
          })}
  
        </div> 
        </div>


);
}   