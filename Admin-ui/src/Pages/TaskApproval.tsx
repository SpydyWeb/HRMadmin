import { useParams, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { RoutePaths } from "@/utils/constant";
import { useQuery, useMutation } from "@tanstack/react-query";
import { inboxService } from "@/services/inboxServices";
import Loader from "@/components/Loader";
import type { IInboxItem } from "@/models/inbox";
import type { ApiResponse } from "@/models/api";
import type { IInboxResponseBody } from "@/models/inbox";

type InboxResponse = ApiResponse<IInboxResponseBody>;

const TaskApproval = () => {
  //take the srNo from the response 
  const { taskId } = useParams({ from: "/_auth/inbox/$taskId" });
  const navigate = useNavigate();

  // Call the same API with srNo to get specific task details
  const { data: inboxResponse, isLoading, isError } = useQuery<InboxResponse | null>({
    queryKey: ['inbox-task-detail', taskId],
    queryFn: async () => {
      const requestData = {
        //dont send the other parameters
        srNo: taskId ? Number(taskId) : null,
      };
      const response = await inboxService.InboxList(requestData);
      if (!response) {
        throw new Error("Failed to fetch task data");
      }
      return response;
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Get the task data from the response
  const tasks: IInboxItem[] = inboxResponse?.responseBody?.inboxData || [];
  const taskData = tasks.length > 0 ? tasks[0] : null;

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mutation for updating SR decision
  const updateDecisionMutation = useMutation({
    mutationFn: async (decision: number) => {
      if (!taskData?.srNo) {
        throw new Error("SR No is required");
      }
      return await inboxService.updateSrDecision({
        srNo: taskData.srNo,
        approverDecision: decision,
      });
    },
    onSuccess: (response) => {
      console.log("Decision updated successfully:", response);
      // Navigate back to inbox after successful update
      navigate({ to: RoutePaths.INBOX });
    },
    onError: (error) => {
      console.error("Error updating decision:", error);
      // You can add toast notification here if needed
    },
  });

  const handleApprove = () => {
    console.log("Approving task:", taskId);
    // approverDecision: 2 for approve
    updateDecisionMutation.mutate(2);
  };

  const handleReject = () => {
    console.log("Rejecting task:", taskId);
    // approverDecision: 3 for reject
    updateDecisionMutation.mutate(3);
  };

  if (isLoading) {
    return (
      <div className="w-full px-6 py-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError || !taskData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-500">
              {isError ? "Error loading task details. Please try again." : "Task not found."}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">

      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Task Name */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Task Name</div>
              <div className="text-base">{taskData.requestDets}</div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">SR No</div>
                <div className="text-base">{taskData.srNo}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Created On</div>
                <div className="text-base">{formatDate(taskData.createdDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Created By</div>
                <div className="text-base">{taskData.createdByUsername || `User ${taskData.createdBy}`}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Status Modified On</div>
                <div className="text-base">{formatDate(taskData.statusModifiedOn)}</div>
              </div>
            </div>

            {/* Requestor Comments */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Requestor Comments</div>
              <div className="text-base whitespace-pre-wrap">{taskData.requestorNote || "No comments"}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="green"
                onClick={handleApprove}
                className="min-w-[120px]"
                disabled={updateDecisionMutation.isPending}
              >
                {updateDecisionMutation.isPending ? "Processing..." : "Approve"}
              </Button>
              <Button
                variant="red"
                onClick={handleReject}
                className="min-w-[120px]"
                disabled={updateDecisionMutation.isPending}
              >
                {updateDecisionMutation.isPending ? "Processing..." : "Reject"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskApproval;
