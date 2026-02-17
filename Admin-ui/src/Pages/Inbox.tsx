import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button";
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

interface Task {
  id: string;
  taskName: string;
  receivedOn: Date;
  createdBy: string;
  createdOn: Date;
  taskDetailsLink: string;
}

// Generate random mock data
const generateMockTasks = (): Task[] => {
  const taskNames = [
    "Employee Onboarding Approval",
    "Leave Request Approval",
    "Expense Report Review",
    "Timesheet Verification",
    "Performance Review Submission",
    "Salary Revision Request",
    "Project Assignment Approval",
    "Training Request Approval",
    "Equipment Request",
    "Access Permission Request",
  ];

  const creators = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "Lisa Anderson",
    "Robert Taylor",
    "Jennifer Martinez",
  ];

  const tasks: Task[] = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const createdOn = new Date(now);
    createdOn.setDate(createdOn.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
    
    const receivedOn = new Date(createdOn);
    receivedOn.setDate(receivedOn.getDate() + Math.floor(Math.random() * 5)); // Received 0-5 days after creation

    tasks.push({
      id: `TASK-${String(i + 1).padStart(4, "0")}`,
      taskName: taskNames[Math.floor(Math.random() * taskNames.length)],
      receivedOn,
      createdBy: creators[Math.floor(Math.random() * creators.length)],
      createdOn,
      taskDetailsLink: `/task-details/${i + 1}`,
    });
  }

  return tasks;
};

const calculateAging = (createdOn: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdOn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Inbox = () => {
  const [tasks] = useState<Task[]>(generateMockTasks());

  const handleApproval = (taskId: string) => {
    console.log("Approving task:", taskId);
    // TODO: Implement approval logic
  };

  const handleRejection = (taskId: string) => {
    console.log("Rejecting task:", taskId);
    // TODO: Implement rejection logic
  };

  return (
    <div className="container mx-auto p-6">
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">User Inbox</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve pending tasks
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Task Name</TableHead>
                <TableHead className="w-[100px]">Aging (Days)</TableHead>
                <TableHead className="w-[200px]">Created By / On</TableHead>
                <TableHead className="w-[150px]">Received On</TableHead>
                <TableHead className="w-[200px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const aging = calculateAging(task.createdOn);
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.taskName}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
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
                      <div className="flex flex-col">
                        <span className="font-medium">{task.createdBy}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(task.createdOn)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(task.receivedOn)}</TableCell>
                    
                    <TableCell>
                      <a
                        href={task.taskDetailsLink}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Details
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    </TableCell>
                    
                   
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inbox;
