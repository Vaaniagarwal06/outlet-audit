export default function FilterBar({
  filters,
  setFilters,
  onApply
}) {

  return (

    <section className="filter-bar">

      <div className="filter-group">
        <label>Outlet</label>

        <select
          value={filters.outlet}
          onChange={(e) =>
            setFilters({
              ...filters,
              outlet: e.target.value
            })
          }
        >
          <option value="">All Outlets</option>
          <option value="Malda">Malda</option>
          <option value="Raiganj">Raiganj</option>
          <option value="Cooch Behar">Cooch Behar</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Brand</label>

        <select
          value={filters.brand}
          onChange={(e) =>
            setFilters({
              ...filters,
              brand: e.target.value
            })
          }
        >
          <option value="">All Brands</option>
          <option value="Desi Kadhai">Desi Kadhai</option>
          <option value="Anna's Kitchen">Anna's Kitchen</option>
          <option value="Little China">Little China</option>
          <option value="Burg On">Burg On</option>
          <option value="Bake & Shake">Bake & Shake</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value
            })
          }
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      <div className="filter-group">
        <label>From</label>

        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            setFilters({
              ...filters,
              from: e.target.value
            })
          }
        />
      </div>

      <div className="filter-group">
        <label>To</label>

        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            setFilters({
              ...filters,
              to: e.target.value
            })
          }
        />
      </div>

      <button
        className="primary-btn"
        onClick={onApply}
      >
        Apply Filters
      </button>

    </section>

  );

}
