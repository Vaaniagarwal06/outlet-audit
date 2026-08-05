import { Bell, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (

    <header className="dashboard-header">

      <div>

        <span className="dashboard-subtitle">
          GOLPO FOOD COURT
        </span>

        <h1>
          Operations Command Centre
        </h1>

        <p>
          Monitor audits, compliance and outlet performance in real time.
        </p>

      </div>

      <div className="header-actions">

        <div className="search-box">

          <Search size={18}/>

          <input
            placeholder="Search outlet, auditor or brand..."
          />

        </div>

        <button className="icon-button">
          <Bell size={18}/>
        </button>

        <Link to="/new" className="primary-button">

  <Plus size={18} />

  New Audit

</Link>

      </div>

    </header>

  )

}