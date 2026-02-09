import React, { useEffect, useRef, useState } from 'react'
import { FiFileText, FiSettings } from 'react-icons/fi'
import { BiDownload, BiSend, BiUpload } from 'react-icons/bi'
import { FaRegFileExcel } from 'react-icons/fa6'
import { TbUpload } from 'react-icons/tb'
import { HMSService } from '@/services/hmsService'
import type { IBatch } from '@/models/hmsdashboard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


const bulkSteps = [
  {
    id: 1,
    title: 'Select Template',
    description: 'Choose the appropriate template for your bulk action',
    icon: FiFileText,
  },
  {
    id: 2,
    title: 'Upload Filled Template',
    description: 'Upload the completed template with agent data',
    icon: BiUpload,
  },
  {
    id: 3,
    title: 'Submit for Processing',
    description: 'Review and submit your bulk action',
    icon: BiSend,
  },
]

const CreateBulk = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [batches, setBatches] = useState<IBatch[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<number>(2) // default to upload step per requirement
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(null)
  const [downloadingType, setDownloadingType] = useState<'success' | 'failed' | null>(null)

  // Fetch uploaded file list on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await HMSService.uploadFileList()
        if (response?.responseBody?.batches) {
          setBatches(response.responseBody.batches)
        }
      } catch (err) {
        console.error('Error fetching batches:', err)
        setError('Failed to load uploaded batches')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBatches()
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleProcessUpload = () => {
    if (!selectedFile) return

    // For now, just move to next step - actual upload logic can be added later
    setSelectedFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setActiveStep(3)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'completedwitherrors':
        return 'bg-amber-100 text-amber-700'
      case 'pending':
        return 'bg-slate-100 text-slate-700'
      case 'failed':
        return 'bg-rose-100 text-rose-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  // Handle download report
  const handleDownloadReport = async (batchId: string, reportType: 'success' | 'failed') => {
    try {
      setDownloadingBatchId(batchId)
      setDownloadingType(reportType)
      
      const blob = await HMSService.downloadReport(batchId, reportType)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `batch_${batchId}_${reportType}_report.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setDownloadingBatchId(null)
      setDownloadingType(null)
    } catch (error) {
      console.error('Download error:', error)
      alert(`Failed to download ${reportType} report: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDownloadingBatchId(null)
      setDownloadingType(null)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Step 1 · Select Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Template Category</p>
                <Select defaultValue="new-code">
                  <SelectTrigger className="w-full lg:w-80">
                    <div className="flex items-center gap-2">
                      <FiSettings size={16} />
                      <SelectValue placeholder="Choose template" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-code">New Code Creation</SelectItem>
                    <SelectItem value="movement">Movement in Existing Codes</SelectItem>
                    <SelectItem value="pi-change">PI Change in Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button variant="blue" size="sm" icon={<BiDownload className="h-4 w-4" />}>
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card className="border border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Step 2 · Upload Filled Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <label
                htmlFor="bulk-upload-input"
                className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 py-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <FaRegFileExcel className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    Drop your filled Excel template here
                  </p>
                  <p className="text-sm text-slate-500">
                    Supported formats: .xls, .xlsx, .csv (max 10 MB)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Browse Files
                </Button>
              </label>
              <input
                ref={inputRef}
                id="bulk-upload-input"
                type="file"
                accept=".xls,.xlsx,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <div className="rounded-md border border-blue-100 bg-white px-4 py-3 text-sm text-slate-700">
                  <p className="font-semibold">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                    {selectedFile.type || 'application/vnd.ms-excel'}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="blue"
                  size="sm"
                  icon={<TbUpload className="h-4 w-4" />}
                  onClick={handleProcessUpload}
                  disabled={!selectedFile}
                >
                  Upload & Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                >
                  Clear Selection
                </Button>
              </div>
        
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Step 3 · Submit for Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Once the validation summary looks good, send the batch for approval. You can still
                track status or download the error report if rows fail.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline-blue" size="sm">
                  View Validation Summary
                </Button>
                <Button variant="green" size="sm" icon={<BiSend className="h-4 w-4" />}>
                  Submit for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-80">
          {bulkSteps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === bulkSteps.length - 1
            return (
              <div key={step.id} className="relative pl-12 pb-8 last:pb-0">
                <div className="absolute left-0 top-0 flex flex-col items-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                      activeStep === step.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-slate-200 bg-white text-slate-600'
                    } shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && (
                    <div
                      className={`mt-2 h-12 w-px ${
                        activeStep > step.id ? 'bg-blue-200' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
                <Card className="border border-slate-100 bg-slate-50">
                  <CardContent className="space-y-1 py-4">
                    <p
                      className={`text-xs font-semibold uppercase ${
                        activeStep === step.id ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      Step {step.id}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="flex-1 space-y-4">
          {renderStepContent()}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === 1}
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline-blue"
                size="sm"
                onClick={() => setActiveStep(1)}
                disabled={activeStep === 1}
              >
                Go to Step 1
              </Button>
              <Button
                variant="blue"
                size="sm"
                disabled={activeStep === 3}
                onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
              >
                Next Step
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl font-semibold">Uploaded Batches</CardTitle>
            <p className="text-sm text-slate-500">
              Track the history of your bulk template uploads.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {/* 🔍 Filters */}
<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

  {/* 1️⃣ Date Range (Month) — Mandatory */}
  <div>
    <label className="text-sm font-medium text-slate-700">Month (Required)</label>
    <Select>
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="Select Month" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2025-10">October 2025</SelectItem>
        <SelectItem value="2025-09">September 2025</SelectItem>
        <SelectItem value="2025-08">August 2025</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* 2️⃣ Uploaded By — Optional */}
  <div>
    <label className="text-sm font-medium text-slate-700">Uploaded By</label>
    <Select>
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="amit">Amit Mehta</SelectItem>
        <SelectItem value="priya">Priya Singh</SelectItem>
        <SelectItem value="rahul">Rahul Gupta</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* 3️⃣ Status — Optional */}
  <div>
    <label className="text-sm font-medium text-slate-700">Status</label>
    <Select>
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="Ready">Ready</SelectItem>
        <SelectItem value="In Review">In Review</SelectItem>
        <SelectItem value="Completed">Completed</SelectItem>
        <SelectItem value="Failed">Failed</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-slate-600">Loading batches...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-10 text-rose-500">
              {error}
            </div>
          ) : batches.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              No uploaded batches found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.batchId}>
                    <TableCell className="font-semibold text-slate-900">{batch.batchId}</TableCell>
                    <TableCell>{batch.fileName}</TableCell>
                    <TableCell>{batch.uploadedBy}</TableCell>
                    <TableCell>{formatDate(batch.uploadedOn)}</TableCell>
                    <TableCell>{batch.total}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDownloadReport(batch.batchId, 'success')}
                        disabled={!batch.success || batch.success === 0 || (downloadingBatchId === batch.batchId && downloadingType === 'success')}
                        className={`text-green-600 hover:text-green-700 hover:underline font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline ${
                          downloadingBatchId === batch.batchId && downloadingType === 'success' ? 'opacity-50' : ''
                        }`}
                        title="Download success report"
                      >
                        {downloadingBatchId === batch.batchId && downloadingType === 'success' ? 'Downloading...' : batch.success}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDownloadReport(batch.batchId, 'failed')}
                        disabled={!batch.failed || batch.failed === 0 || (downloadingBatchId === batch.batchId && downloadingType === 'failed')}
                        className={`text-rose-500 hover:text-rose-600 hover:underline font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline ${
                          downloadingBatchId === batch.batchId && downloadingType === 'failed' ? 'opacity-50' : ''
                        }`}
                        title="Download failed report"
                      >
                        {downloadingBatchId === batch.batchId && downloadingType === 'failed' ? 'Downloading...' : batch.failed}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(batch.status)}`}>
                        {batch.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateBulk