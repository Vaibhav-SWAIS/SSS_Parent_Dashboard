"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <h2>Warehouse AI</h2>
        <p>Dock Scheduler</p>

        <button
          className="sidebar-close-btn"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>

      <nav className="sidebar-menu">
        <Link href="/">🏠 Dashboard</Link>
        <Link href="/truck-schedule">🚚 Truck Schedule</Link>
        <Link href="/ai-recommendations">🤖 AI Recommendations</Link>
        <Link href="/arrival-predictions">📈 Arrival Predictions</Link>
        <Link href="/dock-utilization">🏭 Dock Utilization</Link>
        <Link href="/congestion">⚠️ Congestion</Link>
        <Link href="/alerts">🔔 Alerts</Link>
      </nav>
    </aside>
  );
}
