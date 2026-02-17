import DataTable from './table/DataTable'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Button from '@/components/ui/button'
import { RoutePaths } from '@/utils/constant'
import { useNavigate } from '@tanstack/react-router'
import { useContextPath } from '@/hooks/useContextPath'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FiUpload } from 'react-icons/fi'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { HMSService } from '@/services/HMSService'

type JsonElement = { [key: string]: string | number | boolean | null }
let excelData: JsonElement[] = []

const tableData = [
  { Activity: 'Code Movement', Template: 'Download', Upload: '', Summary: '', Action: RoutePaths.CODEMOVEMENT },
  { Activity: 'Certification Update', Template: 'Download', Upload: '', Summary: '', Action: RoutePaths.CODEMOVEMENT },
  { Activity: 'Change in Status', Template: 'Download', Upload: '', Summary: '', Action: RoutePaths.CODEMOVEMENT },
  { Activity: 'Manager Update', Template: 'Download', Upload: '', Summary: '', Action: RoutePaths.CODEMOVEMENT },
  { Activity: 'Designation Update', Template: 'Download', Upload: '', Summary: '', Action: RoutePaths.CODEMOVEMENT },
]

const autoSizeColumns = (data: JsonElement[]) =>
  Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? '').length)) + 2,
  }))

const downloadExcel = (row: any) => {
  if (row.Activity === 'Code Movement') {
    excelData = [{ 'Agent Code': null, Channel: null, 'Start Date': null, 'End Date': null }]
  } else if (row.Activity === 'Change in Status') {
    excelData = [{ 'Agent Code': null, 'Status (Active/Inactive/Terminated)': null, 'Business Effective Date': null }]
  } else if (row.Activity === 'Manager Update') {
    excelData = [{ 'Agent Code': null, 'Reporting Manager / Supervisor Code': null, 'Effective Date of Change': null }]
  } else if (row.Activity === 'Designation Update') {
    excelData = [{ 'Agent Code': null, Designation: null, Grade: null, 'Business Effective Date': null }]
  } else return

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  worksheet['!cols'] = autoSizeColumns(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, `${row.Activity.replace(/\s+/g, '_')}_Template.xlsx`)
}

// Helper function to map activity name to filetype
const getFileTypeFromActivity = (activity: string): string => {
  const mapping: { [key: string]: string } = {
    'Code Movement': 'UpdateLocation',
    'Certification Update': 'CertificateUpdate',
    'Change in Status': 'UpdateStatus',
    'Manager Update': 'ManagerUpdate',
    'Designation Update': 'UpdateDesignation',
  }
  return mapping[activity] || activity
}

export default function PendingActionsTable() {
  const navigate = useNavigate()
  const { buildPath } = useContextPath()
  const [isLoading, setLoading] = useState(false);
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileType, setSelectedFileType] = useState<string>('')

  const handleRedirect = (path: string) => {
    if (!path) return
    navigate({ to: buildPath(path) })
  }

  const { mutate: uploadFile } = useMutation({
    mutationFn: (fileData: any) => HMSService.getHmsFile(fileData),
    onSuccess: () => {
      setLoading(false)
      setOpen(false)
      setSelectedFile(null)
      setSelectedFileType('')
    },
    onError: (err) => {
      setLoading(false)
      console.error('Upload failed', err)
    },
  })


  const handleUpload = () => {
    if (!selectedFile || !selectedFileType) return
    setLoading(true)
    const fileName = selectedFile.name
    let fileData = { 'File': fileName, 'FileType': selectedFileType }
    uploadFile(fileData);
  }


  const columns = [
    { header: 'Activity', accessor: 'Activity' },
    {
      header: 'Templates',
      accessor: (row: any) => (
        <button
          onClick={() => downloadExcel(row)}
          className="text-blue-600 underline hover:text-blue-800 font-medium"
        >
          Download
        </button>
      ),
    },
    {
      header: 'Upload',
      accessor: (row: any) => (
        <FiUpload
          className="text-gray-500 ml-4 cursor-pointer hover:text-gray-700"
          onClick={() => {
            setSelectedRow(row)
            setSelectedFileType(getFileTypeFromActivity(row.Activity))
            setOpen(true)
          }}
        />
      ),
    },
    { header: 'Summary', accessor: 'Summary' },
    {
      header: 'Action',
      accessor: (row: any) => (
        <Button variant="blue" onClick={() => handleRedirect(row.Action)}>
          Process Now
        </Button>
      ),
    },
  ]

  return (
    <>
      {/* Upload Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
              Upload {selectedRow?.Activity} File
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filetype
                  </label>
                  <Select
                    value={selectedFileType}
                    onValueChange={setSelectedFileType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select filetype" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedRow?.Activity && (
                        <SelectItem value={getFileTypeFromActivity(selectedRow.Activity)}>
                          {getFileTypeFromActivity(selectedRow.Activity)}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-md file:border
                    file:border-gray-300
                    file:bg-white file:text-gray-700
                    file:font-medium
                    hover:file:bg-gray-100
                    cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="inline-flex items-center justify-center
                  rounded-md bg-emerald-600 px-6 py-2.5
                  text-sm font-semibold text-white
                  shadow-sm transition
                  hover:bg-emerald-700
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>

          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel 
              onClick={() => {
                setLoading(false)
                setSelectedFileType('')
              }} 
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Table */}
      <Card className="shadow-md rounded-md">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Movement & Updation
          </CardTitle>
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tableData} />
        </CardContent>
      </Card>
    </>
  )
}
