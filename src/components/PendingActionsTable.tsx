import DataTable from "./DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const tableData = [
  { channel: "Code Movement", pending: 12, updated: "2 hours ago", priority: "Medium" },
  { channel: "Certifications Update", pending: 2, updated: "3 hours ago", priority: "High" },
  { channel: "Termination", pending: 21, updated: "6 hours ago", priority: "Critical" },
  { channel: "New Entity Approval", pending: 53, updated: "5 hours ago", priority: "Critical" },
  { channel: "Query", pending: 1, updated: "5 hours ago", priority: "Critical" },
];

const priorityColor = (priority: string) => {
  switch (priority) {
    case "Medium":
      return "bg-green-100 text-green-800";
    case "High":
      return "bg-purple-100 text-purple-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const columns = [
  { header: "Channel Name", accessor: "channel" },
  {
    header: "Pending Items",
    accessor: (row: any) => (
      <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 font-medium">
        {row.pending.toString().padStart(2, "0")}
      </span>
    ),
  },
  { header: "Last Updated", accessor: "updated" },
  {
    header: "Priority",
    accessor: (row: any) => (
      <span className={`px-2 py-1 rounded-md font-medium ${priorityColor(row.priority)}`}>
        {row.priority}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: () => (
      <Button className="hover:opacity-90 text-white text-sm" style={{backgroundColor: 'var(--brand-blue)'}}>
        Process Now
      </Button>
    ),
  },
];

export default function PendingActionsTable() {
  return (
    <Card className="shadow-md rounded-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-semibold">Pending Actions</CardTitle>
        <Select defaultValue="this-month">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={tableData} />
      </CardContent>
    </Card>
  );
}
