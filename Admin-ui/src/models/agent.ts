
export interface IAgentSearchRequest {
    searchCondition: string;
    zone: string;
}
export interface IAgentSearchByCodeRequest {
   searchCondition?: string
  zone?: string
  agentId?: number
  agentCode?: string
  pageNo?: number
  pageSize?: number
  sortColumn?: string
  sortDirection?: string
  FetchHierarchy?: boolean
}

export interface IAgent {
  agentId: number;
  agentCode: string;
  agentTypeCode: string | null;
  agentSubTypeCode: string | null;
  agentName: string;
  businessName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  prefix: string | null;
  suffix: string | null;
  gender: string | null;
  dob: string | null;
  nationality: string | null;
  maritalStatusCode: string | null;
  preferredLanguage: string | null;
  channelCode: string | null;
  subChannelCode: string | null;
  designationCode: string | null;
  agentLevel: string | null;
  locationCode: string | null;
  staffCode: string | null;
  supervisor_Id: number | null;
  contractedDate: string | null;
  agentStatusCode: string | null;
  statusDate: string | null;
  isLicensed: boolean;
  maskedPanNumber: string | null;
  aadhaar_number: string | null;
  irdaLicenseNumber: string | null;
  gstNumber: string | null;
  createdBy: string | null;
  createdDate: string;
  modifiedBy: string | null;
  modifiedDate: string | null;
  rowVersion: number | null;
  isActive: boolean;
  panNumber: string;
  email: string | null;
  mobileNo: string | null;
   supervisors?: Array<IAgent> | null; 
  reportees?: Array<IAgent>| null;  
  agentAuditTrail?: Array<any>;     
  peopleHeirarchy?: Array<IPeopleHierarchy> | null;
  total_count?: number;
}
export interface IPeopleHierarchy {
  agentId: number;
  agentCode: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  supervisors?: IPeopleHierarchy | null;
}
