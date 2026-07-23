import { Link, NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <h2>SWAIS-VANIJYA</h2>
        <p className="sidebar-caption">
          SWAIS DEMO Warehouse
        </p>
      </div>

      <ul>

        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/prediction-details"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Prediction Details
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/recommendations"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            AI Recommendations
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/approval"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Replenishment Approval
          </NavLink>
        </li>

        <li>
          <Link to="/tickets">
            Replenishment Tickets
          </Link>
        </li>

        <li>
          <NavLink
            to="/model-performance"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Model Performance
          </NavLink>
        </li>

        <li>
          <Link to="/picking">
            Picking
          </Link>
        </li>

        <li>
          <Link to="/gate-pass">
            Gate Pass
          </Link>
        </li>

        <li>
          <Link to="/receipt">
            Receipt
          </Link>
        </li>

        <li>
          <Link to="/canteen-ledger">
            Canteen Ledger
          </Link>
        </li>

        <li>
          <Link to="/food-tokens">
            Food Tokens
          </Link>
        </li>

        <li>
          <Link to="/next-day-requirements">
            Next Day Requirements
          </Link>
        </li>

        {/* New Products Menu */}
        <li>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Products
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/configuration"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Configuration
          </NavLink>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;