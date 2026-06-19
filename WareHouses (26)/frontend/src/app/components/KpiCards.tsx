export default function KpiCards({ kpis }: { kpis: any }) {
  return (
    <section className="kpi-grid">
      <div className="card">
        <h3>Total Trucks</h3>
        <p>{kpis.total_trucks}</p>
      </div>

      <div className="card">
        <h3>Trucks Arrived</h3>
        <p>{kpis.trucks_arrived}</p>
      </div>

      <div className="card">
        <h3>Avg Waiting Time</h3>
        <p>{kpis.average_waiting_time}</p>
      </div>

      <div className="card">
        <h3>Dock Utilization</h3>
        <p>{kpis.dock_utilization}</p>
      </div>

      <div className="card">
        <h3>Delayed Trucks</h3>
        <p>{kpis.delayed_trucks}</p>
      </div>

      <div className="card">
        <h3>AI Savings</h3>
        <p>{kpis.ai_savings}</p>
      </div>
    </section>
  );
}
