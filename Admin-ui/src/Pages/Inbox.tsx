import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { RoutePaths } from "@/utils/constant";
import { useQuery } from "@tanstack/react-query";
import { inboxService } from "@/services/inboxServices";
import { HMSService } from "@/services/hmsService";
import Loader from "@/components/Loader";
import type { IInboxItem } from "@/models/inbox";
import { SrStatus } from "@/models/inbox";
import type { ApiResponse } from "@/models/api";
import type { IInboxResponseBody } from "@/models/inbox";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Pagination } from "@/components/table/Pagination";


const toValidDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
};

const calculateAging = (createdOn?: string | Date | null): number | null => {
  const now = new Date();
  const createdDate = toValidDate(createdOn);
  if (!createdDate) return null;
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (date?: string | Date | null): string => {
  const dateObj = toValidDate(date);
  if (!dateObj) return "—";
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type InboxResponse = ApiResponse<IInboxResponseBody>;

const Inbox = () => {
  type SrStatusFilterValue = "PENDING" | "ALL" | `${SrStatus}`;

  const [srStatusFilter, setSrStatusFilter] =
    useState<SrStatusFilterValue>("PENDING");
  const [createdDateFrom, setCreatedDateFrom] = useState<string | null>(null);
  const [createdDateTo, setCreatedDateTo] = useState<string | null>(null);
  const [agentCodeInput, setAgentCodeInput] = useState<string>("");
  const [agentCode, setAgentCode] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [roles, setRoles] = useState<Array<{ roleId: number; roleName: string }>>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await HMSService.getRoles();
        const apiRoles = response?.responseBody?.roles || [];
        setRoles(apiRoles);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [srStatusFilter, createdDateFrom, createdDateTo, agentCode, selectedRole]);

  // Helper function to format date to ISO format with specific time
  const formatDateForAPI = (dateString: string | null, isEndOfDay: boolean = false): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString();
  };

  const { data: inboxResponse, isLoading } = useQuery<InboxResponse | null>({
    queryKey: ["inbox-list", srStatusFilter, createdDateFrom, createdDateTo, agentCode, selectedRole, page, pageSize],
    queryFn: async () => {
      const requestData = {
        srNo: null,
        createdDateFrom: formatDateForAPI(createdDateFrom, false),
        createdDateTo: formatDateForAPI(createdDateTo, true),
        pageNo: page,
        pageSize: pageSize,
        agentCode: agentCode.trim() ? agentCode.trim().toUpperCase() : null,
        allocateToRole: selectedRole,
        ...(srStatusFilter === "PENDING"
          ? { srStatus: SrStatus.Pending }
          : srStatusFilter === "ALL"
          ? {}
          : { srStatus: Number(srStatusFilter) as SrStatus }),
      };
      const response = await inboxService.InboxList(requestData);
      if (!response) {
        throw new Error("Failed to fetch inbox data");
      }
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="w-full px-6 py-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const tasks: IInboxItem[] = inboxResponse?.responseBody?.inboxData || [];
  const paginationData = inboxResponse?.responseBody?.pagination || {};

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
 
  return (
    <div className="w-full px-6 py-4">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={RoutePaths.DASHBOARD} className="text-gray-400 hover:text-gray-600">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-gray-900">Inbox</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Card className="col-span-12 w-full">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-semibold">User Inbox</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve pending service requests
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Status
                </label>
                <Select
                  value={srStatusFilter}
                  onValueChange={(v) =>
                    setSrStatusFilter(v as SrStatusFilterValue)
                  }
                >
                  <SelectTrigger className="w-52 border-gray-400 !text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value={`${SrStatus.Created}`}>Created</SelectItem>
                    <SelectItem value={`${SrStatus.Pending}`}>
                      Pending
                    </SelectItem>
                    <SelectItem value={`${SrStatus.Approved}`}>Approved</SelectItem>
                    <SelectItem value={`${SrStatus.Rejected}`}>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filters */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    variant="standard"
                    label=""
                    type="date"
                    value={createdDateFrom ?? ""}
                    onChange={(e) => {
                      const next = e.target.value || null;
                      setCreatedDateFrom(next);
                    }}
                    className="w-40"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <Input
                    variant="standard"
                    label=""
                    type="date"
                    value={createdDateTo ?? ""}
                    onChange={(e) => {
                      const next = e.target.value || null;
                      setCreatedDateTo(next);
                    }}
                    className="w-40"
                  />
                </div>
              </div>

              {/* Agent Code Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Agent Code
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    variant="standard"
                    label=""
                    type="text"
                    placeholder="e.g., ag0033"
                    value={agentCodeInput}
                    onChange={(e) => setAgentCodeInput(e.target.value)}
                    className="w-40"
                  />
                  <Button
                    variant="blue"
                    onClick={() => setAgentCode(agentCodeInput.trim())}
                    className="whitespace-nowrap"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Role
                </label>
                <Select
                  value={selectedRole ? String(selectedRole) : "ALL"}
                  onValueChange={(v) => {
                    setSelectedRole(v === "ALL" ? null : Number(v));
                  }}
                >
                  <SelectTrigger className="w-52 border-gray-400 !text-base">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.roleId} value={String(role.roleId)}>
                        {role.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SR No</TableHead>
                  <TableHead>Request Details</TableHead>
                  
                  <TableHead>Aging (Days)</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created Date</TableHead>
                  
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      No service requests found in inbox
                    </TableCell>
                  </TableRow>
                  
                ) : (
                  tasks.map((task, index) => {
                    const aging = calculateAging(task.createdDate);
                    const requestDets = task.requestDets ?? "";
                    const requestorNote = task.requestorNote ?? "";
                    return (
                      <TableRow key={`${task.controlId}-${task.srNo}-${index}`}>
                        <TableCell className="font-medium">
                          {task.srNo}
                        </TableCell>
                        <TableCell className="font-medium">
                         
                          {requestDets.length > 25
                            ? requestDets.slice(0, 25) + "..."
                            : (requestDets || "—")}
                        </TableCell>
                       
                        <TableCell>
                          <span
                            className={`font-medium whitespace-nowrap ${
                              aging === null
                                ? "text-gray-600"
                                : aging > 7
                                ? "text-red-600"
                                : aging > 3
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {aging === null ? "—" : `${aging} days`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.createdByUsername || `User ${task.createdBy}`}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(task.createdDate)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            task.srStatus === SrStatus.Created 
                              ? "bg-blue-100 text-blue-800" 
                              : task.srStatus === SrStatus.Pending
                              ? "bg-yellow-100 text-yellow-800"
                              : task.srStatus === SrStatus.Approved
                              ? "bg-green-100 text-green-800"
                              : task.srStatus === SrStatus.Rejected
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {task.srStatus === SrStatus.Created 
                              ? "Created" 
                              : task.srStatus === SrStatus.Pending
                              ? "Pending Decision"
                              : task.srStatus === SrStatus.Approved
                              ? "Approved"
                              : task.srStatus === SrStatus.Rejected
                              ? "Rejected"
                              : `Status ${task.srStatus}`}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            to="/inbox/$taskId"
                            params={{ taskId: String(task?.srNo) }}
                            className="flex  gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Details
                          
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold text-lg text-gray-700">
              Page {page} of {paginationData.totalPages || 1} ({paginationData.totalItems || 0} total items)
            </span>
            <Pagination
              totalPages={paginationData.totalPages || 1}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Inbox;
