export interface IInboxRequest {
  srStatus?: number | null
  createdDateFrom?: string | null
  createdDateTo?: string | null
  srNo?: number | null
}
export interface IResponseHeader {

  errorCode: number;
 
  errorMessage: string;
 
 }

export interface IInboxItem {
  srNo: number
  orgId: number
  requestDets: string
  requestorNote: string
  createdBy: number
  createdDate: string
  srStatus: number
  statusUpdatedBy: number
  statusModifiedOn: string
  controlId: number
  allocatedToRole: number
  createdByUsername: string
}

export interface IInboxResponseBody {
  inboxData: IInboxItem[]
}

