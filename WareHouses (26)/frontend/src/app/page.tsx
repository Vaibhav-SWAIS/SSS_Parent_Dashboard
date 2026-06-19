"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./components/Sidebar";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/kpis`)
      .then((res) => res.json())
      .then((data) => setKpis(data))
      .catch((err) => console.error("KPI fetch error:", err));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="dashboard-header">
          <h1>Dock Scheduling Optimization Dashboard</h1>
          <p>AI-powered dock planning, truck prediction and congestion control</p>
        </div>

        <div className="kpi-grid">
          <Link href="/truck-schedule" className="kpi-card">
            <h3>Total Trucks</h3>
            <p>{kpis.total_trucks ?? 0}</p>
            <span>View truck schedule →</span>
          </Link>

          <Link href="/truck-schedule" className="kpi-card">
            <h3>Trucks Arrived</h3>
            <p>{kpis.trucks_arrived ?? 0}</p>
            <span>View arrived trucks →</span>
          </Link>

          <Link href="/truck-schedule" className="kpi-card">
            <h3>Trucks Scheduled</h3>
            <p>{kpis.trucks_scheduled ?? 0}</p>
            <span>View scheduled trucks →</span>
          </Link>

           <Link href="/truck-schedule" className="kpi-card">
            <h3>Trucks Loading</h3>
            <p>{kpis.trucks_loading ?? 0}</p>
            <span>View loading trucks →</span>
          </Link>

          <Link href="/arrival-predictions" className="kpi-card">
            <h3>Avg Waiting Time</h3>
            <p>{kpis.average_waiting_time ?? "0 mins"}</p>
            <span>View arrival predictions →</span>
          </Link>

          <Link href="/dock-utilization" className="kpi-card">
            <h3>Dock Utilization</h3>
            <p>{kpis.dock_utilization ?? "0%"}</p>
            <span>View dock utilization →</span>
          </Link>

          <Link href="/truck-schedule" className="kpi-card">
            <h3>Delayed Trucks</h3>
            <p>{kpis.delayed_trucks ?? 0}</p>
            <span>View delayed trucks →</span>
          </Link>

          <Link href="/ai-recommendations" className="kpi-card">
            <h3>AI Savings</h3>
            <p>{kpis.ai_savings ?? "0 hrs"}</p>
            <span>View AI recommendations →</span>
          </Link>
        </div>

        <section className="section">
          <h2>Dock Scheduling Modules</h2>

          <div className="module-grid">
            <Link href="/truck-schedule" className="module-card">
              <h3>🚚 Truck Schedule</h3>
              <p>Manage scheduled trucks, dock allocation and priority.</p>
            </Link>

            <Link href="/ai-recommendations" className="module-card">
              <h3>🤖 AI Recommendations</h3>
              <p>Review AI-based scheduling suggestions and time savings.</p>
            </Link>

            <Link href="/arrival-predictions" className="module-card">
              <h3>📈 Arrival Predictions</h3>
              <p>Track predicted arrival time and delay probability.</p>
            </Link>

            <Link href="/dock-utilization" className="module-card">
              <h3>🏭 Dock Utilization</h3>
              <p>Monitor dock usage, occupancy and next availability.</p>
            </Link>

            <Link href="/congestion" className="module-card">
              <h3>⚠️ Congestion</h3>
              <p>View predicted congestion levels and risk scores.</p>
            </Link>

            <Link href="/alerts" className="module-card">
              <h3>🔔 Alerts</h3>
              <p>Check delay alerts, congestion alerts and exceptions.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
