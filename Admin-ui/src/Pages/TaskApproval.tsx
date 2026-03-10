import { useParams, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { RoutePaths } from "@/utils/constant";
import { useQuery, useMutation } from "@tanstack/react-query";
import { inboxService } from "@/services/inboxServices";
import Loader from "@/components/Loader";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
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
                <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
                <div className="text-base">{taskData.srStatusDesc}</div>
              </div>
            </div>

            {/* Requestor Comments */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Requestor Comments</div>
              {(() => {
                const rows = parseFieldChanges(taskData.requestorNote);
                if (rows && rows.length > 0) {
                  return (
                    <div className="rounded-md border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Field Name</TableHead>
                            <TableHead>Old Value</TableHead>
                            <TableHead>New Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((r, idx) => (
                            <TableRow key={`${r.FieldName ?? "field"}-${idx}`}>
                              <TableCell className="font-medium">
                                {r.FieldName ?? "—"}
                              </TableCell>
                              <TableCell>{r.OldValue ?? "—"}</TableCell>
                              <TableCell>{r.NewValue ?? "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                }

                return (
                  <div className="text-base whitespace-pre-wrap">
                    {taskData.requestorNote || "No comments"}
                  </div>
                );
              })()}
            </div>

            {/* Approver Comments History */}
            {taskData.approverComments && taskData.approverComments.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Approver Comments</div>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Approver</TableHead>
                        <TableHead>Decision On</TableHead>
                        <TableHead>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskData.approverComments.map((c, idx) => (
                        <TableRow key={`${c.approverName ?? "approver"}-${idx}`}>
                          <TableCell className="font-medium">
                            {c.approverName || "—"}
                          </TableCell>
                          <TableCell>{formatDateTime(c.decisionOn)}</TableCell>
                          <TableCell className="whitespace-pre-wrap">
                            {c.comments || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Comments Section - only when status is Pending */}
            {isPendingStatus && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Comments / Reason <span className="text-gray-500">(Optional)</span>
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskApproval;
