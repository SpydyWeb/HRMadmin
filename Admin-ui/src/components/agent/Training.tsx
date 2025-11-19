import React, { useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { FloatedTextFeild } from '../form/floated-text-field'
import { Switch } from "@/components/ui/switch"
import { FloatedSelectField } from '../form/dropdown-fields'
import { FloatedDateTimeField } from '../form/field-datetime-picker'


const Training = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false)

  console.log("agent", agent);

  const genderOptions = ["Male", "Female", "Other"];
  const genderDropdown = genderOptions.map(g => ({
    label: g,
    value: g
  }));

  if (!agent) return null;

  const trainingForm = useAppForm({
    defaultValues: {
      branchCode: agent.agentCode,
      branchName : agent.title,
      confirmationDate: agent.agentTypeCode,
      hRDoj: agent.agentId,
      fGValueTrngDate: agent.firstName,
 itSecPolicyTrngDate: agent.middleName,
      npsTrngCompletionDate: agent.lastName,
      whistleBlowerTrngDate: agent.agentName,
      govPolicyTrngDate: agent.email,
      InductionTrngDate: agent.gender,
      maritalStatusCode: agent.maritalStatusCode,
      nationality: agent.nationality,
      panNumber: agent.panNumber,
      PanAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      preferredLanguage: agent.preferredLanguage,
      employeeCode: agent.employeeCode,
      FatherHusbandNm: agent.father_Husband_Nm,
      applicationDocketNo: agent.applicationDocketNo,
      candidateType: agent.candidateType,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      agentTypeCategory: agent.agentTypeCategory,
      agentClassification: agent.agentClassification,
      cmsAgentType: agent.cmsAgentType,
      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,

    },
    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })


  const f = trainingForm as any;

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">
        <div className="flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Branch
          </h2>
          <div className="flex gap-10">
           

            <div className='absolute right-20 top-82'>
              <div className="flex items-center gap-3 pr-5">
                {/* Label before the switch */}
                <span className="font-medium text-gray-700">Edit</span>

                {/* The switch itself */}
                <Switch
                  checked={isEdit}
                  onCheckedChange={setIsEdit}
                  className="data-[state=checked]:bg-orange-500"
                />

                {/* Dynamic On/Off text */}
                <span
                  className={`font-medium ${isEdit ? "text-gray-500" : "text-gray-500"
                    } transition-colors`}
                >
                  {isEdit ? "On" : "Off"}
                </span>
              </div>

            </div>

            <Card className="bg-gray-100 w-full max-h-[400px] overflow-y-auto">
              <CardContent>
                <f.AppForm>
                  <div className="grid grid-cols-2 gap-6 w-full mt-4">

                    <f.AppField name="branchCode">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedTextFeild
                          label="Branch Code"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>


                    <f.AppField name="branchName ">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedTextFeild
                          label="Branch Name"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>

                    {/* Repeat for other fields */}
                  </div>

                  {isEdit && (
                    <trainingForm.Button
                      onClick={trainingForm.handleSubmit}
                      className="mt-4"
                      size="md"
                      variant="orange"
                    >
                      Save Changes
                    </trainingForm.Button>
                  )}
                </f.AppForm>
              </CardContent>
            </Card>

          </div>

          <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6">
           Organisation
          </h2>

          <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-3 gap-6 w-full mt-4">

                  <f.AppField name="confirmationDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Confirmation Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="incrementDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Increment Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="lastPromotionDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Last Promotion Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="hRDoj">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="HR Doj"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="lastWorkingDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Last Working Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>


                  {/* Repeat for other fields */}
                </div>

                {/* {isEdit && (
                <agentForm.Button
                  onClick={agentForm.handleSubmit}
                  className="mt-4"
                  size="md"
                  variant="orange"
                >
                  Save Changes
                </agentForm.Button>
              )} */}
              </f.AppForm>
            </CardContent>
          </Card>

          <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6">
Other Trainings
          </h2>

          <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-3 gap-6 w-full mt-4">

                  <f.AppField name="fGValueTrngDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="FG Value Trng Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="hsecPolicyTrngDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="H sec Policy Trng Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="npsTrngCompletionDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Nps Trng Completion Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="whistleBlowerTrngDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Whistle Blower Trng Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="govPolicyTrngDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Gov Policy Trng Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="InductionTrngDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Induction Trng Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>


                  {/* Repeat for other fields */}
                </div>

                {/* {isEdit && (
                <agentForm.Button
                  onClick={agentForm.handleSubmit}
                  className="mt-4"
                  size="md"
                  variant="orange"
                >
                  Save Changes
                </agentForm.Button>
              )} */}
              </f.AppForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  )
}

export default Training
