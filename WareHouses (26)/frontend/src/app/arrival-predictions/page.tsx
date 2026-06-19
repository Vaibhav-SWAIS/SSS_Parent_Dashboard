"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function ArrivalPredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/WH_TRUCK_ARRIVAL_PREDICTION`)
      .then((res) => res.json())
      .then((data) => setPredictions(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Section title="WH_TRUCK_ARRIVAL_PREDICTION">
          <DataTable
            data={predictions}
            columns={[
              { label: "Truck ID", key: "truck_id" },
              { label: "Carrier", key: "carrier" },
              { label: "Scheduled Arrival", key: "scheduled_arrival" },
              { label: "Predicted Arrival", key: "predicted_arrival" },
              { label: "Delay Probability", key: "delay_probability" },
              { label: "Predicted Delay", key: "predicted_delay" },
              { label: "Status", key: "status" },
            ]}
          />
        </Section>
      </main>
    </div>
  );
}
