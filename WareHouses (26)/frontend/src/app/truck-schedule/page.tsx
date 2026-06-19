"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Section from "../components/Section";
import DataTable from "../components/DataTable";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function TruckSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/WH_TRUCK_SCHEDULE`)
      .then((res) => res.json())
      .then((data) => setSchedule(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Section title="WH_TRUCK_SCHEDULE">
          <DataTable
            actionLabel="Edit"
            data={schedule}
            columns={[
              { label: "Schedule ID", key: "schedule_id" },
              { label: "Dock No", key: "dock_no" },
              { label: "Truck ID", key: "truck_id" },
              { label: "Carrier", key: "carrier" },
              { label: "Arrival", key: "arrival_time" },
              { label: "Departure", key: "departure_time" },
              { label: "Status", key: "status" },
              { label: "Priority", key: "priority" },
            ]}
          />
        </Section>
      </main>
    </div>
  );
}
