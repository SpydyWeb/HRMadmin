import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface Column {
  header: string;
  accessor: string | ((row: any) => React.ReactNode);
  width?: string; // Optional column width like "150px" or "20%"
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  // Calculate default width only for columns without explicit width
  const defaultWidth = `${100 / columns.filter(col => !col.width).length}%`;

  return (
    <div className="overflow-x-auto rounded-sm bg-[#F2F2F7]">
      <Table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
        {/* Table Header */}
        <TableHeader className="bg-gray-100">
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className="px-4 py-2 text-left font-semibold text-gray-700"
                style={{ width: col.width || defaultWidth }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className="divide-y divide-gray-100">
          {data.map((row, rowIdx) => (
            <TableRow key={rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <TableCell
                  key={colIdx}
                  className="px-4 py-2"
                  style={{ width: col.width || defaultWidth }}
                >
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    : row[col.accessor]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
