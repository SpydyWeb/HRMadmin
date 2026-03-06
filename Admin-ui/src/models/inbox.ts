export enum SrStatus {
  Created = 1,
  PendingDecision = 2,
  Approved = 3,
  Rejected = 4,
}

export interface IInboxRequest {
  srStatus?: SrStatus | null
  createdDateFrom?: string | null
  createdDateTo?: string | null
  srNo?: number | null
  pageNo?: number
  pageSize?: number
  agentCode?: string | null
  allocateToRole?: number | null
}
export interface IResponseHeader {

  errorCode: number;
 
  errorMessage: string;
 
 }

export interface IInboxItem {
  srNo: number
  orgId: number
  requestDets?: string | null
  requestorNote?: string | null
  createdBy: number
  createdDate?: string | null
  srStatus: SrStatus
  statusUpdatedBy?: number | null
  statusModifiedOn?: string | null
  controlId: number
  allocatedToRole?: number | null
  createdByUsername?: string | null
}

export interface IInboxResponseBody {
  inboxData: IInboxItem[]
}

