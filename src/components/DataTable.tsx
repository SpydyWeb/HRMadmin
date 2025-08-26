import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface Column {
  header: string;
  accessor: string | ((row: any) => React.ReactNode);
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <Table className="min-w-full divide-y divide-gray-200 text-sm">
        <TableHeader className="bg-gray-100">
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead 
                key={idx}
                className="px-4 py-2 text-left font-semibold text-gray-700"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {data.map((row, rowIdx) => (
            <TableRow key={rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} className="px-4 py-2">
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
