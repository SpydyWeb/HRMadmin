
export interface IResponseHeader {

 errorCode: number;

 errorMessage: string;

}



// ================================

// Enums / Unions

// ================================

export type TCommissionStatus =

 | "Pending"

 | "Approved"

 | "Rejected";



// ================================

// Individual Commission

// ================================

export interface IIndividualCommission {

 commissionId: number;

 orgId: number;

 agentId: number;

 agentCode: string;

 agentName: string;

 status: TCommissionStatus;

 submittedOn: string; // ISO Date

 submittedBy: string | number;

}



// ================================

// Cycle Commission

// ================================

export interface ICycleCommission {

 cycleId: number;

 cycleCode: string;

 orgId: number;

 commissionType: "individual" | "corporate" | string;

 countOfEntities: number;

 avgCommission: number;

 nbRevenue: number;

 nbCommission: number;

}



// ================================

// Adhoc Commission

// ================================

export interface IAdhocCommission {

 adhocCommissionId: number;

 orgId: number;

 branchId: number;

 requestId: number;

 submittedOn: string; // ISO Date

 submittedBy: number;

 commissionDate: string; // ISO Date

 commissionAmount: number | null;

 reason: string | null;

}



// ================================

// Performance Snapshot

// ================================

export interface IPerformanceSnapshot {

 orgId: number;

 snapshotId: number;

 periodFrom: string; // ISO Date

 periodTo: string;  // ISO Date

 commissionBudget: number;

 commissionActual: number;

}



// ================================

// Commission Management Dashboard

// ================================

export interface ICommissionMgmtDashboard {

 orgId: number;



 // Summary Cards

 commissionBudget: number;

 commissionPaid: number;

 commissionOnHold: number;

 commissionNotPaid: number;



 // Cycle Metrics

 lastCycleCommission: number;

 lastCycleEntities: number;

 thisCycleCommission: number;

 thisCycleEntities: number;

 thisCycleAvgCommission: number;



 // Detail Sections

 individualCommissions: IIndividualCommission[];

 cycleCommissions: ICycleCommission[];

 adhocCommissions: IAdhocCommission[];

 performanceSnapshot: IPerformanceSnapshot[];



 // Optional / Future

 currentBusinessCycles?: any | null;

 onHoldPayouts?: any | null;

 channels?: any | null;

}

// ================================

// Commission process 

// ================================
export interface IProcessedRecordsLog {
  processId: number
  processedDate: string // ISO date string
  period: string
  recordsCount: number
  status: 'In Process' | 'Completed' | string
  canDownload: boolean
  canViewDetails: boolean
}
export interface IHoldRecords {
  holdId: number
  agentName: string 
  reason: string
  amount: number
  status: 'Released' | 'Hold' | string
  heldOn: string // ISO date string
  canRelease: boolean
}
export interface IAdjustRecords {
  adjustmentId: number
  date:string // ISO date string
  period: string 
  adjustmentType: string
  uploadedBy: string
  status: 'Rejected' | 'Approved' | string
  recordsCount: number 
}
export interface IApproveRecords {
  approvalId: number
  date:string // ISO date string
  period: string 
  submittedBy: string
  amount:number
  status: 'Pending' | 'Approved' | string
  canApprove: Boolean
  canDownload: Boolean 
}


// ================================

// Response Body

// ================================

export interface ICommissionMgmtResponseBody {

 commissionMgmtDashboards: ICommissionMgmtDashboard[];

}
export interface IProcessCommissionResponseBody {

orgId: number
  periodType: string
  processedRecordsLog: IProcessedRecordsLog[]

}
export interface IHoldCommissionResponseBody {
  orgId: number
  amountOnHold: number
  currentlyOnHold: number
  releasedThisMonth:number
  records: IHoldRecords[]

}
export interface IAdjustCommissionResponseBody {
  orgId: number
  approved: number
  pendingReview: number
  rejected:number
  totalRecords:number
  records: IAdjustRecords[]

}
export interface IApproveCommissionResponseBody {
  orgId: number
  totalAmountApproved: number
  totalRecords: number
  pendingApproval:number
  records: IApproveRecords[]

}
export interface IConfigCommissionResponseBody {
  commissionId: number
  commissionName: string
  status: string
}
export interface IConfigCommissionRequest {
  commissionName: string
  triggerCycle: 'daily' | 'monthly' | 'yearly' | 'quarterly'
  runFrom: string
  runTo: string
  createdAt?: string
}




// ================================

// Final API Response

// ================================

export interface ICommissionMgmtApiResponse {

 responseHeader: IResponseHeader;

 responseBody: ICommissionMgmtResponseBody;

}
