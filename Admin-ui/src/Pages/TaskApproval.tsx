import { useParams, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { RoutePaths, NOTIFICATION_CONSTANTS } from "@/utils/constant";
import { useQuery, useMutation } from "@tanstack/react-query";
import { inboxService } from "@/services/inboxServices";
import Loader from "@/components/Loader";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { showToast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IInboxItem } from "@/models/inbox";
import { SrStatus } from "@/models/inbox";
import type { ApiResponse } from "@/models/api";
import type { IInboxResponseBody } from "@/models/inbox";

type InboxResponse = ApiResponse<IInboxResponseBody>;

const TaskApproval = () => {
  //take the srNo from the response 
  const { taskId } = useParams({ from: "/_auth/inbox/$taskId" });
  const navigate = useNavigate();
  const [comments, setComments] = useState<string>("");

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
  const isPendingStatus = taskData?.srStatus === SrStatus.Pending;

  const toValidDate = (value?: string | Date | null): Date | null => {
    if (!value) return null;
    const d = typeof value === "string" ? new Date(value) : value;
    return Number.isNaN(d.getTime()) ? null : d;
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

  const formatDateTime = (date?: string | Date | null): string => {
    const dateObj = toValidDate(date);
    if (!dateObj) return "—";
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTaskName = (value?: string | null): string => {
    if (!value) return "-";
    // Replace underscores with spaces and normalise whitespace
    const withSpaces = value.replace(/_/g, " ").trim();
    // Title-case each word
    return withSpaces
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  type FieldChangeRow = {
    FieldName?: string | null;
    OldValue?: string | null;
    NewValue?: string | null;
  };

  const parseFieldChanges = (
    value: unknown,
  ): FieldChangeRow[] | null => {
    if (!value) return null;

    const normalize = (rows: unknown): FieldChangeRow[] | null => {
      if (!Array.isArray(rows)) return null;
      const mapped = rows
        .map((r) => r as Record<string, unknown>)
        .map((r) => ({
          FieldName:
            (r.FieldName as string | null | undefined) ??
            (r.fieldName as string | null | undefined) ??
            null,
          OldValue:
            (r.OldValue as string | null | undefined) ??
            (r.oldValue as string | null | undefined) ??
            null,
          NewValue:
            (r.NewValue as string | null | undefined) ??
            (r.newValue as string | null | undefined) ??
            null,
        }));

      // If everything is empty, treat as not-a-match
      const hasAny = mapped.some(
        (m) => (m.FieldName ?? m.OldValue ?? m.NewValue) !== null,
      );
      return hasAny ? mapped : null;
    };

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      // Try JSON first (your example)
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          return normalize(parsed);
        } catch {
          return null;
        }
      }
      return null;
    }

    // If backend already gives it as array/object
    return normalize(value);
  };

  // Mutation for updating SR decision
  const updateDecisionMutation = useMutation({
    mutationFn: async ({ decision, comments }: { decision: number; comments: string }) => {
      if (!taskData?.srNo) {
        throw new Error("SR No is required");
      }
      return await inboxService.updateSrDecision({
        srNo: taskData.srNo,
        approverDecision: decision,
        comments: comments.trim() || undefined,
      });
    },
    onSuccess: (response: any) => {
      console.log("Decision updated successfully:", response);
      
      // Check if response contains an error code (API might return 200 with error in body)
      const errorCode = response?.responseHeader?.errorCode;
      const errorMessage = response?.responseHeader?.errorMessage;
      
      if (errorCode === 4001 || errorMessage) {
        // Show error toast and don't navigate
        showToast(NOTIFICATION_CONSTANTS.ERROR, errorMessage || "You are not authorized to approve this level.");
        return;
      }
      
      // Navigate back to inbox after successful update
      navigate({ to: RoutePaths.INBOX });
    },
    onError: (error: any) => {
      console.error("Error updating decision:", error);
      
      // Check if error has the specific 4001 error code for authorization issues
      const errorCode = error?.response?.responseHeader?.errorCode || 
                       error?.responseHeader?.errorCode ||
                       error?.responseBody?.responseHeader?.errorCode;
      
      const errorMessage = error?.response?.responseHeader?.errorMessage || 
                          error?.responseHeader?.errorMessage ||
                          error?.responseBody?.responseHeader?.errorMessage ||
                          "Already approved at this level. Sent for next approval. Please wait until the approval process is complete";
      
      if (errorCode === 4001) {
        // Show the specific authorization error message in toast
        showToast(NOTIFICATION_CONSTANTS.ERROR, errorMessage);
      } else {
        // Show generic error for other cases
        showToast(NOTIFICATION_CONSTANTS.ERROR, errorMessage);
      }
    },
  });

  const handleApprove = () => {
    console.log("Approving task:", taskId);
    // approverDecision: 2 for approve
    updateDecisionMutation.mutate({ decision: 2, comments });
  };

  const handleReject = () => {
    console.log("Rejecting task:", taskId);
    // approverDecision: 3 for reject
    updateDecisionMutation.mutate({ decision: 3, comments });
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
            {/* Section 1: Task Summary */}
            <div className="text-md font-semibold uppercase tracking-wide text-gray-500">
                Task Details
              </div>
            <section className="rounded-sm border border-gray-200 bg-gray-50 p-4 space-y-4">
              {/* <div className="text-md font-semibold uppercase tracking-wide text-gray-500">
                Task Details
              </div> */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Task Name</div>
                <div className="text-sm text-gray-900">
                  {formatTaskName(taskData.requestDets)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">SR No</div>
                  <div className="text-sm text-gray-900">{taskData.srNo}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Created On</div>
                  <div className="text-sm text-gray-900">
                    {formatDate(taskData.createdDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Created By</div>
                  <div className="text-sm text-gray-900">
                    {taskData.createdByUsername || `User ${taskData.createdBy}`}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Status</div>
                  <div className="mt-0.5">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        taskData.srStatus === SrStatus.Created
                          ? "bg-blue-100 text-blue-800"
                          : taskData.srStatus === SrStatus.Pending
                          ? "bg-yellow-100 text-yellow-800"
                          : taskData.srStatus === SrStatus.Approved
                          ? "bg-green-100 text-green-800"
                          : taskData.srStatus === SrStatus.Rejected
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {taskData.srStatus === SrStatus.Created
                        ? "Created"
                        : taskData.srStatus === SrStatus.Pending
                        ? "Pending Decision"
                        : taskData.srStatus === SrStatus.Approved
                        ? "Approved"
                        : taskData.srStatus === SrStatus.Rejected
                        ? "Rejected"
                        : taskData.srStatusDesc || `Status ${taskData.srStatus}`}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Requestor Comments */}
            <section className="rounded-sm  bg-white  space-y-3">
              <div className="text-md font-semibold uppercase tracking-wide text-gray-500">
                Requestor Comments
              </div>
              {(() => {
                const rows = parseFieldChanges(taskData.requestorNote);
                if (rows && rows.length > 0) {
                  return (
                    <div className="rounded-sm border border-gray-200 overflow-hidden bg-gray-50">
                      <Table className="w-full text-sm">
                        <TableHeader className="bg-gray-100">
                          <TableRow>
                            <TableHead className="text-xs font-semibold text-gray-600">
                              Field Name
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600">
                              Old Value
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-600">
                              New Value
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((r, idx) => (
                            <TableRow
                              key={`${r.FieldName ?? "field"}-${idx}`}
                              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <TableCell className="font-medium text-gray-900">
                                {r.FieldName ?? "—"}
                              </TableCell>
                              <TableCell className="text-gray-700">
                                {r.OldValue ?? "—"}
                              </TableCell>
                              <TableCell className="text-gray-700">
                                {r.NewValue ?? "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                }

                return (
                  <div className="text-sm whitespace-pre-wrap text-gray-800 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
                    {taskData.requestorNote || "No comments"}
                  </div>
                );
              })()}
            </section>

            {/* Section 3: Approver Comments History */}
            {taskData.approverComments && taskData.approverComments.length > 0 && (
              <section className="rounded-sm  bg-white space-y-3">
                <div className="text-md font-semibold uppercase tracking-wide text-gray-500">
                  Approver Comments
                </div>
                <div className="rounded-sm border border-gray-200 overflow-hidden bg-gray-50">
                  <Table className="w-full text-sm">
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="text-xs font-semibold text-gray-600">
                          Approver
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">
                          Decision On
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">
                          Comments
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskData.approverComments.map((c, idx) => (
                        <TableRow
                          key={`${c.approverName ?? "approver"}-${idx}`}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <TableCell className="font-medium text-gray-900">
                            {c.approverName || "—"}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {formatDateTime(c.decisionOn)}
                          </TableCell>
                          <TableCell className="whitespace-pre-wrap text-gray-700">
                            {c.comments || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {/* Section 4: Approver Input & Actions */}
            <section className="rounded-sm border border-gray-200 bg-white p-4 space-y-4">
              {isPendingStatus && (
                <div>
                  <div className="text-md font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Comments / Reason <span className="text-gray-500 normal-case">(Optional)</span>
                  </div>
                  <Textarea
                    placeholder="Enter reason for approval or rejection..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full min-h-24"
                    rows={4}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200 mt-2 justify-end">
                <Button
                  variant="green"
                  onClick={handleApprove}
                  className="min-w-[120px]"
                  disabled={!isPendingStatus || updateDecisionMutation.isPending}
                >
                  {updateDecisionMutation.isPending ? "Processing..." : "Approve"}
                </Button>
                <Button
                  variant="red"
                  onClick={handleReject}
                  className="min-w-[120px]"
                  disabled={!isPendingStatus || updateDecisionMutation.isPending}
                >
                  {updateDecisionMutation.isPending ? "Processing..." : "Reject"}
                </Button>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskApproval;
