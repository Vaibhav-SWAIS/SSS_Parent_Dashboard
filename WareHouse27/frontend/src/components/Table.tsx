interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
}

function Table({ columns, data }: TableProps) {
  return (
    <div className="table-container">

      <table>

        <thead>

          <tr>

            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
            ))}

          </tr>

        </thead>

        <tbody>

          {data.length > 0 ? (

            data.map((row, index) => (

              <tr key={index}>

                {columns.map((column) => (

                  <td key={column.key}>
                    {row[column.key]}
                  </td>

                ))}

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >
                No Records Found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default Table;