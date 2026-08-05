const outlets = [
  {
    rank: 1,
    name: "Raiganj",
    score: 96,
    trend: "▲"
  },
  {
    rank: 2,
    name: "Malda",
    score: 93,
    trend: "▲"
  },
  {
    rank: 3,
    name: "Cooch Behar",
    score: 88,
    trend: "▼"
  }
];

export default function Leaderboard() {
  return (
    <div className="card">

      <div className="card-header">
        <h2>Outlet Leaderboard</h2>
        <span>This Week</span>
      </div>

      {outlets.map((outlet) => (

        <div className="leaderboard-row" key={outlet.rank}>

          <div className="leaderboard-left">

            <div className="rank-circle">
              {outlet.rank}
            </div>

            <div>

              <strong>{outlet.name}</strong>

              <small>Audit Score</small>

            </div>

          </div>

          <div className="leaderboard-right">

            <span className="score">
              {outlet.score}%
            </span>

            <span
              className={
                outlet.trend === "▲"
                  ? "trend-up"
                  : "trend-down"
              }
            >
              {outlet.trend}
            </span>

          </div>

        </div>

      ))}

    </div>
  );
}