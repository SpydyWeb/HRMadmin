
export interface AgentSearchRequest {
    searchCondition: string;
    zone: string;
}
export interface AgentSearchByCodeRequest {
    AgentCode: string;
}
export interface Agent {
  agentId: number;
  agentCode: string;
  agentTypeCode: string;
  agentSubTypeCode: string;
  agentName: string;
  businessName: string;
  firstName: string;
  middleName: string;x
  lastName: string;
  prefix: string;
  suffix: string;
  gender: string;
  dob: string; // can use Date if you parse it
  nationality: string;
  maritalStatusCode: string;
  preferredLanguage: string;
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
  maskedPanNumber: string;
  aadhaarNumber: string | null;
  irdaLicenseNumber: string | null;
  gstNumber: string | null;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  rowVersion: number;
  isActive: boolean;
  panNumber: string;
  email: string | null;
  mobileNo: string | null;
}