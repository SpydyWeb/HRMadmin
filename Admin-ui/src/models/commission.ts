
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

// Response Body

// ================================

export interface ICommissionMgmtResponseBody {

 commissionMgmtDashboards: ICommissionMgmtDashboard[];

}



// ================================

// Final API Response

// ================================

export interface ICommissionMgmtApiResponse {

 responseHeader: IResponseHeader;

 responseBody: ICommissionMgmtResponseBody;

}
