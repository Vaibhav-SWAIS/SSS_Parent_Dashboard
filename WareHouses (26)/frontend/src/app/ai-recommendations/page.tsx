"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/WH_AI_RECOMMENDATIONS`)
      .then((res) => res.json())
      .then((data) => setRecommendations(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Section title="WH_AI_RECOMMENDATIONS">
          <DataTable
            actionLabel="Accept"
            data={recommendations}
            columns={[
              { label: "Recommendation ID", key: "recommendation_id" },
              { label: "Truck ID", key: "truck_id" },
              { label: "Current Dock", key: "current_dock" },
              { label: "Suggested Dock", key: "suggested_dock" },
              { label: "Current Time", key: "current_time" },
              { label: "Suggested Time", key: "suggested_time" },
              { label: "Reason", key: "reason" },
              { label: "Time Saved", key: "time_saved" },
            ]}
          />
        </Section>
      </main>
    </div>
  );
}
