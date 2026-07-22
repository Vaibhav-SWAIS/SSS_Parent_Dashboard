import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import PredictionDetails from "./pages/PredictionDetails";
import RecommendationCenter from "./pages/RecommendationCenter";
import ReplenishmentApproval from "./pages/ReplenishmentApproval";
import ModelPerformance from "./pages/ModelPerformance";
import Configuration from "./pages/Configuration";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Inventory from "./pages/Inventory";
import ReplenishmentTicket from "./pages/ReplenishmentTicket";
import Picking from "./pages/Picking";
import GatePass from "./pages/GatePass";
import Receipt from "./pages/Receipt";
import CanteenLedger from "./pages/CanteenLedger";
import FoodTokens from "./pages/FoodTokens";
import NextDayRequirement from "./pages/NextDayRequirements";
import TicketDetails from "./pages/TicketDetails";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="content">
        <Navbar />

        <div className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prediction-details" element={<PredictionDetails />} />
            <Route path="/recommendations" element={<RecommendationCenter />} />
            <Route path="/approval" element={<ReplenishmentApproval />} />
            <Route path="/model-performance" element={<ModelPerformance />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/tickets" element={<ReplenishmentTicket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/picking" element={<Picking />} />
            <Route path="/gate-pass" element={<GatePass />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/canteen-ledger" element={<CanteenLedger />} />
            <Route path="/food-tokens" element={<FoodTokens />} />
            <Route path="/next-day-requirements" element={<NextDayRequirement />} />

            {/* Fallback */}
            <Route
              path="*"
              element={<h2 style={{ padding: 20 }}>404 - Page Not Found</h2>}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;