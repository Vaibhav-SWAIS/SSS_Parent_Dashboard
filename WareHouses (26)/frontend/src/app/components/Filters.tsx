export default function Filters({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="filters">
      <input type="date" />

      <select>
        <option>Warehouse-01</option>
        <option>Warehouse-02</option>
      </select>

      <select>
        <option>Morning Shift</option>
        <option>Evening Shift</option>
        <option>Night Shift</option>
      </select>

      <button onClick={onRefresh}>Refresh</button>
      <button>Export Report</button>
    </div>
  );
}
