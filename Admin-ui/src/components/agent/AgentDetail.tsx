import React, { useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'
import AutoAccordionSection from '../ui/autoAccordianSection'
import { MASTER_DATA_KEYS } from '@/utils/constant';

// import { BiIdCard } from 'react-icons/bi'
type AgentDetailProps = {
  agent: any;
  masterData: Record<string, any[]>;
  getDescription: (key: string, id: string | number) => string;
  getOptions: (key: string) => { label: string; value: string }[];
};

const AgentDetail = ({ agent, masterData, getDescription,getOptions }:AgentDetailProps )=>{
  const [isEdit, setIsEdit] = useState(false) 

 const genderOptions = getOptions("GENDER");
 console.log("genderOptions",genderOptions)
const educationOptions = getOptions("EDUCATION");
const maritalOptions = getOptions("MARITAL_STATUS");
const bankOptions = getOptions("BANK_ACC_TYPE");




//   const toOptions = (list?: IkeyValueEntry[] ) => {
//   return list?.filter(x => x.activeStatus).map(x => ({
//     label: x.entryDesc,
//     value: String(x.entryIdentity)
//   })) || []
// }

// const genderOptions = toOptions(agent.genders)
// const titleOptions = toOptions(agent.titles)
// const occupationOptions = toOptions(agent.occupations)
// const maritalOptions = toOptions(agent.maritalStatuses)
// const educationOptions = toOptions(agent.educationCodes)
// const stateOptions = toOptions(agent.stateNames)
// const countryOptions = toOptions(agent.countries)
// const channelOptions = toOptions(agent.channelNames)
// const subChannelOptions = toOptions(agent.subChannels)
// const agentTypeCategoryOptions = toOptions(agent.agentTypeCategories)
// const agentClassificationOptions = toOptions(agent.agentClassifications)
// const bankAccountTypeOptions = toOptions(agent.bankAccType)

const genderId = agent.genders?.find(g => g.entryDesc === agent.gender)?.entryIdentity;
const titleId = agent.titles?.find(t => t.entryDesc === agent.title)?.entryIdentity;
const occupationId = agent.occupations?.find(o => o.entryDesc === "Student")?.entryIdentity;
// const occupationId = agent.occupations?.find(o => o.entryDesc === agent.occupation)?.entryIdentity;
// const maritalStatusId = agent.maritalStatuses?.find(m => m.entryDesc === agent.maritalStatusCode)?.entryIdentity;
const maritalStatusId = agent.maritalStatuses
  ?.find(m => m.entryDesc?.[0]?.toUpperCase() === agent.maritalStatusCode?.[0]?.toUpperCase())
  ?.entryIdentity;
// const educationCodeId = agent.educationCodes?.find(e => e.entryDesc === agent.educationCode)?.entryIdentity;
const educationCodeId = agent.educationCodes?.find(e => e.entryDesc === "Doctorate (Ph.D.)")?.entryIdentity;
const educationLevelId = agent.educationCodes?.find(e => e.entryDesc === "Doctorate (Ph.D.)")?.entryIdentity;
const stateId = agent.stateNames?.find(s => s.entryDesc === "Karnataka")?.entryIdentity;
// const stateId = agent.stateNames?.find(s => s.entryDesc === agent.state)?.entryIdentity;
const countryId = agent.countries?.find(c => c.entryDesc === "India")?.entryIdentity;
// const countryId = agent.countries?.find(c => c.entryDesc === agent.country)?.entryIdentity;
// const channelId = agent.channelNames?.find(c => c.entryDesc === agent.channel_Name)?.entryIdentity;
const channelId = agent.channelNames?.find(c => c.entryDesc === "Broker")?.entryIdentity;
const subChannelId = agent.subChannels?.find(s => s.entryDesc === "Field Agent")?.entryIdentity;
// const subChannelId = agent.subChannels?.find(s => s.entryDesc === agent.sub_Channel)?.entryIdentity;
const agentTypeCategoryId = agent.agentTypeCategories?.find(a => a.entryDesc === "Individual")?.entryIdentity;
// const agentTypeCategoryId = agent.agentTypeCategories?.find(a => a.entryDesc === agent.agentTypeCategory)?.entryIdentity;
const agentClassificationId = agent.agentClassifications?.find(a => a.entryDesc === agent.agentClassification)?.entryIdentity;
// const bankAccountTypeId = agent.bankAccType?.find(b => b.entryDesc === "Savings Account")?.entryIdentity;
// const bankAccountTypeId = agent.bankAccType?.find(b => b.entryDesc === agent.bankAccounts?.[0]?.accountType)?.entryIdentity;


  console.log('agent', agent)

  if (!agent) return null

  console.log("agent", agent)

  const agentForm = useAppForm({
    defaultValues: {
      // ---- Already existing fields ----

      //Employment details
      agentId: agent.agentId,
      applicationDocketNo: agent.applicationDocketNo,
      agentCode: agent.agentCode,
      candidateType: agent.candidateType,
      agentTypeCode: agent.agentTypeCode,
      employeeCode: agent.employeeCode,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      agentTypeCategory: agent.agentTypeCategory,
      agentClassification: agent.agentClassification,
      cmsAgentType: agent.cmsAgentType,

      title: agent.title,
      firstName: agent.firstName,
      middleName: agent.middleName,
      lastName: agent.lastName,
      agentName: agent.agentName,
      email: agent.email,
      gender: agent.gender,

      nationality: agent.nationality,

      preferredLanguage: agent.preferredLanguage,
      father_Husband_Nm: agent.father_Husband_Nm,

      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,

      // ---- NEW FIELDS ADDED BELOW ----

      // --- contact DETAILS ---
      mobileNo:agent?.personalInfo?.[0]?.mobileNo,
      workContactNo:agent?.personalInfo?.[0]?.workContactNo,
      // --- EMPLOYMENT DETAILS ---

      pob: agent.pob,
      aadharNumber: agent.aadharNumber,
      educationQualification: agent.educationQualification,
      educationSpecialization: agent.educationSpecialization,
      educationalInstitute: agent.educationalInstitute,
      passingYear: agent.passingYear,
      criminalRecord: agent.criminalRecord,
      employmentType: agent.employmentType,
      employmentStatus: agent.employmentStatus,
      experienceYears: agent.experienceYears,
      uanNumber: agent.uanNumber,
      reportingToName: agent.reportingToName,
      reportingToDesignation: agent.reportingToDesignation,

      // --- CHANNEL DETAILS ---
      channelRegion: agent.channelRegion,
      commissionClass: agent.commissionClass,
      cluster: agent.cluster,
      branchCode: agent.branchCode,
      baseLocation: agent.baseLocation,
      zone: agent.zone,
      irdaTrainingOrganization: agent.irdaTrainingOrganization,

      // --- HIERARCHY ---
      rmName: agent.rmName,
      rmMobile: agent.rmMobile,
      rmEmail: agent.rmEmail,
      smName: agent.smName,
      smMobile: agent.smMobile,
      smEmail: agent.smEmail,
      asmName: agent.asmName,
      asmMobile: agent.asmMobile,
      asmEmail: agent.asmEmail,
      branchManagerMobile: agent.branchManagerMobile,
      branchManagerEmail: agent.branchManagerEmail,

      // --- OTHER PERSONAL INFO ---
      religion: agent.religion,
      caste: agent.caste,
      physicallyChallenged: agent.physicallyChallenged,

      // --- FINANCIAL DETAILS ---
      panAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      taxStatus: agent.taxStatus,
      serviceTaxNo: agent.serviceTaxNo,
      //Acct Activation Date missing
      factoringHouse: agent.bankAccounts?.[0]?.factoringHouse,
      accountHolderName: agent.bankAccounts?.[0]?.accountHolderName,
      panNumber: agent.personalInfo?.[0]?.panNumber,
      bankName: agent.bankAccounts?.[0]?.bankName,
      branchName: agent.bankAccounts?.[0]?.branchName,
      accountNumber: agent.bankAccounts?.[0]?.accountNumber,
      accountType: agent.bankAccounts?.[0]?.accountType,
      micr: agent.bankAccounts?.[0]?.micr,
      ifsc: agent.bankAccounts?.[0]?.ifsc,
      preferredPaymentMode: agent.bankAccounts?.[0]?.preferredPaymentMode,

      // --- Other Personal Details ---
      dateOfBirth: agent.personalInfo?.[0]?.dateOfBirth,
      martialStatus: agent.martialStatus,
      // educationCode: agent.educationCode,
      educationCode: String(educationCodeId),
      educationLevel: String(educationLevelId),
      // educationLevel: agent.educationLevel,
      workProfile: agent.workProfile,
      annualIncome: agent.annualIncome,
      nomineeName: agent.nomineeName,
      relationship: agent.relationship,
      nomineeAge: agent.nomineeAge,
      occupation: agent.occupation,
      urn: agent.urn,
      additionalComment: agent.additionalComment,
      workExpMonths: agent.personalInfo?.[0]?.workExpMonths,
      bloodGroup: agent.personalInfo?.[0]?.bloodGroup,
      birthPlace: agent.personalInfo?.[0]?.birthPlace,

      // --- ADDRESS INFO ---
      stateEid: agent.stateEid,
      addressType: agent?.permanentAddres?.[0].addressType,
      addressLine1: agent?.permanentAddres?.[0].addressLine1,
      addressLine2: agent?.permanentAddres?.[0].addressLine2,
      addressLine3: agent?.permanentAddres?.[0].addressLine3,
      city: agent?.permanentAddres?.[0].city,
      state: agent?.permanentAddres?.[0].state,
      country: agent?.permanentAddres?.[0].country,
      pin: agent?.permanentAddres?.[0].pin,
    },

    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const agentChannelConfig = {
    gridCols: 2,

    defaultValues: {
      // channel_Name: agent.channel_Name,
      channel_Name: String(channelId),
      // sub_Channel: agent.sub_Channel,
      sub_Channel: String(subChannelId),
      commissionClass: agent.commissionClass,
    },

    schema: z.object({
      channel_Name: z.string().optional(),
      sub_Channel: z.string().optional(),
      commissionClass: z.string().optional(),
    }),

    fields: [
      {
        name: 'channel_Name',
        label: 'Channel Name',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
        // options:channelOptions,
      },
      {
        name: 'sub_Channel',
        label: 'Sub Channel',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
        // options:subChannelOptions,
      },
      {
        name: 'commissionClass',
        label: 'Commission Class',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'lg',
              className: 'mt-4',
            },
          ],
        }
      : null,
  }

  const PersonalDetailsConfig = {
    gridCols: 3,

    defaultValues: {
      // title: agent.title,
      title: String(titleId),
      firstName: agent.firstName,
      middleName: agent.middleName,
      lastName: agent.lastName,
      father_Husband_Nm: agent.father_Husband_Nm,
      // gender: agent.gender,
      gender: String(genderId),
    },

    schema: z.object({
      title: z.string().optional(),
      firstName: z.string().optional(),
      middleName: z.string().optional(),
      lastName: z.string().optional(),
      father_Husband_Nm: z.string().optional(),
      gender: z.string().optional(),
    }),

    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
        // options:titleOptions,
      },
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'middleName',
        label: 'Middle Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'father_Husband_Nm',
        label: 'Father/Husband Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'gender',
        label: 'Agent Gender',
        type: 'select',
        options: genderOptions,
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 6,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'lg',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

  // ne
  const contactInformationConfig = {
    gridCols: 12,

    defaultValues: {
      mobileNo:agent?.personalInfo?.[0]?.mobileNo,
      residenceContactNo: agent?.personalInfo?.[0]?.residenceContactNo,
      workContactNo: agent?.personalInfo?.[0]?.workContactNo,
      email: agent?.personalInfo?.[0]?.email,
      cnctPersonName: agent.cnctPersonName,
      cnctPersonMobileNo: agent.cnctPersonMobileNo,
      cnctPersonEmail: agent.cnctPersonEmail,
      cnctPersonDesig: agent.cnctPersonDesig,
    },
    schema: z.object({
      mobileNo: z.string().optional(),
      residenceContactNo: z.string().optional(),
      workContactNo: z.string().optional(),
      email: z.string().optional(),
      cnctPersonName: z.string().optional(),
      cnctPersonMobileNo: z.string().optional(),
      cnctPersonEmail: z.string().optional(),
      cnctPersonDesig: z.string().optional(),
    }),

    fields: [
      // ROW 1
      {
        name: 'mobileNo',
        label: 'Mobile Phone No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'residenceContactNo',
        label: 'Home Phone No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'workContactNo',
        label: 'Work Phone No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      // ROW 2
      {
        name: 'email',
        label: 'Email ID',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'cnctPersonName',
        label: 'Contact Person Name',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'cnctPersonMobileNo',
        label: 'Contact Person Mobile No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      // ROW 3
      {
        name: 'cnctPersonEmail',
        label: 'Contact Person Email',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'cnctPersonDesig',
        label: 'Contact Person Designation',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'lg',
              className: 'mt-4',
            },
          ],
        }
      : null,
  }

  const employeeInformationConfig = {
    gridCols: 12,

    // DEFAULT VALUES
    defaultValues: {
      agentId: agent.agentId,
      applicationDocketNo: agent.applicationDocketNo,
      agentCode: agent.agentCode,
      candidateType: agent.candidateType,
      agentTypeCode: agent.agentTypeCode,
      employeeCode: agent.employeeCode,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      // agentTypeCategory: agent.agentTypeCategory,
      agentTypeCategory: String(agentTypeCategoryId),
      // agentClassification: agent.agentClassification,
      agentClassification: String(agentClassificationId),
      cmsAgentType: agent.cmsAgentType,
    },
    // ZOD SCHEMA
    schema: z.object({
      channelType: z.string().optional(),
      agentId: z.string().optional(),
      applicationDocketNo: z.string().optional(),
      agentCode: z.string().optional(),
      candidateType: z.string().optional(),
      agentTypeCode: z.string().optional(),
      employeeCode: z.string().optional(),
      startDate: z.string().optional(),
      appointmentDate: z.string().optional(),
      incorporationDate: z.string().optional(),
      agentTypeCategory: z.string().optional(),
      agentClassification: z.string().optional(),
      cmsAgentType: z.string().optional(),
    }),

    // FIELDS
    fields: [
      {
        name: 'agentId',
        label: 'Agent ID',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'applicationDocketNo',
        label: 'Application Docket No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentCode',
        label: 'Agent Code',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'candidateType',
        label: 'Candidate Type',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentTypeCode',
        label: 'Agent Type',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'employeeCode',
        label: 'Employee Code',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'appointmentDate',
        label: 'Appointment Date',
        type: 'date',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'incorporationDate',
        label: 'Incorporation Date',
        type: 'date',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'agentTypeCategory',
        label: 'Agent Type Category',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options:agentTypeCategoryOptions,
      },
      {
        name: 'agentClassification',
        label: 'Agent Classification',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options:agentClassificationOptions,
      },
      {
        name: 'cmsAgentType',
        label: 'CMS Agent Type',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      // {
      //   name: 'createUpdateResponseDescription',
      //   label: 'Create/Update Agent API Response Description',
      //   type: 'textarea',
      //   colSpan: 12,
      //   variant:"white",
      // },
    ],
    // BUTTONS

    buttons: {
      submit: {
        label: 'Save Channel Info',
        variant: 'default',
      },
    },
  }

  const financialDetailsConfig = {
    gridCols: 12,
    // DEFAULT VALUES
    
    defaultValues: {
      panAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      taxStatus: agent.taxStatus,
      serviceTaxNo: agent.serviceTaxNo,
      //Acct Activation Date missing
      factoringHouse: agent.bankAccounts?.[0]?.factoringHouse,
      accountHolderName: agent.bankAccounts?.[0]?.accountHolderName,
      panNumber: agent.personalInfo?.[0]?.panNumber,
     bankName: agent.bankAccounts?.[0]?.bankName,
      branchName: agent.bankAccounts?.[0]?.branchName,

      accountNumber: agent.bankAccounts?.[0]?.accountNumber,
       accountType: agent.bankAccounts?.[0]?.bankAccType,
      micr: agent.bankAccounts?.[0]?.micr,
      ifsc: agent.bankAccounts?.[0]?.ifsc,
      preferredPaymentMode: agent.bankAccounts?.[0]?.preferredPaymentMode,
    },
    // SCHEMA
    schema: z.object({
      taxStatus: z.string().optional(),
      panAadharLinkFlag: z.string().optional(),
      sec206abFlag: z.string().optional(),
      serviceTaxNo: z.string().optional(),
      //Acct Activation Date missing
      factoringHouse: z.string().optional(),
      accountHolderName: z.string().optional(),
      panNumber: z.string().optional(),
      bankName: z.string().optional(),
      branchName: z.string().optional(),
      accountNumber: z.string().optional(),
      accountType: z.string().optional(),
      micr: z.string().optional(),
      ifsc: z.string().optional(),
      preferredPaymentMode: z.string().optional(),
    }),

    // FIELDS
    fields: [
      {
        name: 'panAadharLinkFlag',
        label: 'Pan Aadhar Link Flag',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'sec206abFlag',
        label: 'Sec 206ab Flag',
        type: 'boolean',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'taxStatus',
        label: 'Tax Status',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'serviceTaxNo',
        label: 'Service Tax No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      // {
      //   name: 'acctActivationDate',
      //   label: 'Acct Activation Date',
      //   type: 'date',
      //   colSpan: 4,
      // readOnly: !isEdit,
      //   variant: 'standard',
      // },
      {
        name: 'factoringHouse',
        label: 'Factoring House',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'accountHolderName',
        label: 'Payee Name',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'panNumber',
        label: 'PAN No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'bankName',
        label: 'Bank Name',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'branchName',
        label: 'Bank Branch Name',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'accountNumber',
        label: 'Bank Account No',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'accountType',
        label: 'Bank Account Type',
        type: 'select',
  // options: bankAccountTypeOptions,
   options: getOptions(MASTER_DATA_KEYS.BANK_ACC_TYPE).map(item => ({
          value: String(item.id), // Ensure value is a string
          label: item.description,
        })),
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'micr',
        label: 'MICR Code',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'ifsc',
        label: 'IFSC Code',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'preferredPaymentMode',
        label: 'Payment Mode',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options: ['Bank Transfer', 'Cheque', 'Cash', 'UPI'],
      },
    ],

    // BUTTONS
    buttons: {
      submit: {
        label: 'Save Financial Details',
        variant: 'default',
      },
      cancel: {
        label: 'Cancel',
        variant: 'outline',
      },
    },
  }

  // const hierarchyInformationConfig = {
  //   gridCols: 12,

  //   // -----------------------------------------
  //   // DEFAULT VALUES
  //   // -----------------------------------------
  //   defaultValues: {
  //     reportingToName: '',
  //     reportingToCode: '',
  //     reportingToDesignation: '',
  //     reportingToMobile: '',
  //     reportingToEmail: '',

  //     zonalHeadName: '',
  //     zonalHeadCode: '',
  //     zonalHeadDesignation: '',
  //     zonalHeadMobile: '',
  //     zonalHeadEmail: '',

  //     regionalHeadName: '',
  //     regionalHeadCode: '',
  //     regionalHeadDesignation: '',
  //     regionalHeadMobile: '',
  //     regionalHeadEmail: '',

  //     branchManagerName: '',
  //     branchManagerCode: '',
  //     branchManagerDesignation: '',
  //     branchManagerMobile: '',
  //     branchManagerEmail: '',
  //   },

  //   // -----------------------------------------
  //   // ZOD SCHEMA
  //   // -----------------------------------------
  //   schema: z.object({
  //     reportingToName: z.string().optional(),
  //     reportingToCode: z.string().optional(),
  //     reportingToDesignation: z.string().optional(),
  //     reportingToMobile: z.string().optional(),
  //     reportingToEmail: z.string().email().optional(),

  //     zonalHeadName: z.string().optional(),
  //     zonalHeadCode: z.string().optional(),
  //     zonalHeadDesignation: z.string().optional(),
  //     zonalHeadMobile: z.string().optional(),
  //     zonalHeadEmail: z.string().email().optional(),

  //     regionalHeadName: z.string().optional(),
  //     regionalHeadCode: z.string().optional(),
  //     regionalHeadDesignation: z.string().optional(),
  //     regionalHeadMobile: z.string().optional(),
  //     regionalHeadEmail: z.string().email().optional(),

  //     branchManagerName: z.string().optional(),
  //     branchManagerCode: z.string().optional(),
  //     branchManagerDesignation: z.string().optional(),
  //     branchManagerMobile: z.string().optional(),
  //     branchManagerEmail: z.string().email().optional(),
  //   }),

  //   // -----------------------------------------
  //   // FIELDS
  //   // -----------------------------------------
  //   fields: [
  //     // ---- REPORTING TO ----
  //     {
  //       name: 'reportingToName',
  //       label: 'Reporting To Name',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'reportingToCode',
  //       label: 'Reporting To Code',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'reportingToDesignation',
  //       label: 'Reporting To Designation',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'reportingToMobile',
  //       label: 'Reporting To Mobile',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'reportingToEmail',
  //       label: 'Reporting To Email',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },

  //     // ---- ZONAL HEAD ----
  //     {
  //       name: 'zonalHeadName',
  //       label: 'Zonal Head Name',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'zonalHeadCode',
  //       label: 'Zonal Head Code',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'zonalHeadDesignation',
  //       label: 'Zonal Head Designation',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'zonalHeadMobile',
  //       label: 'Zonal Head Mobile',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'zonalHeadEmail',
  //       label: 'Zonal Head Email',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },

  //     // ---- REGIONAL HEAD ----
  //     {
  //       name: 'regionalHeadName',
  //       label: 'Regional Head Name',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'regionalHeadCode',
  //       label: 'Regional Head Code',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'regionalHeadDesignation',
  //       label: 'Regional Head Designation',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'regionalHeadMobile',
  //       label: 'Regional Head Mobile',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'regionalHeadEmail',
  //       label: 'Regional Head Email',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },

  //     // ---- BRANCH MANAGER ----
  //     {
  //       name: 'branchManagerName',
  //       label: 'Branch Manager Name',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'branchManagerCode',
  //       label: 'Branch Manager Code',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'branchManagerDesignation',
  //       label: 'Branch Manager Designation',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'branchManagerMobile',
  //       label: 'Branch Manager Mobile',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //     {
  //       name: 'branchManagerEmail',
  //       label: 'Branch Manager Email',
  //       type: 'text',
  //       colSpan: 4,
  //       variant: 'standard',
  //     },
  //   ],

  //   // -----------------------------------------
  //   // BUTTONS
  //   // -----------------------------------------
  //   buttons: {
  //     submit: {
  //       label: 'Save Hierarchy Information',
  //       variant: 'default',
  //     },
  //     cancel: {
  //       label: 'Cancel',
  //       variant: 'outline',
  //     },
  //   },
  // }

  const otherPersonalDetailsConfig = {
    gridCols: 12,

    // -----------------------------------------
    // DEFAULT VALUES
    // -----------------------------------------
    defaultValues: {
      dateOfBirth: agent.personalInfo?.[0]?.dateOfBirth,
      maritalStatusCode: String(maritalStatusId),
      // maritalStatusCode: agent.maritalStatusCode,
      educationCode: agent.personalInfo?.[0]?.educationCode,
      educationLevel: agent.personalInfo?.[0]?.educationLevel,
      workProfile: agent.personalInfo?.[0]?.workProfile,
      annualIncome: agent.personalInfo?.[0]?.annualIncome,
      nomineeName: agent.nominees?.[0]?.nomineeName,
      relationship: agent.nominees?.[0]?.relationship,
      nomineeAge: agent.nominees?.[0]?.nomineeAge,
      // occupation: agent.occupation,
      occupation: String(occupationId),
      urn: agent.urn,
      additionalComment: agent.additionalComment,
      // workExpMonths: agent.personalInfo?[0]?.workExpMonths,
      bloodGroup: agent.personalInfo?.[0]?.bloodGroup,
      birthPlace: agent.personalInfo?.[0]?.birthPlace,
    },

    // -----------------------------------------
    // SCHEMA
    // -----------------------------------------
    schema: z.object({
      dateOfBirth: z.string().optional(),
      maritalStatusCode: z.string().optional(),
      educationCode: z.string().optional(),
      educationLevel: z.string().optional(),
      workProfile: z.string().optional(),
      annualIncome: z.string().optional(),
      nomineeAge: z.string().optional(),
      nomineeName: z.string().optional(),
      relationship: z.string().optional(),
      occupation: z.string().optional(),
      urn: z.string().optional(),
      additionalComment: z.string().optional(),
      // workExpMonths: z.string().optional(),
      bloodGroup: z.string().optional(),
      birthPlace: z.string().optional(),
    }),

    // -----------------------------------------
    // FIELDS
    // -----------------------------------------
    fields: [
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'maritalStatusCode',
        label: 'Marital Status',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options: maritalOptions,
      },

      {
        name: 'educationCode',
        label: 'Education Code',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options: educationOptions,
      },
      {
        name: 'educationLevel',
        label: 'Education Level',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
                // options: educationOptions,

      },
      {
        name: 'workProfile',
        label: 'Work Profile',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'annualIncome',
        label: 'Annual Income',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'nomineeName',
        label: 'Nominee Name',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'relationship',
        label: 'Nominee Relation',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'nomineeAge',
        label: 'Nominee Age',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'occupation',
        label: 'Occupation',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        // variant: 'standard',
        // options:occupationOptions,
        
      },

      {
        name: 'urn',
        label: 'URN',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'additionalComment',
        label: 'Additional Comment',
        type: 'textarea',
        colSpan: 12,
        variant:"white",
      },
      // {
      //   name: 'workExperience',
      //   label: 'Work Experience',
      //   type: 'text',
      //   colSpan: 4,
      //   readOnly: !isEdit,
      //   variant: 'standard',
      // },
      {
        name: 'bloodGroup',
        label: 'Blood Group',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'birthPlace',
        label: 'Birth Place',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    // -----------------------------------------
    // BUTTONS
    // -----------------------------------------
    buttons: {
      submit: {
        label: 'Save Personal Details',
        variant: 'default',
      },
      cancel: {
        label: 'Cancel',
        variant: 'outline',
      },
    },
  }
  const addressConfig = {
    gridCols: 12,

    // -----------------------------------------
    // DEFAULT VALUES
    // -----------------------------------------
    defaultValues: {
      stateEid: agent.stateEid,
            addressType: agent?.permanentAddres?.[0].addressType,
      addressLine1: agent.permanentAddres?.[0].addressLine1,
      addressLine2: agent.permanentAddres?.[0].addressLine2,
      addressLine3: agent.permanentAddres?.[0].addressLine3,
      city: agent.permanentAddres?.[0].city,
      // state: agent.permanentAddres?.[0].state,
      state: String(stateId),
      pin: agent.permanentAddres?.[0].pin,
      country:String(countryId),
      // country: agent.permanentAddres?.[0].country,
    },

    // -----------------------------------------
    // SCHEMA
    // -----------------------------------------
    schema: z.object({
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      addressLine3: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      stateEid: z.string().optional(),
      state: z.string().optional(),
      pin: z.string().optional(),
      country: z.string().optional(),
      addressType: z.string().optional(),
    }),

    // -----------------------------------------
    // FIELDS
    // -----------------------------------------
    fields: [
      {
        name: 'addressType',
        label: 'Address Type',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'addressLine1',
        label: 'Address 1',
        type: 'text',
        colSpan:4,
                variant: 'standard',

      },
      {
        name: 'addressLine2',
        label: 'Address 2',
        type: 'text',
        colSpan:4,
                variant: 'standard',

      },
      {
        name: 'addressLine3',
        label: 'Address 3',
        type: 'text',
        colSpan:4,
                variant: 'standard',

      },

      {
        name: 'city',
        label: 'City',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'state',
        label: 'State',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options:stateOptions,
      },

      {
        name: 'stateEid',
        label: 'State',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },

      {
        name: 'country',
        label: 'Country',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        // options:countryOptions,
      },
      {
        name: 'pin',
        label: 'PIN Code',
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    // -----------------------------------------
    // BUTTONS
    // -----------------------------------------
    buttons: {
      submit: {
        label: 'Save Address',
        variant: 'default',
      },
      cancel: {
        label: 'Cancel',
        variant: 'outline',
      },
    },
  }

  // console.log("agentFormConfig", agentFormConfig)

  const f = agentForm as any

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins font-semibold text-[20px]">
            Individual Agent Action
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700">Edit</span>
            <Switch
              checked={isEdit}
              onCheckedChange={setIsEdit}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
        {/* -----------1st part------------------- */}

        <div className="flex gap-10">
          {/* Left Column - Agent Profile */}
          <Card className="bg-white w-lg bg-[#F2F2F7] !rounded-sm">
            <CardContent>
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <img
                  src="/person.jpg"
                  // src="/api/placeholder/300/300"
                  alt="Agent Profile"
                  className="aspect-3/2 object-cover mb-3 h-[12rem] rounded-lg"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAyMDBDMTAwIDE3Mi4zODYgMTIyLjM4NiAxNTAgMTUwIDE1MFMyMDAgMTcyLjM4NiAyMDAgMjAwVjIyMEgxMDBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                  }}
                />

                {/* Agent Info Card */}
                <div className="bg-orange-400 text-white rounded-lg p-3 w-full max-w-xs">
                  <div className="flex items-center gap-3">
                    <BiUser className="h-8 w-8 text-white" />
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">
                        {agent.agentName}
                      </h3>
                      <p className="text-orange-100 text-sm">
                        AGENT CODE - {agent.agentCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>{' '}
          </Card>

          <Card className="flex justify-center items-center bg-white w-full  !m-0  p-4 w-[100%] !rounded-sm overflow-y-auto bg-[#F2F2F7] w-[100%]">
            <CardContent className="w-[100%] p-0">
              <DynamicFormBuilder
                config={agentChannelConfig}
                onSubmit={agentForm.handleSubmit}
              />

              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>

        {/* --------------Personal Details----------------- */}

         <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mt-6 font-poppins font-semibold text-[20px]">
            Personal Details
          </h2>
        </div>
        <div className="flex gap-2">
           <Card className="w-full !px-6 mt-5 overflow-y-auto overflow-x-hidden w-[100%]  bg-[#F2F2F7]">
             <CardContent className="!px-0 !py-0 w-[100%]">
               <AutoAccordionSection id="sec-1">
                 <DynamicFormBuilder
                   config={PersonalDetailsConfig}
                   onSubmit={agentForm.handleSubmit}
                 />
               </AutoAccordionSection>
             </CardContent>
           </Card>
         </div> 

        {/* --------------Contact Information----------------- */}

        <h2 className="text-xl mt-6 font-semibold text-gray-900 font-poppins font-semibold !text-[20px]">
          Contact Information
        </h2>
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <AutoAccordionSection id="sec-1">
                <DynamicFormBuilder
                  config={contactInformationConfig}
                  onSubmit={agentForm.handleSubmit}
                />
              </AutoAccordionSection>
            </CardContent>
          </Card>
        </div>
                {/* -------------------hirarchy Information Config------------------------------- */}


        {/* <h2 className="text-xl mt-6 font-semibold text-gray-900 font-poppins font-semibold !text-[20px]">
          Hierarchy Information
        </h2>
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <AutoAccordionSection title="Agent Basic Info" id="sec-1">
                <DynamicFormBuilder
                  config={hierarchyInformationConfig}
                  onSubmit={agentForm.handleSubmit}
                />
              </AutoAccordionSection>
           
            </CardContent>
          </Card>
        </div> */}

        {/* -------------------employee Information Config------------------------------- */}

        <h2 className="text-xl mt-6 font-semibold text-gray-900 font-poppins font-semibold !text-[20px]">
          Employee Information Config
        </h2>
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <AutoAccordionSection id="sec-1">
                <DynamicFormBuilder
                  config={employeeInformationConfig}
                  onSubmit={agentForm.handleSubmit}
                />
              </AutoAccordionSection>
            </CardContent>
          </Card>
        </div>
        {/* ---------------financialDetailsConfig--------------- */}
        <h2 className="text-xl mt-6 font-semibold text-gray-900 font-poppins font-semibold !text-[20px]">
          Financial Details
        </h2>
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <AutoAccordionSection id="sec-1">
                <DynamicFormBuilder
                  config={financialDetailsConfig}
                  onSubmit={agentForm.handleSubmit}
                />
              </AutoAccordionSection>
            </CardContent>
          </Card>
        </div>
        {/*  Other Personal Details Config */}
        <h2 className="text-xl mt-6 font-semibold text-gray-900 font-poppins font-semibold !text-[20px]">
          Other Personal Details
        </h2>
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <AutoAccordionSection id="sec-1">
                <DynamicFormBuilder
                  config={otherPersonalDetailsConfig}
                  onSubmit={agentForm.handleSubmit}
                />
              </AutoAccordionSection>
             
            </CardContent>
          </Card>
        </div>

        {/* addressConfig */}
        <h2 className="text-xl mt-6 font-semibold text-gray-900 font-poppins font-semibold !text-[20px]">
          Address Config
        </h2>
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <AutoAccordionSection id="sec-1">
                <DynamicFormBuilder
                  config={addressConfig}
                  onSubmit={agentForm.handleSubmit}
                />
              </AutoAccordionSection>
            </CardContent>
          </Card>
        </div> 
      </div>
    </div>
  )
}

export default AgentDetail
