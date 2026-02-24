// Mapping from field names to control IDs (cntrlid) from the API
// This maps the field names used in the UI to the cntrlid values returned by the allowUiAccess API
export const FIELD_TO_CNTRLID_MAP: Record<string, number> = {
  // Personal Details fields
  'gender': 1010, // Agent Gender
  'title': 1011,
  'firstName': 1012,
  'middleName': 1013,
  'lastName': 1014,
  'father_Husband_Nm': 1015,
  
  // Financial Details fields
  // Updated to match actual API response
  'bankName': 1088, // Matches API: "Bank Name" (cntrlid: 1088)
  'factoringHouse': 1089, // Matches API: "Factoring House" (cntrlid: 1089)
  'accountNumber': 1090, // Matches API: "Bank AccountNo" (cntrlid: 1090)
  'ifsc': 1091, // Matches API: "IFSC Code" (cntrlid: 1091)
  'preferredPaymentMode': 1093, // Matches API: "Payment Mode" (cntrlid: 1093)
  // Fields not in current API response (will default to visible/editable):
  'accountType': 1092, // Bank Account Type - REMOVED from API, will default to visible
  'micr': 1097, // MICR Code - not in API, will default to visible
  'accountHolderName': 1098, // Payee Name - not in API, will default to visible
  'branchName': 1099, // Branch Name - not in API, will default to visible
  'panNumber': 1094,
  'taxStatus': 1102,
  'serviceTaxNo': 1103,
  'panAadharLinkFlag': 1104,
  'sec206abFlag': 1105,
  
  // Contact Information fields
  'mobileNo': 1020,
  'workContactNo': 1021,
  'residenceContactNo': 1022,
  'email': 1023,
  'cnctPersonName': 1024,
  'cnctPersonMobileNo': 1025,
  'cnctPersonEmail': 1026,
  'cnctPersonDesig': 1027,
  
  // Employee Information fields
  'agentId': 1030,
  'agentCode': 1031,
  'applicationDocketNo': 1032,
  'candidateType': 1033,
  'agentType': 1034,
  'employeeCode': 1035,
  'startDate': 1036,
  'appointmentDate': 1037,
  'incorporationDate': 1038,
  'agentTypeCat': 1039,
  'agentClass': 1040,
  'cmsAgentType': 1041,
  
  // Other Personal Details fields
  'dateOfBirth': 1050,
  'maritalStatus': 1051,
  'education': 1052,
  'workProfile': 1053,
  'annualIncome': 1054,
  'nomineeName': 1055,
  'relationship': 1056,
  'nomineeAge': 1057,
  'occupation': 1058,
  'urn': 1059,
  'additionalComment': 1060,
  'bloodGroup': 1061,
  'birthPlace': 1062,
  
  // Address fields
  'addressType': 1070,
  'addressLine1': 1071,
  'addressLine2': 1072,
  'addressLine3': 1073,
  'city': 1074,
  'state': 1075,
  'stateEid': 1076,
  'country': 1077,
  'pin': 1078,
  
  // Channel/Agent Action fields
  'channel': 1080,
  'subChannel': 1081,
  'commissionClass': 1082,
  'locationCode': 1083,
  'designationCode': 1084,
}

// Reverse mapping: cntrlid to field name (for quick lookup)
export const CNTRLID_TO_FIELD_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(FIELD_TO_CNTRLID_MAP).map(([field, cntrlid]) => [cntrlid, field])
)

// Helper function to get cntrlid from field name
export const getCntrlId = (fieldName: string): number | undefined => {
  return FIELD_TO_CNTRLID_MAP[fieldName]
}

// Helper function to get field name from cntrlid
export const getFieldName = (cntrlid: number): string | undefined => {
  return CNTRLID_TO_FIELD_MAP[cntrlid]
}
