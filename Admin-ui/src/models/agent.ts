
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
  reportees?: Array<IAgent> | null;
  agentAuditTrail?: Array<IAgentAuditTrail>;
  peopleHeirarchy?: Array<IPeopleHierarchy> | null;
  total_count?: number;
  title: string | null;
  father_Husband_Nm?: string | null;
  employeeCode?: string | null;
  applicationDocketNo?: string | null;
  candidateType?: string | null;
  startDate?: string;
  appointmentDate?: string;
  incorporationDate?: string;
  agentTypeCategory?: string;
  agentClassification?: string;
  cmsAgentType?: string;
  channel_Name?: string;
  sub_Channel?: string;
  sec206abFlag?: boolean;
  panAadharLinkFlag?: Boolean;
  branchCode: string;
  branchName: string;
  confirmationDate: string,
  hrDoj: string,
  fgValueTrngDate: string,
  itSecPolicyTrngDate: string,
  npsTrngCompletionDate: string,
  whistleBlowerTrngDate: string,
  govPolicyTrngDate: string,
  inductionTrngDate: string,
  incrementDate: string,
  lastWorkingDate: string,
  lastPromotionDate: string,
  hSecPolicyTrngDate: string,
  licenseNo: string,
  licenseType: string,
  licenseIssueDate: string,
  licenseExpiryDate: string,
  cnctPersonName: string,
  ulipFlag: string,
  trainingGroupType: string,
  ifs: string,
  refresherTrainingCompleted: string,
  isMigrated: string,
  mainPartnerClientCode: string,
  agentMaincodevwEid: string,
  registrationDate: string,
  vertical: string,
}
export interface IAgentAuditTrail {
  agentCode: number;
  agentId: string;
  changedOn: string;
  filedName: string;
  oldValue: string;
  newValue: string;
  modifiedBy: string;
  modifiedDate: string;
  changeDescription: string;
}
export interface IPeopleHierarchy {
  agentId: number;
  agentCode: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  supervisors?: IPeopleHierarchy | null;
}
