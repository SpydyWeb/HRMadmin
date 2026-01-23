import React, { useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import type { IAgent, IEditAgentPayload } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'
import AutoAccordionSection from '../ui/autoAccordianSection'
import { MASTER_DATA_KEYS } from '@/utils/constant'
import { useMasterData } from '@/hooks/useMasterData'
import { agentService } from '@/services/agentService'
import { showToast } from '@/components/ui/sonner'

type AgentDetailProps = {
  agent: any
  getOptions: any
}

const AgentDetail = ({ agent, getOptions }: AgentDetailProps) => {
  const [isEdit, setIsEdit] = useState(false)

  if (!agent) return null

  console.log('agent', agent)

  const agentForm = useAppForm({
    defaultValues: {
      // ---- Already existing fields ----
      //Employment details
      agentId: agent.agentId,
      applicationDocketNo: agent.applicationDocketNo,
      agentCode: agent.agentCode,
      candidateType: agent.candidateType,
      agentType: agent.agentType,
      employeeCode: agent.employeeCode,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      agentTypeCat: agent.agentTypeCat,
      agentClass: agent.agentClass,
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

      channel: agent.channel,
      subChannel: agent.subChannel,
      // --- contact DETAILS ---
      mobileNo: agent?.personalInfo?.[0]?.mobileNo,
      workContactNo: agent?.personalInfo?.[0]?.workContactNo,
      // --- EMPLOYMENT DETAILS ---

      pob: agent.pob,
      aadharNumber: agent.aadharNumber,
      education: agent.education,
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

      educationLevel: agent.educationLevel,
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
      addressType: agent?.permanentAddres?.[0]?.addressType,
      addressLine1: agent?.permanentAddres?.[0]?.addressLine1,
      addressLine2: agent?.permanentAddres?.[0]?.addressLine2,
      addressLine3: agent?.permanentAddres?.[0]?.addressLine3,
      city: agent?.permanentAddres?.[0]?.city,
      state: agent?.permanentAddres?.[0]?.state,
      // country: agent?.permanentAddres?.[0].country,
      country: agent?.country,
      pin: agent?.permanentAddres?.[0]?.pin,
    },

    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const handleFieldClick = () => {
    alert('cancel')
  }

  const agentChannelConfig = {
    gridCols: 2,
    sectionName: 'channelInfo',

    defaultValues: {
      channel: agent.channel,
      subChannel: agent.subChannel,
      commissionClass: agent.commissionClass ?? 'N/A',
    },

    schema: z.object({
      channel: z.any().optional(),
      subChannel: z.any().optional(),
      commissionClass: z.any().optional(),
    }),

    fields: [
      {
        name: 'channel',
        label: 'Channel Name',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
        options: getOptions(MASTER_DATA_KEYS.SALES_CHANNELS),
      },
      {
        name: 'subChannel',
        label: 'Sub Channel',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
        options: getOptions(MASTER_DATA_KEYS.SALES_SUB_CHANNELS),
      },
      {
        name: 'commissionClass',
        label: 'Commission Class',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
        options: getOptions(MASTER_DATA_KEYS.COMMISSION_CLASS),
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

  const handleSectionSubmit =
    (sectionName: string) => async (formData: Record<string, any>) => {
      console.log(`📝 Submitting ${sectionName}:`, formData)

      try {
        const payload: IEditAgentPayload = {
          id: agent.agentId, // Agent ID
          sectionName: sectionName,
          ...formData, // Include all form fields
        }

        console.log('📤 Sending payload:', payload)
        const response = await agentService.editAgent(payload)
        console.log('✅ Update successful:', response)

        // You can add success notification here
        alert(`${sectionName} updated successfully!`)
        setIsEdit(false) // Exit edit mode after successful save

        return response
      } catch (error) {
        console.error(`❌ Error updating ${sectionName}:`, error)
        alert(`Failed to update ${sectionName}. Please try again.`)
        throw error // Re-throw to let the form handle the error state
      }
    }

  const PersonalDetailsConfig = {
    gridCols: 3,
    sectionName: 'personalInfo',

    defaultValues: {
      title: agent.title,
      firstName: agent.firstName,
      middleName: agent.middleName,
      lastName: agent.lastName,
      father_Husband_Nm: agent.father_Husband_Nm ?? 'N/a',
      gender: agent.gender,
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
        options: getOptions(MASTER_DATA_KEYS.SALUTATION),
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
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
        options: getOptions(MASTER_DATA_KEYS.GENDER),
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
              size: 'md',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

  // ne
  const contactInformationConfig = {
    gridCols: 12,
    sectionName: 'contactInfo',

    defaultValues: {
      mobileNo: agent?.personalInfo?.[0]?.mobileNo,
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
    sectionName: 'employmentInfo',

    // DEFAULT VALUES
    defaultValues: {
      agentId: agent.agentId,
      applicationDocketNo: agent.applicationDocketNo ?? 'N/A',
      agentCode: agent.agentCode,
      candidateType: agent.candidateType,
      agentType: agent.agentType,
      employeeCode: agent.employeeCode ?? 'N/A',
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      agentTypeCat: agent.agentTypeCat,
      agentClass: agent.agentClass,
      cmsAgentType: agent.cmsAgentType,
    },
    // ZOD SCHEMA
    schema: z.object({
      channelType: z.string().optional(),
      agentId: z.string().optional(),
      applicationDocketNo: z.string().optional(),
      agentCode: z.string().optional(),
      candidateType: z.union([z.string(), z.number()]).optional(),
      agentType: z.union([z.string(), z.number()]).optional(),
      employeeCode: z.union([z.string(), z.number()]).optional(),
      startDate: z.string().optional(),
      appointmentDate: z.string().optional(),
      incorporationDate: z.string().optional(),
      agentTypeCat: z.union([z.string(), z.number()]).optional(),
      agentClass: z.union([z.string(), z.number()]).optional(),
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
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.CANDIDATE_TYPE),
      },
      {
        name: 'agentType',
        label: 'Agent Type',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.AGENT_TYPE),
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
        name: 'agentTypeCat',
        label: 'Agent Type Category',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.AGENT_TYPE_CATEGORY),
      },
      {
        name: 'agentClass',
        label: 'Agent Classification',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.AGENT_CLASS),
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

    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Channel Info',
              type: 'submit',
              variant: 'orange',
              colSpan: 4,
              size: 'md',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

  const financialDetailsConfig = {
    gridCols: 12,
    sectionName: 'financialInfo',

    // DEFAULT VALUES
    defaultValues: {
      panAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      taxStatus: agent.taxStatus ?? 'N/A',
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
        options: getOptions(MASTER_DATA_KEYS.BANK_ACC_TYPE),
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
    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Financial Details',
              type: 'submit',
              variant: 'orange',
              colSpan: 4,
              size: 'md',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

  const otherPersonalDetailsConfig = {
    gridCols: 12,
    sectionName: 'otherPersonalInfo',

    // -----------------------------------------
    // DEFAULT VALUES
    // -----------------------------------------
    defaultValues: {
      dateOfBirth: agent.personalInfo?.[0]?.dateOfBirth,
      maritalStatus: agent.maritalStatus,
      education: agent.education,
      workProfile: agent.personalInfo?.[0]?.workProfile,
      annualIncome: agent.personalInfo?.[0]?.annualIncome,
      nomineeName: agent.nominees?.[0]?.nomineeName,
      relationship: agent.nominees?.[0]?.relationship,
      nomineeAge: agent.nominees?.[0]?.nomineeAge,
      occupation: agent.occupation,
      urn: agent.urn ?? 'N/A',
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
      maritalStatus: z.union([z.string(), z.number()]).optional(),
      education: z.union([z.string(), z.number()]).optional(),
      workProfile: z.string().optional(),
      annualIncome: z.string().optional(),
      nomineeAge: z.string().optional(),
      nomineeName: z.string().optional(),
      relationship: z.string().optional(),
      occupation: z.union([z.string(), z.number()]).optional(),
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
        name: 'maritalStatus',
        label: 'Marital Status',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.MARITAL_STATUS),
      },

      {
        name: 'education',
        label: 'Education Level',
        type: 'select',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.EDUCATION_QUALIFICATION),
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
        options: getOptions(MASTER_DATA_KEYS.OCCUPATIONS),
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
        variant: 'white',
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
    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Details',
              type: 'submit',
              variant: 'orange',
              colSpan: 4,
              size: 'md',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

  const addressConfig = {
    gridCols: 12,
    sectionName: 'addressInfo',

    defaultValues: {
      stateEid: agent.stateEid,
      addressType: agent?.permanentAddres?.[0]?.addressType,
      addressLine1: agent.permanentAddres?.[0]?.addressLine1,
      addressLine2: agent.permanentAddres?.[0]?.addressLine2,
      addressLine3: agent.permanentAddres?.[0]?.addressLine3,
      city: agent.permanentAddres?.[0]?.city,
      state: agent.permanentAddres?.[0]?.state,
      pin: agent.permanentAddres?.[0]?.pin,
      country: agent.permanentAddres?.[0]?.country,
    },

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
        colSpan: 4,
        variant: 'standard',
      },
      {
        name: 'addressLine2',
        label: 'Address 2',
        type: 'text',
        colSpan: 4,
        variant: 'standard',
      },
      {
        name: 'addressLine3',
        label: 'Address 3',
        type: 'text',
        colSpan: 4,
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
        type: 'text',
        colSpan: 4,
        readOnly: !isEdit,
        variant: 'standard',
        //  options: getOptions(MASTER_DATA_KEYS.STATE),
      },

      {
        name: 'stateEid',
        label: 'StateEid',
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
        options: getOptions(MASTER_DATA_KEYS.COUNTRY),
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

    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Address',
              type: 'submit',
              variant: 'orange',
              colSpan: 4,
              size: 'md',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

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
                onSubmit={handleSectionSubmit(agentChannelConfig.sectionName)}
                onFieldClick={handleFieldClick}
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
                  onSubmit={handleSectionSubmit(
                    PersonalDetailsConfig.sectionName,
                  )}
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
                  onSubmit={handleSectionSubmit(
                    contactInformationConfig.sectionName,
                  )}
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
                  onSubmit={handleSectionSubmit(
                    employeeInformationConfig.sectionName,
                  )}
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
                  onSubmit={handleSectionSubmit(
                    financialDetailsConfig.sectionName,
                  )}
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
                  onSubmit={handleSectionSubmit(
                    otherPersonalDetailsConfig.sectionName,
                  )}
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
                  onSubmit={handleSectionSubmit(addressConfig.sectionName)}
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
