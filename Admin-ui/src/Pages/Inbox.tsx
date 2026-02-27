import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiExternalLink } from "react-icons/fi";
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
import Loader from "@/components/Loader";
import type { IInboxItem } from "@/models/inbox";
import type { ApiResponse } from "@/models/api";
import type { IInboxResponseBody } from "@/models/inbox";


const calculateAging = (createdOn: string | Date): number => {
  const now = new Date();
  const createdDate = typeof createdOn === 'string' ? new Date(createdOn) : createdOn;
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type InboxResponse = ApiResponse<IInboxResponseBody>;

const Inbox = () => {
  const { data: inboxResponse, isLoading } = useQuery<InboxResponse | null>({
    queryKey: ['inbox-list'],
    queryFn: async () => {
      const requestData = {
        srStatus: null,
        createdDateFrom: null,
        createdDateTo: null,
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
          <CardTitle className="text-2xl font-semibold">User Inbox</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve pending service requests
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SR No</TableHead>
                  <TableHead>Request Details</TableHead>
                  <TableHead>Requestor Note</TableHead>
                  <TableHead>Aging (Days)</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status Modified On</TableHead>
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
                    return (
                      <TableRow key={`${task.controlId}-${task.srNo}-${index}`}>
                        <TableCell className="font-medium">
                          {task.srNo}
                        </TableCell>
                        <TableCell className="font-medium">
                         
                          {task.requestDets?.length > 25
    ? task.requestDets.slice(0, 25) + "..."
    : task.requestDets}
                        </TableCell>
                        <TableCell>
                         <div title={task.requestorNote}>
  {task.requestorNote?.length > 25
    ? task.requestorNote.slice(0, 25) + "..."
    : task.requestorNote}
</div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium whitespace-nowrap ${
                              aging > 7
                                ? "text-red-600"
                                : aging > 3
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {aging} days
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.createdByUsername || `User ${task.createdBy}`}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(task.createdDate)}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(task.statusModifiedOn)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            task.srStatus === 1 
                              ? "bg-blue-100 text-blue-800" 
                              : task.srStatus === 2 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {task.srStatus === 1 ? "New" : task.srStatus === 2 ? "Pending" : `Status ${task.srStatus}`}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            to="/inbox/$taskId"
                            params={{ taskId: String(task?.srNo) }}
                            className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
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
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Inbox;
