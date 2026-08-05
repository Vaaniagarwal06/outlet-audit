const departments = [
  {
    name: "Kitchen",
    score: 94,
    issues: 2,
  },
  {
    name: "Housekeeping",
    score: 91,
    issues: 3,
  },
  {
    name: "Cashier",
    score: 97,
    issues: 1,
  },
  {
    name: "Admin",
    score: 88,
    issues: 5,
  },
  {
    name: "Store",
    score: 90,
    issues: 2,
  },
  {
    name: "Security",
    score: 96,
    issues: 0,
  },
];

export default function DepartmentPanel() {
    return (
        <div className="card">
      
          <details className="department-dropdown">
      
            <summary>
      
              <div className="card-header">
      
                <h2>Department Performance</h2>
      
                <span>This Week</span>
      
              </div>
      
            </summary>
      
            {departments.map((dept) => (
      
              <div className="department-row" key={dept.name}>
      
                <div className="department-info">
      
                  <strong>{dept.name}</strong>
      
                  <small>{dept.issues} issues</small>
      
                </div>
      
                <div className="department-score">
      
                  {dept.score}%
      
                </div>
      
              </div>
      
            ))}
      
          </details>
      
        </div>
      );
    }
    