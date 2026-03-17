
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

export interface IPerformanceSnapshot {

 orgId: number;

 snapshotId: number;

 periodFrom: string; 

 periodTo: string; 

 commissionBudget: number;

 commissionActual: number;

}

export interface ICommissionMgmtDashboard {

 orgId: number;

 commissionBudget: number;

 commissionPaid: number;

 commissionOnHold: number;

 commissionNotPaid: number;

 lastCycleCommission: number;

 lastCycleEntities: number;

 thisCycleCommission: number;

 thisCycleEntities: number;

 thisCycleAvgCommission: number;

 individualCommissions: IIndividualCommission[];

 cycleCommissions: ICycleCommission[];

 adhocCommissions: IAdhocCommission[];

 performanceSnapshot: IPerformanceSnapshot[];

 currentBusinessCycles?: any | null;

 onHoldPayouts?: any | null;

 channels?: any | null;

}

export interface IProcessCommissionList {
  totalCount: number
  orgId:number
  downloadLnk:null
  finishedAt: string
  records: number
  exeStatus: string
  startedAt: string
  commissionName: string
  jobConfigId:number
  jobExeHistId:number
}
export interface IHoldRecords {
  holdId: number
  agentName: string 
  reason: string
  amount: number
  status: 'Released' | 'Hold' | string
  heldOn: string 
  canRelease: boolean
}
export interface IAdjustRecords {
  adjustmentId: number
  date:string 
  period: string 
  adjustmentType: string
  uploadedBy: string
  status: 'Rejected' | 'Approved' | string
  recordsCount: number 
}
export interface IApproveRecords {
  approvalId: number
  date:string 
  period: string 
  submittedBy: string
  amount:number
  status: 'Pending' | 'Approved' | string
  canApprove: Boolean
  canDownload: Boolean 
}

export interface ICommissionMgmtResponseBody {

 commissionMgmtDashboards: ICommissionMgmtDashboard[];

}
export interface IProcessCommissionResponseBody {

  pagination:{}
  processCommissionList: IProcessCommissionList[]

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
export interface ICommissionConfigItem {
  commissionConfigId: number
  commissionName: string
  status: string
}

export interface IConfigCommissionResponseBody {
  commissionConfig: ICommissionConfigItem[]
}
export interface IConfigCommissionRequest {
  commissionName: string
  runFrom: string
  runTo: string
  createdAt?: string
  comments:string
  filterConditions?: string
  commissionConfigId?: number
  targetType: string
  targetMethod: string

}
export interface IexecutiveJobListResponseBody {
  jobConfigId: number
  jobType: string
  jobExeHistId:number
  startedAt:string
  finishedAt:string
  exeStatus: 'SUCCESS' | 'FAILED' | string
  downloadLink:string
  duration:string
  
}
export interface IExecutiveHistoryResponseBody {
  executiveJobList: IexecutiveJobListResponseBody[]
}
export interface IExecutiveHistoryRequest {
  jobConfigId: number
}

export interface IUpdateCronRequest {
  commissionConfigId: number
  jobType: string
  triggerType: string
  cronExpression: string
}
export interface IUpdateStatusRequest {
  commissionConfigId: number
  enabled: boolean
}
export interface IConfigCommissionListRequest {
  pageNumber: number
  pageSize: number
}
export interface IProcessCommissionRequest {
  pageNumber: number
  pageSize: number
}
export interface IDownloadRecordRequest {
  jobExeHistId: number
}
export interface ICommissionSearchFieldsRequest {
  commissionConfigId: number
}

export interface ICommissionField {
  propertyName: string
  columnName: string
  description: string
  dataType: 'number' | 'string' | 'date'
  isNullable: boolean
}

export interface ICommissionMetadata {
  agent?: ICommissionField[]
  commrate?: ICommissionField[]
  owner?: ICommissionField[]
  insured?: ICommissionField[]
  customer?: ICommissionField[]
  premium?: ICommissionField[]
  policy?: ICommissionField[]
  lastExec?: ICommissionField[]
  [key: string]: ICommissionField[] | undefined
}

export interface ICommissionSearchFieldsResponseBody {
  metaDataResponse: ICommissionMetadata[]
}

export interface IFileDownload {
  fileName: string
  contentType: string
  fileBase64: string
  fileSize: number
}

export interface IDownloadRecordResponseBody {
  fileDownload: IFileDownload | null
}

export interface ICommissionMgmtApiResponse {

 responseHeader: IResponseHeader;

 responseBody: ICommissionMgmtResponseBody | IDownloadRecordResponseBody;

}
