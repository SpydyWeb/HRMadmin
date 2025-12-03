export interface IAgentSearchRequest {
  searchCondition: string
  zone: string
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

// export interface IAgent {
//   agentId: number
//   agentCode: string
//   agentTypeCode: string | null
//   agentSubTypeCode: string | null
//   agentName: string
//   businessName: string | null
//   firstName: string | null
//   middleName: string | null
//   lastName: string | null
//   prefix: string | null
//   suffix: string | null
//   gender: string | null
//   dob: string | null
//   nationality: string | null
//   maritalStatusCode: string | null
//   preferredLanguage: string | null
//   channelCode: string | null
//   subChannelCode: string | null
//   designationCode: string | null
//   agentLevel: string | null
//   locationCode: string | null
//   staffCode: string | null
//   supervisor_Id: number | null
//   contractedDate: string | null
//   agentStatusCode: string | null
//   statusDate: string | null
//   isLicensed: boolean
//   maskedPanNumber: string | null
//   aadhaar_number: string | null
//   irdaLicenseNumber: string | null
//   gstNumber: string | null
//   createdBy: string | null
//   createdDate: string
//   modifiedBy: string | null
//   modifiedDate: string | null
//   rowVersion: number | null
//   isActive: boolean
//   panNumber: string
//   email: string | null
//   mobileNo: string | null
//   supervisors?: Array<IAgent> | null
//   reportees?: Array<IAgent> | null
//   agentAuditTrail?: Array<IAgentAuditTrail>
//   peopleHeirarchy?: Array<IPeopleHierarchy> | null
//   total_count?: number
//   title: string | null
//   father_Husband_Nm?: string | null
//   employeeCode?: string | null
//   applicationDocketNo?: string | null
//   candidateType?: string | null
//   startDate?: string
//   appointmentDate?: string
//   incorporationDate?: string
//   agentTypeCategory?: string
//   agentClassification?: string
//   cmsAgentType?: string
//   channel_Name?: string
//   sub_Channel?: string
//   sec206abFlag?: boolean
//   panAadharLinkFlag?: Boolean
//   branchCode: string
//   branchName: string
//   confirmationDate: string
//   hrDoj: string
//   fgValueTrngDate: string
//   itSecPolicyTrngDate: string
//   npsTrngCompletionDate: string
//   whistleBlowerTrngDate: string
//   govPolicyTrngDate: string
//   inductionTrngDate: string
//   incrementDate: string
//   lastWorkingDate: string
//   lastPromotionDate: string
//   hSecPolicyTrngDate: string
//   licenseNo: string
//   licenseType: string
//   licenseIssueDate: string
//   licenseExpiryDate: string
//   cnctPersonName: string
//   ulipFlag: string
//   trainingGroupType: string
//   ifs: string
//   refresherTrainingCompleted: string
//   isMigrated: string
//   mainPartnerClientCode: string
//   agentMaincodevwEid: string
//   registrationDate: string
//   vertical: string
//   licenseStatus: Boolean
//   // bank
//   bank: string
//   factoringHouse: string
//   payeeName: string
//   panNo: string
//   "bankDetails": {
//   bankName: string
//   branchName: string
//   accountNumber: string
//   accountType: string
//   micr: string
//   ifsc: string
//   paymentMode: string
//   serviceTaxNo: string
//   accountHolderName: string
//   factoringHouse: string}
//   // ====== Employment Details ======
// pob?: string | null
// aadharNumber?: string | null
// educationQualification?: string | null
// educationSpecialization?: string | null
// educationalInstitute?: string | null
// passingYear?: string | null
// criminalRecord?: string | null
// employmentType?: string | null
// employmentStatus?: string | null
// experienceYears?: string | null
// uanNumber?: string | null
// reportingToName?: string | null
// reportingToDesignation?: string | null

// // ====== Channel Details ======
// channelRegion?: string | null
// commissionClass?: string
// cluster?: string | null
// branch?: string | null     // already have branchCode/branchName — this is different
// baseLocation?: string | null
// zone?: string | null
// irdaTrainingOrganization?: string | null

// // ====== Hierarchy ======
// rmName?: string | null
// rmMobile?: string | null
// rmEmail?: string | null

// smName?: string | null
// smMobile?: string | null
// smEmail?: string | null

// asmName?: string | null
// asmMobile?: string | null
// asmEmail?: string | null

// branchManagerName?: string | null
// branchManagerMobile?: string | null
// branchManagerEmail?: string | null

// // ====== Nomination ======
// nomineeName?: string | null
// nomineeRelation?: string | null
// nomineeDob?: string | null
// nomineeAadhar?: string | null
// nomineeMobile?: string | null
// nomineeEmail?: string | null
// nomineeAddress?: string | null

// // ====== Other Personal Info ======
// religion?: string | null
// caste?: string | null
// physicallyChallenged?: string | null
// bloodGroup?: string | null
// birthIdentificationMark?: string | null

// // ====== Financial Details ======
// confirmAccountNumber?: string | null   // NEW FIELD
// bankAddress?: string | null
// micrCode?: string | null              // different from existing micr

// // ====== Contact Details ======        // you have mobileNo (keep both)
// residenceContactNo?: string | null
// workContactNo?: string | null
// landlineNumber?: string | null
// cnctPersonName?: string | null
// emergencyContactNumber?: string | null
// emergencyContactRelation?: string | null

// // ====== Address ======
// permanentAddress?: string | null
// permanentState?: string | null
// permanentDistrict?: string | null
// permanentCity?: string | null
// permanentPincode?: string | null

// correspondenceAddress?: string | null
// correspondenceState?: string | null
// correspondenceDistrict?: string | null
// correspondenceCity?: string | null
// correspondencePincode?: string | null

// sameAsPermanent?: boolean | null
// }

export interface IAgent {
  agentId: number
  agentCode: string
  agentTypeCode: string | null
  agentSubTypeCode: string | null
  agentName: string
  businessName: string | null
  maritalStatusCode: string

  firstName: string | null
  middleName: string | null
  lastName: string | null
  prefix: string | null
  suffix: string | null
  gender: string | null
  commissionClass: string | null

  nationality: string | null

  preferredLanguage: string | null

  // Channel / Hierarchy Codes
  channelCode: string | null
  subChannelCode: string | null

  agentLevel: string | null
  locationCode: string | null
  staffCode: string | null

  supervisor_Id: number | null
  contractedDate: string | null
  agentStatusCode: string | null
  statusDate: string | null

  isLicensed: boolean
  maskedPanNumber: string | null
  aadhaar_number: string | null
  irdaLicenseNumber: string | null
  gstNumber: string | null

  createdBy: string | null
  createdDate: string
  modifiedBy: string | null
  modifiedDate: string | null
  rowVersion: number | null
  isActive: boolean

  email: string | null

  supervisors?: IAgent[] | null
  reportees?: IAgent[] | null

  agentAuditTrail?: any[]
  peopleHeirarchy?: any[]
  total_count?: number

  title?: string | null
  father_Husband_Nm?: string | null

  employeeCode?: string | null
  applicationDocketNo?: string | null
  candidateType?: string | null
  startDate?: string | null
  appointmentDate?: string | null
  incorporationDate?: string | null

  agentTypeCategory?: string | null
  agentClassification?: string | null
  cmsAgentType?: string | null

  channel_Name?: string | null
  sub_Channel?: string | null

  // Flags & Metadata
  ulipFlag: boolean
  trainingGroupType: string
  ifs: string
  refresherTrainingCompleted: boolean
  isMigrated: boolean
  mainPartnerClientCode: string
  agentMaincodevwEid: string
  registrationDate: string
  vertical: string

  branchCode: string

  // Trainings
  ic36TrngCompletionDate: string
  sTrngCompletionDate: string
  confirmationDate: string
  fgRockstarTrainingDate: string
  incrementDate: string
  lastPromotionDate: string
  hrDoj: string
  fgValueTrngDate: string
  hSecPolicyTrngDate: string
  itSecPolicyTrngDate: string
  npsTrngCompletionDate: string
  whistleBlowerTrngDate: string
  govPolicyTrngDate: string
  inductionTrngDate: string
  lastWorkingDate: string

  // Licensing
  licenseNo: string
  licenseType: string
  licenseIssueDate: string
  licenseExpiryDate: string
  licenseStatus: string | boolean

  // Contact Person
  cnctPersonDesig?: string
  cnctPersonMobileNo?: string
  cnctPersonEmail?: string
  cnctPersonName?: string

  // Backend bankAccounts (raw)
  bankAccounts?: IBankAccount[]

  // ===== Additional UI Fields You Added Manually =====
  pob?: string | null
  aadharNumber?: string | null
  educationQualification?: string | null
  educationSpecialization?: string | null
  educationalInstitute?: string | null
  passingYear?: string | null
  criminalRecord?: string | null
  employmentType?: string | null
  employmentStatus?: string | null
  experienceYears?: string | null
  uanNumber?: string | null
  reportingToName?: string | null
  reportingToDesignation?: string | null

  channelRegion?: string | null
  cluster?: string | null
  baseLocation?: string | null
  zone?: string | null
  irdaTrainingOrganization?: string | null

  rmName?: string | null
  rmMobile?: string | null
  rmEmail?: string | null
  smName?: string | null
  smMobile?: string | null
  smEmail?: string | null
  asmName?: string | null
  asmMobile?: string | null
  asmEmail?: string | null
  branchManagerMobile?: string | null
  branchManagerEmail?: string | null

  religion?: string | null
  caste?: string | null
  physicallyChallenged?: string | null

  birthIdentificationMark?: string | null

  workContactNo?: string | null
  residenceContactNo?: string | null

  // Financial
  panAadharLinkFlag?: boolean
  sec206abFlag?: boolean
  taxStatus: string
  serviceTaxNo: string
  keyValueEntry: IkeyValueEntry[]
  //Acct Activation Date missing
  factoringHouse: string
  accountHolderName: string
  panNumber?: string
  bankName?: string
  branchName: string
  accountNumber: string
  accountType: string
  micr: string
  ifsc: string
  preferredPaymentMode: string

  // heirarchy

  designationCode: string | null
  designation: string | null

  //Other personal details
  dob: string | null
  martialStatus: string | null
  educationCode: string | null
  educationLevel: string | null
  workProfile: string | null
  annualIncome: string | null
  // Nominees
  nominees?: IAgentNominees[]
  nomineeName?: string | null
  relationship?: string | null
  nomineeAge?: number | null
  occupation?: string | null
  urn?: string | null
  additionalComment?: string | null
  // Personal Info (backend nested)
  personalInfo?: IPersonalInfo[]
  workExpMonths: number
  bloodGroup: string
  birthPlace: string
  dateOfBirth: string

  // address
  permanentAddres: IpermanentAddres[]
  stateEid?: string | null
  addressType: string | null
  addressLine1?: boolean | null
  addressLine2?: boolean | null
  addressLine3?: boolean | null
  city?: string | null
  country?: string | null
  pin?: string | null
  state?: string | null
}

export interface IpermanentAddres {
  addressType: string
  refKey: string
  refType: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  state: string
  country: string
  pin: string
  landmark: string
}
export interface IBankAccount {
  accountHolderName: string
  accountNumber: string
  ifsc: string
  micr: string
  bankName: string
  branchName: string
  accountType: string
  activeSince: string
  factoringHouse: string
  preferredPaymentMode: string
}
export interface IkeyValueEntry {
  orgId: number
  entryCategory: string
  entryIdentity: number
  entryDesc: string
  entryParentId: number
  activeStatus: boolean
}
export interface IAgentNominees {
  nomineeID: string
  nomineeName: string
  relationship: string
  nomineeAge: number
}
export interface IPersonalInfo {
  dateOfBirth: string
  panNumber: string
  email: string
  mobileNo: string
  workContactNo: string
  residenceContactNo: string
  bloodGroup: string
  birthPlace: string
  martialStatus: string
  educationCode: string
  educationLevel: string
  workProfile: string
  annualIncome: string
  workExpMonths: number
}
export interface IAgentAuditTrail {
  agentCode: number
  agentId: string
  changedOn: string
  filedName: string
  oldValue: string
  newValue: string
  modifiedBy: string
  modifiedDate: string
  changeDescription: string
}
export interface IPeopleHierarchy {
  agentId: number
  agentCode: string | null
  firstName: string | null
  middleName: string | null
  lastName: string | null
  supervisors?: IPeopleHierarchy | null
}
