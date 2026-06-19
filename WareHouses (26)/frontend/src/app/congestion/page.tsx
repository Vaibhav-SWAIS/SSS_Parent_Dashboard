"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function CongestionPage() {
  const [congestion, setCongestion] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/WH_CONGESTION_PREDICTIONS`)
      .then((res) => res.json())
      .then((data) => setCongestion(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Section title="WH_CONGESTION_PREDICTIONS">
          <DataTable
            data={congestion}
            columns={[
              { label: "Time Slot", key: "time_slot" },
              { label: "Expected Trucks", key: "expected_trucks" },
              { label: "Available Docks", key: "available_docks" },
              { label: "Congestion Level", key: "congestion_level" },
              { label: "Risk Score", key: "risk_score" },
            ]}
          />
        </Section>
      </main>
    </div>
  );
}
