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
  const colWidth = `${100 / columns.length}%`;
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
    <Table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
  <TableHeader className="bg-gray-100">
    <TableRow>
      {columns.map((col, idx) => (
        <TableHead
          key={idx}
          className="px-4 py-2 text-left font-semibold text-gray-700"
          style={{ width: colWidth }}
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
          <TableCell
            key={colIdx}
            className="px-4 py-2"
            style={{ width: colWidth }}
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
