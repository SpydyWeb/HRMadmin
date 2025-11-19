import React, { useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { FloatedTextFeild } from '../form/floated-text-field'
import { Switch } from "@/components/ui/switch"
import { FloatedSelectField } from '../form/dropdown-fields'
import { FloatedDateTimeField } from '../form/field-datetime-picker'


const License = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false)

  console.log("agent", agent);

  if (!agent) return null;

  const licenseForm = useAppForm({
    defaultValues: {
      licenseNo: agent.agentCode,
      licenseType: agent.title,
      licenseIssueDate: agent.agentTypeCode,
      licenseExpiryDate: agent.agentId,
      contatctPersonName: agent.firstName,
      agentTypeCategory: agent.middleName,
      agentClassification: agent.lastName,
      ulipFlag: agent.agentName,
      trainingGroupType: agent.email,
      ifs: agent.maritalStatusCode,
      refresherTrainingCompleted: agent.nationality,
      isMigrated: agent.panNumber,
      mainPartnerClientCode: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      agentMaincodevwEid: agent.preferredLanguage,
      registrationDate: agent.employeeCode,
      vertical: agent.father_Husband_Nm,
      applicationDocketNo: agent.applicationDocketNo,
      candidateType: agent.candidateType,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      licneseStatus: agent.agentTypeCategory,
      cmsAgentType: agent.cmsAgentType,
      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,

    },
    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })


  const f = licenseForm as any;

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">
        <div className="flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            License Details
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
                  <div className="grid grid-cols-3 gap-6 w-full mt-4">

                    <f.AppField name="licenseNo">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedTextFeild
                          label="License No"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>


                    <f.AppField name="licenseType">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedSelectField
                          label="License Type"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>

                    <f.AppField name="licenseIssueDate">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedDateTimeField
                          label="License Issue Date"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>

                    <f.AppField name="licenseExpiryDate">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedDateTimeField
                          label="License Expiry Date"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>

                    <f.AppField name="licneseStatus">
                      {({
                        value,
                        onChange,
                      }: {
                        value: string
                        onChange: (v: string) => void
                      }) => (
                        <FloatedSelectFeild
                          label="Licnese Status"
                          value={value}
                          onChange={onChange}
                          readOnly={!isEdit}
                        />
                      )}
                    </f.AppField>

                    {/* Repeat for other fields */}
                  </div>

                  {isEdit && (
                    <licenseForm.Button
                      onClick={licenseForm.handleSubmit}
                      className="mt-4"
                      size="md"
                      variant="orange"
                    >
                      Save Changes
                    </licenseForm.Button>
                  )}
                </f.AppForm>
              </CardContent>
            </Card>

          </div>

          <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6">
            Training Details
          </h2>

          <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-3 gap-6 w-full mt-4">

                  <f.AppField name="refresherTrainingCompleted">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <div className="flex items-center gap-3 mt-3">
                        <label className="text-xs text-black-500">Refresher Training Completed</label>

                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={(v) => onChange(v)}
                          disabled={!isEdit}
                          className="data-[state=checked]:bg-orange-500 h-[1rem] w-10"
                        />

                        <span className="text-xs text-orange-500">
                          {value ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                  </f.AppField>

                  <f.AppField name="trainingGroupType">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedSelectFeild
                        label="Training Group Type"
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
            Financial          </h2>

          <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-3 gap-6 w-full mt-4">

                  <f.AppField name="ifs">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Ifs"
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
            Product          </h2>

          <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-3 gap-6 w-full mt-4">

                  <f.AppField name="ulipFlag">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <div className="flex items-center gap-3 mt-3">
                        <label className="text-xs text-black-500">Ulip Flag</label>

                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={(v) => onChange(v)}
                          disabled={!isEdit}
                          className="data-[state=checked]:bg-orange-500 h-[1rem] w-10"
                        />

                        <span className="text-xs text-orange-500">
                          {value ? "Yes" : "No"}
                        </span>
                      </div>
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
            Others          </h2>

          <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-3 gap-6 w-full mt-4">

                  <f.AppField name="isMigrated">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <div className="flex items-center gap-3 mt-3">
                        <label className="text-xs text-black-500">Is Migrated</label>

                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={(v) => onChange(v)}
                          disabled={!isEdit}
                          className="data-[state=checked]:bg-orange-500 h-[1rem] w-10"
                        />

                        <span className="text-xs text-orange-500">
                          {value ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                  </f.AppField>
                  <f.AppField name="mainPartnerClientCode">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Main Partner Client Code"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="Agent Maincodevw Eid ">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Maincodevw Eid"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="registrationDate">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedDateTimeField
                        label="Registration Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="vertical">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedSelectField
                        label="Vertical"
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

export default License
