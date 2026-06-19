type Column = {
  label: string;
  key: string;
};

export default function DataTable({
  columns,
  data,
  actionLabel,
}: {
  columns: Column[];
  data: any;
  actionLabel?: string;
}) {
  const tableData = Array.isArray(data) ? data : [];

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {actionLabel && <th>Action</th>}
        </tr>
      </thead>

      <tbody>
        {tableData.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actionLabel ? 1 : 0)}>
              No data available
            </td>
          </tr>
        ) : (
          tableData.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "severity" ? (
                    <span className={`badge ${String(row[col.key]).toLowerCase()}`}>
                      {row[col.key]}
                    </span>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}

              {actionLabel && (
                <td>
                  <button>{actionLabel}</button>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}