import React, { useEffect, useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'
import DisplaySection from '../ui/displaySection'
import type { IAgent } from '@/models/agent'
import { agentService } from '@/services/agentService'
import { MASTER_DATA_KEYS, NOTIFICATION_CONSTANTS } from '@/utils/constant'
import { showToast } from '@/components/ui/sonner'


type LicenseDetailProps = {
  agent: any
  getOptions: any
}

const License = ({ agent, getOptions }: LicenseDetailProps) => {
  const [isEdit, setIsEdit] = useState(false) // ✅ Add state here

 
  if (!agent) return null

  const licenseForm = useAppForm({
    defaultValues: {
      licenseNo: agent.licenseNo,
      licenseType: agent.licenseType,
      licenseIssueDate: agent.licenseIssueDate,
      licenseStatus: agent.licenseStatus,
      licenseExpiryDate: agent.licenseExpiryDate,
      cnctPersonName: agent.cnctPersonName,
      agentTypeCat:agent.agentTypeCat,
 agentClass: agent.agentClass,
       ulipFlag: agent.ulipFlag,
      trainingGroupType: agent.trainingGroupType,
      ifs: agent.ifs,
      refresherTrainingCompleted: agent.refresherTrainingCompleted,
      isMigrated: agent.isMigrated,
      mainPartnerClientCode: agent.mainPartnerClientCode,
      agentMaincodevwEid: agent.agentMaincodevwEid,
      registrationDate: agent.registrationDate,
      vertical: agent.vertical,
    },
    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const licenseConfig = {
    gridCols: 3,
    sectionName: 'license_details',
    defaultValues: {
      cnctPersonName: agent.cnctPersonName,
      agentTypeCat:agent.agentTypeCat,
       agentClass: agent.agentClass,
      licenseStatus: agent.licenseStatus,
      licenseExpiryDate: agent.licenseExpiryDate,
      licenseIssueDate: agent.licenseIssueDate,
      licenseType: agent.licenseType,
      licenseNo: agent.licenseNo,
    },
    schema: z.object({
         cnctPersonName:  z.string().optional(),
      agentTypeCat:  z.union([z.string(), z.number()]).optional(),
      agentClass:  z.union([z.string(), z.number()]).optional(),
      licenseStatus:  z.string().optional(),
      licenseExpiryDate:  z.string().optional(),
      licenseIssueDate:  z.string().optional(),
      licenseType:  z.string().optional(),
      licenseNo:  z.string().optional(),
    }),

    fields: [
      {
        name: 'cnctPersonName',
        label: 'Contact Person Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentTypeCat',
        label: 'Agent Type Category',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.AGENT_TYPE_CATEGORY),
      },
      {
        name: 'agentClass',
        label: 'Agent Classification',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.AGENT_CLASS),
      },
      {
        name: 'licenseStatus',
        label: 'License Status',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.LICENCE_STATUS),
      },
      {
        name: 'licenseExpiryDate',
        label: 'license Expiry Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'licenseIssueDate',
        label: 'License Issue Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'licenseType',
        label: 'License Type',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.LICENSE_TYPE),
      },
      {
        name: 'licenseNo',
        label: 'License No',
        type: 'text',
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
              colSpan: 1,
              size: 'lg',
            },
          ],
        }
      : null,
  }
  const licenseTrainingConfig = {
    gridCols: 2,
    sectionName: 'training_details',

    defaultValues: {
       trainingGroupType: agent.trainingGroupType,
      refresherTrainingCompleted: agent.refresherTrainingCompleted,

    },

    schema: z.object({
           trainingGroupType:  z.string().optional(),
      refresherTrainingCompleted:  z.string().optional(),
    }),

    fields: [
      {
        name: 'trainingGroupType',
        label: 'Training Group Type',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'refresherTrainingCompleted',
        label: 'Refresher Training Completed',
        type: 'boolean',
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
              className: 'whitespace-nowrap',
            },
          ],
        }
      : null,
  }

  const licenseProductConfig = {
    gridCols: 2,
    sectionName: 'licenseProduct_Config',


    defaultValues: {
            ulipFlag: agent.ulipFlag,

    },

    schema: z.object({
      ulipFlag: z.string().optional(),
      
    }),

    fields: [
      {
        name: 'ulipFlag',
        label: 'Ulip Flag',
        type: 'boolean',
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
              colSpan: 1,
              size: 'lg',
            },
          ],
        }
      : null,
  }
  const licenseFinancialConfig = {
    gridCols: 2,
    sectionName: 'product_details',


    defaultValues: {
       ifs: agent.ifs,
    },

    schema: z.object({
      ifs: z.string().optional(),
      
    }),

    fields: [
      {
        name: 'ifs',
        label: 'Channel Name',
        type: 'text',
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
              colSpan: 1,
              size: 'lg',
            },
          ],
        }
      : null,
  }
  const licenseOthersConfig = {
    gridCols: 2,
    sectionName: 'others_details',


    defaultValues: {
      isMigrated: agent.isMigrated,
      mainPartnerClientCode: agent.mainPartnerClientCode,
      agentMaincodevwEid: agent.agentMaincodevwEid,
      registrationDate: agent.registrationDate,
      vertical: agent.vertical,
    },

    schema: z.object({
       isMigrated: z.string().optional(),
      mainPartnerClientCode: z.string().optional(),
      agentMaincodevwEid: z.string().optional(),
      registrationDate: z.string().optional(),
      vertical: z.string().optional(),
     
    }),

    fields: [
      {
        name: 'isMigrated',
        label: 'Is Migrated',
        type: 'boolean',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'mainPartnerClientCode',
        label: 'Main Partner Client Code',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentMaincodevwEid',
        label: 'Agent Main codevwE id',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'registrationDate',
        label: 'Registration Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'vertical',
        label: 'vertical',
        type: 'select',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.VERTICAL),
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
              colSpan: 1,
              size: 'lg',
            },
          ],
        }
      : null,
  }

  // console.log("agentFormConfig", agentFormConfig)

    const handleSectionSubmit =(sectionName: string) => async (formData: Record<string, any>) => {
        console.log(`📝 Submitting ${sectionName}:`, formData)
  
        try {
          // Extract agentId from agent object (convert to lowercase for backend)
          const agentid = agent?.agentId
          if (!agentid) {
            throw new Error('Agent ID is missing. Cannot update agent details.')
          }
  
          const payload: Record<string, any> = {
            ...formData,
          }
  
          console.log('📤 Sending payload:', payload)
     
          const response = await agentService.editAgent(payload, sectionName, agentid)
          console.log('✅ Update successful:', response)
  
          // You can add success notification here
          showToast(NOTIFICATION_CONSTANTS.SUCCESS, `${sectionName} updated successfully!`)
          setIsEdit(false) // Exit edit mode after successful save
  
          return response
        } catch (error) {
          console.error(`❌ Error updating ${sectionName}:`, error)
          showToast(NOTIFICATION_CONSTANTS.ERROR, `Failed to update ${sectionName}. Please try again.`)
          throw error // Re-throw to let the form handle the error state
        }
      }

  const f = licenseForm as any

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">

        
        <div className="flex justify-between">

          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins font-semibold text-[20px]">
            License Details
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Edit</span>
            <Switch
              checked={isEdit}
              onCheckedChange={setIsEdit}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
        {/* license */}
        <div className="flex gap-10">
          <Card className="bg-[#F2F2F7] w-full overflow-y-auto">
            <CardContent>
              <DynamicFormBuilder
                config={licenseConfig}
                  onSubmit={handleSectionSubmit(licenseConfig.sectionName)}
              />

              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>
{/* Training Details */}
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mt-6 font-poppins font-semibold text-[20px]">
            Training Details
          </h2>
        </div>
        <div className="flex gap-2">
          <Card className="bg-[#F2F2F7] w-full mt-5 max-h-[590px] overflow-y-auto overflow-x-hidden">
            <CardContent>
              <DynamicFormBuilder
                config={licenseTrainingConfig}
                  onSubmit={handleSectionSubmit(licenseTrainingConfig.sectionName)}
              />
              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>
{/* Financial */}
        <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6 font-poppins font-semibold !text-[20px]">
          Financial Details
        </h2>

        <Card className="bg-[#F2F2F7] w-full mt-5 max-h-[400px] overflow-y-auto">
          <CardContent>
            <DynamicFormBuilder
              config={licenseFinancialConfig}
                  onSubmit={handleSectionSubmit(licenseFinancialConfig.sectionName)}
            />
            {/* some form inputs */}
          </CardContent>
        </Card>

{/*Product Details */}

        <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6 font-poppins font-semibold !text-[20px]">
          Product Details
        </h2>

        <Card className="bg-[#F2F2F7] w-full mt-5 max-h-[400px] overflow-y-auto">
          <CardContent>
            <DynamicFormBuilder
              config={licenseProductConfig}
              onSubmit={handleSectionSubmit(licenseProductConfig.sectionName)}
            />
            {/* some form inputs */}
          </CardContent>
        </Card>


        {/*others Details */}
        <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6 font-poppins font-semibold !text-[20px]">
          Others Details
        </h2>

        <Card className="bg-[#F2F2F7] w-full mt-5 max-h-[400px] overflow-y-auto">
          <CardContent>
            <DynamicFormBuilder
              config={licenseOthersConfig}
              onSubmit={handleSectionSubmit(licenseOthersConfig.sectionName)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default License
