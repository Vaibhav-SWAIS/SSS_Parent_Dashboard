"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/WH_DOCK_ALERTS`)
      .then((res) => res.json())
      .then((data) => setAlerts(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Section title="WH_DOCK_ALERTS">
          <DataTable
            data={alerts}
            columns={[
              { label: "Alert ID", key: "alert_id" },
              { label: "Type", key: "alert_type" },
              { label: "Severity", key: "severity" },
              { label: "Description", key: "description" },
              { label: "Created Time", key: "created_time" },
              { label: "Status", key: "status" },
            ]}
          />
        </Section>
      </main>
    </div>
  );
}
