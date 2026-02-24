import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui/button";
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

const TaskApproval = () => {
  const { taskId } = useParams({ from: "/_auth/inbox/$taskId" });
  const navigate = useNavigate();
  const [additionalComments, setAdditionalComments] = useState("");

  // Mock data - in real app, this would come from an API based on taskId
  const taskData = {
    taskName: "Employee Onboarding Approval",
    createdOn: new Date("2024-01-15"),
    createdBy: "John Smith",
    receivedOn: new Date("2024-01-18"),
    requestorComments: "Please review and approve the onboarding request for the new employee. All required documents have been submitted.",
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleApprove = () => {
    console.log("Approving task:", taskId);
    console.log("Additional comments:", additionalComments);
    // TODO: Implement approval logic
    // After approval, navigate back to inbox
    navigate({ to: RoutePaths.INBOX });
  };

  const handleReject = () => {
    console.log("Rejecting task:", taskId);
    console.log("Additional comments:", additionalComments);
    // TODO: Implement rejection logic
    // After rejection, navigate back to inbox
    navigate({ to: RoutePaths.INBOX });
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
            <BreadcrumbLink asChild>
              <Link to={RoutePaths.INBOX} className="text-gray-400 hover:text-gray-600">
                Inbox
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-gray-900">Task Approval</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Task Name Field */}
            <div>
              <Input
                variant="standard"
                label="Task Name"
                value={taskData.taskName}
                readOnly
                className="w-full"
              />
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created On
                </label>
                <div className="bg-white border border-gray-400 rounded-none px-3 py-2 text-base">
                  {formatDate(taskData.createdOn)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By
                </label>
                <div className="bg-white border border-gray-400 rounded-none px-3 py-2 text-base">
                  {taskData.createdBy}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Received On
                </label>
                <div className="bg-white border border-gray-400 rounded-none px-3 py-2 text-base">
                  {formatDate(taskData.receivedOn)}
                </div>
              </div>
            </div>

            {/* Requestor Comments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requestor Comments
              </label>
              <Textarea
                variant="white"
                value={taskData.requestorComments}
                readOnly
                className="w-full min-h-32"
                placeholder="Requestor comments"
              />
            </div>

            {/* Additional Comments/Response Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <Textarea
                variant="white"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                className="w-full min-h-32"
                placeholder="Enter your comments or response here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="green"
                onClick={handleApprove}
                className="min-w-[120px]"
              >
                Approve
              </Button>
              <Button
                variant="red"
                onClick={handleReject}
                className="min-w-[120px]"
              >
                Reject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskApproval;
