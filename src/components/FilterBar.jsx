export default function FilterBar() {

    return (
  
      <section className="filter-bar">
  
        <div className="filter-group">
  
          <label>Outlet</label>
  
          <select>
            <option>All Outlets</option>
            <option>Malda</option>
            <option>Raiganj</option>
            <option>Cooch Behar</option>
          </select>
  
        </div>
  
        <div className="filter-group">
  
          <label>Brand</label>
  
          <select>
            <option>All Brands</option>
            <option>Desi Kadhai</option>
            <option>Anna's Kitchen</option>
            <option>Little China</option>
            <option>Burg On</option>
            <option>Bake & Shake</option>
          </select>
  
        </div>
  
        <div className="filter-group">
  
          <label>Department</label>
  
          <select>
            <option>All Departments</option>
            <option>Admin</option>
            <option>Cashier</option>
            <option>Kitchen</option>
            <option>Housekeeping</option>
            <option>Security</option>
            <option>Store</option>
            <option>Management</option>
          </select>
  
        </div>
  
        <div className="filter-group">
  
          <label>Status</label>
  
          <select>
            <option>All Status</option>
            <option>Completed</option>
            <option>Delayed</option>
            <option>Failed</option>
            <option>Pending</option>
          </select>
  
        </div>
  
        <div className="filter-group">
  
          <label>From</label>
  
          <input type="date" />
  
        </div>
  
        <div className="filter-group">
  
          <label>To</label>
  
          <input type="date" />
  
        </div>
  
        <button className="primary-btn">
  
          Apply Filters
  
        </button>
  
      </section>
  
    );
  
  }