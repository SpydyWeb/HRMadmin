import React from "react";

import { Card, CardContent, CardHeader } from "../ui/card";
import Button from "../ui/button";
import { Eye, Download, Upload } from "lucide-react";

// Import types from your type file
import { 
  ICommissionMgmtDashboard,
  IIndividualCommission,
  ICycleCommission,
  IAdhocCommission, 
  IPerformanceSnapshot,
  TCommissionStatus
} from "@/models/commission"; // Adjust the import path as needed

/** ---------- Types ---------- */
// Removed DashboardResponse type as we're using ICommissionMgmtDashboard from the type file

interface CommissionOverviewProps {
  dashboardData: ICommissionMgmtDashboard; // Using the imported type
}

/** ---------- Helpers ---------- */
function formatDate(input?: string) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatMoney(value?: number) {
  const v = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

type Field = { label: string; value: React.ReactNode };

type ActionButton = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  /** visual intent */
  tone?: "primaryBlue" | "primaryGreen" | "dangerOutline" | "neutral";
  fullWidth?: boolean;
};

type CommissionActionCardProps = {
  title: string;
  statusText: string;
  statusTone?: "pending" | "approved" | "rejected";
  fields: Field[];
  /** row of 2 buttons like Reject/Approve OR single "Review Now" */
  mainActions?: ActionButton[];
  /** bottom row actions like Download/Upload or View Agent Details */
  bottomActions?: ActionButton[];
};

function StatusPill({
  text,
  tone = "pending",
}: {
  text: string;
  tone?: "pending" | "approved" | "rejected";
}) {
  const cls =
    tone === "approved"
      ? "bg-green-100 text-green-700"
      : tone === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-red-100 text-red-600"; // pending in reference looks red-ish

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold ${cls}`}
      style={{ lineHeight: "14px" }}
    >
      {text}
    </span>
  );
}

function StyledActionButton({ btn }: { btn: ActionButton }) {
  const base =
    "h-10 rounded-xs text-sm font-semibold flex items-center justify-center gap-2";

  const toneCls =
    btn.tone === "primaryGreen"
      ? "bg-green-600 hover:bg-green-700 text-white"
      : btn.tone === "primaryBlue"
      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
      : btn.tone === "dangerOutline"
      ? "border border-red-300 text-red-600 hover:bg-red-50 bg-white"
      : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white";

  return (
    <button
      type="button"
      onClick={btn.onClick}
      className={`${base} ${toneCls} ${btn.fullWidth ? "w-full" : ""}`}
    >
      {btn.icon}
      {btn.label}
    </button>
  );
}

function CommissionActionCard({
  title,
  statusText,
  statusTone = "pending",
  fields,
  mainActions = [],
  bottomActions = [],
}: CommissionActionCardProps) {
  return (
    <div className="rounded-xl bg-gray-100 p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <StatusPill text={statusText} tone={statusTone} />
      </div>

      {/* Fields (2 columns like reference) */}
      <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-4">
        {fields.map((f, idx) => (
          <div key={idx}>
            <div className="text-xs text-gray-400">{f.label}</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Actions */}
      {mainActions.length > 0 && (
        <div className="mt-5">
          {mainActions.length === 1 ? (
            <StyledActionButton btn={{ ...mainActions[0], fullWidth: true }} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {mainActions.slice(0, 2).map((b, i) => (
                <StyledActionButton key={i} btn={{ ...b, fullWidth: true }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      {bottomActions.length > 0 && (
        <div className="mt-3">
          {bottomActions.length === 1 ? (
            <StyledActionButton
              btn={{ ...bottomActions[0], tone: "neutral", fullWidth: true }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {bottomActions.slice(0, 2).map((b, i) => (
                <StyledActionButton key={i} btn={{ ...b, fullWidth: true }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** ---------- Main Component ---------- */
const CommissionOverview: React.FC<CommissionOverviewProps> = ({
  dashboardData,
}) => {
  const companyData = [
    {
      name: "Commissioned Budget",
      value: formatMoney(dashboardData?.commissionBudget),
      color: "text-indigo-600",
    },
    {
      name: "Commissioned Paid",
      value: formatMoney(dashboardData?.commissionPaid),
      color: "text-green-600",
    },
    {
      name: "Total Commissions on Hold",
      value: formatMoney(dashboardData?.commissionOnHold),
      color: "text-red-600",
    },
    {
      name: "Commissions Not Paid (Bank issue)",
      value: formatMoney(dashboardData?.commissionNotPaid),
      color: "text-red-600",
    },
  ];

  // pick first items (as your UI shows 1 card each)
  const individual = dashboardData?.individualCommissions?.[0];
  const cycle = dashboardData?.cycleCommissions?.[0];
  const adhoc = dashboardData?.adhocCommissions?.[0];

  const requestDateFromSnapshot =
    dashboardData?.performanceSnapshot?.[0]?.periodTo;

  return (
    <Card className="px-0 py-3 gap-2 mb-5 rounded-md border border-gray-100">
      {/* Summary Cards */}
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
        {companyData.map((data, index) => (
          <div
            key={index}
            className="rounded-xl bg-gray-100 p-5 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500">
                {data.name}
              </div>
              <div className={`mt-2 text-2xl font-bold ${data.color}`}>
                {data.value}
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* 3 Commission Cards (match image layout) */}
      <CardHeader className="px-4 pt-2 pb-0" />

      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Individual Commission */}
          <CommissionActionCard
            title="Individual Commission"
            statusText={individual?.status ?? "Pending"}
            statusTone={
              (individual?.status ?? "Pending").toLowerCase() === "approved"
                ? "approved"
                : (individual?.status ?? "Pending").toLowerCase() === "rejected"
                ? "rejected"
                : "pending"
            }
            fields={[
              { label: "Agent Name:", value: individual?.agentName ?? "-" },
              { label: "Agent Code:", value: individual?.agentCode ?? "-" },
              { label: "Submitted On:", value: formatDate(individual?.submittedOn) },
              { label: "Submitted By:", value: String(individual?.submittedBy ?? "-") },
            ]}
            mainActions={[
              {
                label: "Reject",
                tone: "dangerOutline",
                onClick: () => console.log("Reject individual", individual),
              },
              {
                label: "Approve",
                tone: "primaryGreen",
                onClick: () => console.log("Approve individual", individual),
              },
            ]}
            bottomActions={[
              {
                label: "View Agent Details",
                icon: <Eye size={16} />,
                tone: "neutral",
                onClick: () => console.log("View Agent Details", individual),
              },
            ]}
          />

          {/* Cycle Commission */}
          <CommissionActionCard
            title="Cycle Commission"
            statusText="Pending"
            statusTone="pending"
            fields={[
              { label: "Request Date:", value: formatDate(requestDateFromSnapshot) },
              { label: "Cycle Code:", value: cycle?.cycleCode ?? "-" },
              { label: "Total Records:", value: cycle?.countOfEntities ?? "-" },
              { label: "Submitted By:", value: "-" },
            ]}
            mainActions={[
              {
                label: "Review Now",
                icon: <Eye size={16} />,
                tone: "primaryBlue",
                onClick: () => console.log("Review cycle", cycle),
              },
            ]}
            bottomActions={[
              {
                label: "Download Template",
                icon: <Download size={16} />,
                tone: "neutral",
                onClick: () => console.log("Download Template", cycle),
              },
              {
                label: "Upload Changes",
                icon: <Upload size={16} />,
                tone: "neutral",
                onClick: () => console.log("Upload Changes", cycle),
              },
            ]}
          />

          {/* Adhoc Commission Processing */}
          <CommissionActionCard
            title="Adhoc Commission Processing"
            statusText="Pending"
            statusTone="pending"
            fields={[
              { label: "Request ID:", value: adhoc?.requestId ?? "-" },
              { label: "Submitted By:", value: String(adhoc?.submittedBy ?? "-") },
              { label: "Submitted Date:", value: formatDate(adhoc?.submittedOn) },
              { label: "Commission Date:", value: formatDate(adhoc?.commissionDate) },
            ]}
            mainActions={[
              {
                label: "Review Now",
                icon: <Eye size={16} />,
                tone: "primaryBlue",
                onClick: () => console.log("Review adhoc", adhoc),
              },
            ]}
            bottomActions={[
              {
                label: "Download Template",
                icon: <Download size={16} />,
                tone: "neutral",
                onClick: () => console.log("Download Template", adhoc),
              },
              {
                label: "Upload Changes",
                icon: <Upload size={16} />,
                tone: "neutral",
                onClick: () => console.log("Upload Changes", adhoc),
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export { CommissionOverview };