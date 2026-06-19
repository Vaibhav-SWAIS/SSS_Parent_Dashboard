"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function DockUtilizationPage() {
  const [dockStatus, setDockStatus] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/WH_DOCK_UTILIZATION`)
      .then((res) => res.json())
      .then((data) => setDockStatus(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Section title="WH_DOCK_UTILIZATION">
          <DataTable
            data={dockStatus}
            columns={[
              { label: "Dock No", key: "dock_no" },
              { label: "Current Truck", key: "current_truck" },
              { label: "Status", key: "status" },
              { label: "Utilization", key: "utilization" },
              { label: "Next Available", key: "next_available" },
            ]}
          />
        </Section>
      </main>
    </div>
  );
}
