import { useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import CustomTabs from '@/components/CustomTabs'
import { HMSService } from '@/services/hmsService'
import { useEffect } from 'react'
import FieldTreeView from '@/components/ui/FieldTreeView'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/table/DataTable'
import { showToast } from "@/components/ui/sonner"
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import Loading from '@/components/ui/Loading'
import { Plus, Pencil } from 'lucide-react'

export const Route = createLazyFileRoute('/_auth/channel-management/')({
    component: RouteComponent,
})

function RouteComponent() {
    type Channel = {
        channelId: number
        channelName: string
    }

    type SubChannel = {
        subChannelId: number
        subChannelName: string
    }

    type Location = {
        locationMasterId: number
        locationCode: string
        locationDesc: string
    }

    const [channels, setChannels] = useState<Channel[]>([])
    const [loadingChannels, setLoadingChannels] = useState(false)
    const [subChannels, setSubChannels] = useState<SubChannel[]>([])
    const [loadingSubChannels, setLoadingSubChannels] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
    const [selectedSubChannel, setSelectedSubChannel] = useState<SubChannel | null>(null)
    const [activeTab, setActiveTab] = useState<'designation' | 'location' | 'branch'>('designation')
    const [openAddChannel, setOpenAddChannel] = useState(false)
    const [channelCode, setChannelCode] = useState('')
    const [channelName, setChannelName] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [addingChannel, setAddingChannel] = useState(false)
    const [openAddSubChannel, setOpenAddSubChannel] = useState(false)
    const [subChannelCode, setSubChannelCode] = useState('')
    const [subChannelName, setSubChannelName] = useState('')
    const [subDescription, setSubDescription] = useState('')
    const [subIsActive, setSubIsActive] = useState(true)
    const [addingSubChannel, setAddingSubChannel] = useState(false)
    const [locations, setLocations] = useState<any[]>([])
    const [loadingLocations, setLoadingLocations] = useState(false)
    const [globalLoading, setGlobalLoading] = useState(false)
    const [designationTreeData, setDesignationTreeData] = useState<any[]>([])
    const [designationFields, setDesignationFields] = useState<any[]>([])
    const [loadingDesignation, setLoadingDesignation] = useState(false)
    const [selectedDesignation, setSelectedDesignation] = useState<{
        id: number
        name: string
        code: string
    } | null>(null)
    const [branchTreeData, setBranchTreeData] = useState<any[]>([])
    const [loadingBranch, setLoadingBranch] = useState(false)

    const [selectedBranch, setSelectedBranch] = useState<{
        id: number
        name: string
        code: string
    } | null>(null)

    const channelTabs = [
        { value: 'designation', label: 'Designation' },
        { value: 'location', label: 'Locations' },
        { value: 'branch', label: 'Branch' },
    ]

    const locationColumns = [
        {
            header: "Location ID",
            accessor: "locationMasterId",
            width: "20%",
        },
        {
            header: "Location Code",
            accessor: "locationCode",
            width: "25%",
        },
        {
            header: "Location Description",
            accessor: "locationDesc",
            width: "35%",
        },
        {
            header: "Edit",
            accessor: (row: any) => (
                <button
                    onClick={() => handleEditLocation(row)}
                    className="flex items-center justify-center h-8 w-8 rounded-lg 
                       bg-blue-50 text-blue-600 hover:bg-blue-100 
                       hover:text-blue-700 transition"
                    title="Edit Location"
                >
                    <Pencil size={16} />
                </button>
            ),
            width: "120px",
        },
    ]

    useEffect(() => {
        fetchChannels()
    }, [])

    useEffect(() => {
        if (selectedChannel) {
            fetchSubChannels(selectedChannel)
        }
    }, [selectedChannel])

    useEffect(() => {
        if (
            activeTab === "designation" &&
            selectedChannel &&
            selectedSubChannel
        ) {
            fetchDesignationHierarchy()
        }
    }, [activeTab, selectedChannel, selectedSubChannel])

    useEffect(() => {
        if (
            activeTab === "location" &&
            selectedChannel &&
            selectedSubChannel
        ) {
            fetchLocations()
        }
    }, [activeTab, selectedChannel, selectedSubChannel])


    useEffect(() => {
        if (
            activeTab === "branch" &&
            selectedChannel &&
            selectedSubChannel
        ) {
            fetchBranchHierarchy()
        }
    }, [activeTab, selectedChannel, selectedSubChannel])


    const fetchLocations = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        try {
            setLoadingLocations(true)

            const res = await HMSService.fetchLocations(
                {
                    locationMasterId: null,
                    channelId: selectedChannel,
                    subChannelId: selectedSubChannel.subChannelId,
                    locationCode: "",
                    locationDesc: "",
                    isActive: true,
                }
            )

            const list = res?.responseBody?.locations || []
            setLocations(list)

        } catch (error) {
            console.error("Failed to fetch locations", error)
        } finally {
            setLoadingLocations(false)
        }
    }

    const fetchDesignationHierarchy = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        try {
            setLoadingDesignation(true)

            const res = await HMSService.getDesignationHierarchy({
                designationId: 0,
                parentDesignationId: 0,
                designationCode: "null",
                designationName: "null",
                designationLevel: 0,
                isActive: true,
                channelId: selectedChannel,
                codeFormat: "null",
                subChannelId: selectedSubChannel.subChannelId,
            })

            const apiData =
                res?.responseBody?.designationHierarchy || []

            // 🔥 Convert recursive API structure → TreeView structure
            const formatTree = (data: any[]): any[] => {
                return data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    code: item.code, // ✅ store code
                    type: "designation",
                    children: item.reportingDesignations?.length
                        ? formatTree(item.reportingDesignations)
                        : [],
                }))
            }

            const formattedTree = formatTree(apiData)

            setDesignationTreeData(formattedTree)

        } catch (error) {
            console.error("Failed to fetch designation hierarchy", error)
        } finally {
            setLoadingDesignation(false)
        }
    }

    const fetchBranchHierarchy = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        try {
            setLoadingBranch(true)
            const res = await HMSService.getBranchHierarchy({
                branchId: 0,
                branchCode: null,
                branchName: null,
                address: null,
                state: 0,
                phoneNumber: null,
                emailId: null,
                isActive: true,
                locationMasterId: 0,
                parentBranchId: 0,
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
            })

            const apiData = res?.responseBody?.branchHierarchy || []

            const formatTree = (data: any[]): any[] => {
                return data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    type: "branch",
                    children: item.reportingBranches?.length
                        ? formatTree(item.reportingBranches)
                        : [],
                }))
            }

            setBranchTreeData(formatTree(apiData))

        } catch (error) {
            console.error("Failed to fetch branch hierarchy", error)
        } finally {
            setLoadingBranch(false)
        }
    }

    const fetchChannels = async () => {
        try {
            setLoadingChannels(true)

            const response = await HMSService.getChannel({
                channelId: null,
                channelCode: null,
                channelName: null,
                description: null,
                isActive: true,
            })

            const channelList = response?.responseBody?.channels || []
            console.log("channel list", channelList);
            setChannels(channelList)

            // ✅ Auto select first channel
            if (channelList.length > 0) {
                setSelectedChannel(channelList[0].channelId)
            }

        } catch (error) {
            console.error('Failed to fetch channels', error)
        } finally {
            setLoadingChannels(false)
        }
    }

    const fetchSubChannels = async (channelId: number) => {
        try {
            setLoadingSubChannels(true)
            setSubChannels([])
            setSelectedSubChannel(null)

            const response = await HMSService.subChannelList({
                subChannelId: null,
                subChannelCode: null,
                channelCode: "",
                subChannelName: "",
                description: "",
                isActive: true,
                channelId: channelId,
            })

            const list = response?.responseBody?.subChannels || []
            console.log("subchannel list", list)

            setSubChannels(list)

            // ✅ auto select first subchannel
            if (list.length > 0) {
                setSelectedSubChannel(list[0])
            }

        } catch (error) {
            console.error("Failed to fetch sub channels", error)
        } finally {
            setLoadingSubChannels(false)
        }
    }

    const handleAddChannel = async () => {
        if (!channelName.trim()) {
            showToast(NOTIFICATION_CONSTANTS.WARNING, "Channel name is required")
            return
        }

        setAddingChannel(true)

        try {
            const res = await HMSService.createChannel({
                channelId: null,
                channelCode: channelCode,
                channelName: channelName,
                description: description,
                isActive: isActive,
            })

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(NOTIFICATION_CONSTANTS.SUCCESS, "Channel created successfully")
                setOpenAddChannel(false)
                setChannelCode('')
                setChannelName('')
                setDescription('')
                setIsActive(true)

                fetchChannels() // refresh list
            } else {
                showToast(NOTIFICATION_CONSTANTS.ERROR, res?.responseHeader?.errorMessage || "Failed to create channel")
            }
        } catch (error) {
            showToast(NOTIFICATION_CONSTANTS.ERROR, "Server error while creating channel")
        } finally {
            setAddingChannel(false)
        }
    }


    const handleAddSubChannel = async () => {
        if (!subChannelName.trim()) {
            showToast(NOTIFICATION_CONSTANTS.WARNING, "Sub Channel name is required")
            return
        }

        if (!selectedChannel) {
            showToast(NOTIFICATION_CONSTANTS.WARNING, "Please select a channel first")
            return
        }

        setAddingSubChannel(true)
        try {
            const res = await HMSService.createSubChannel({
                subChannelId: null,
                subChannelCode: subChannelCode,
                channelCode: channelCode,
                subChannelName: subChannelName,
                description: subDescription,
                isActive: subIsActive,
                channelId: selectedChannel,
            })

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(NOTIFICATION_CONSTANTS.SUCCESS, "Sub Channel created successfully")
                setOpenAddSubChannel(false)
                setSubChannelCode('')
                setSubChannelName('')
                setSubDescription('')
                setSubIsActive(true)

                fetchSubChannels(selectedChannel) // refresh list
            } else {
                showToast(NOTIFICATION_CONSTANTS.ERROR, res?.responseHeader?.errorMessage || "Failed to create sub channel")
            }
        } catch (error) {
            showToast(NOTIFICATION_CONSTANTS.ERROR, "Server error while creating channel")
        } finally {
            setAddingSubChannel(false)
        }
    }


    const handleEditLocation = async (row: any) => {
        if (!selectedChannel || !selectedSubChannel) return

        try {
            setGlobalLoading(true)
            const payload = {
                locationMasterId: row.locationMasterId ?? 0,
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
                locationCode: row.locationCode,
                locationDesc: row.locationDesc,
                isActive: true,
            }

            const res = await HMSService.saveLocation(payload)

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(NOTIFICATION_CONSTANTS.SUCCESS, "Location updated successfully")
                fetchLocations()
            } else {
                showToast(NOTIFICATION_CONSTANTS.ERROR, res?.responseHeader?.errorMessage || "Update failed")
            }
        } catch (error) {
            showToast(NOTIFICATION_CONSTANTS.ERROR, "Server error while updating")
        }
        finally {
            setGlobalLoading(false)
        }
    }

    const handleSaveDesignation = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        if (!selectedDesignation) {
            showToast(NOTIFICATION_CONSTANTS.WARNING, "Please select a designation")
            return
        }

        try {
            setGlobalLoading(true)

            const payload = {
                designationId: selectedDesignation.id ?? 0,
                parentDesignationId: 0, // update if needed
                designationCode: selectedDesignation.code ?? "",
                designationName: selectedDesignation.name ?? "",
                designationLevel: 0,
                isActive: true,
                channelId: selectedChannel,
                codeFormat: null,
                subChannelId: selectedSubChannel.subChannelId,
            }

            const res = await HMSService.saveDesignation(payload)

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(
                    NOTIFICATION_CONSTANTS.SUCCESS,
                    "Designation saved successfully"
                )
                fetchDesignationHierarchy()
            } else {
                showToast(
                    NOTIFICATION_CONSTANTS.ERROR,
                    res?.responseHeader?.errorMessage || "Save failed"
                )
            }
        } catch (error) {
            showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                "Server error while saving designation"
            )
        } finally {
            setGlobalLoading(false)
        }
    }

    const handleSaveBranch = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        if (!selectedBranch) {
            showToast(NOTIFICATION_CONSTANTS.WARNING, "Please select a branch")
            return
        }

        try {
            setGlobalLoading(true)
            const payload = {
                branchId: selectedBranch.id ?? 0,
                branchCode: selectedBranch.code ?? "",
                branchName: selectedBranch.name ?? "",
                address: null,
                state: 0,
                phoneNumber: null,
                emailId: null,
                isActive: true,
                locationMasterId: 0,
                parentBranchId: 0,
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
            }

            const res = await HMSService.saveBranch(payload)

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(
                    NOTIFICATION_CONSTANTS.SUCCESS,
                    "Branch saved successfully"
                )
                fetchBranchHierarchy()
            } else {
                showToast(
                    NOTIFICATION_CONSTANTS.ERROR,
                    res?.responseHeader?.errorMessage || "Save failed"
                )
            }
        } catch (error) {
            showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                "Server error while saving branch"
            )
        } finally {
            setGlobalLoading(false)
        }
    }
    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {globalLoading && <Loading />}

            <AlertDialog open={openAddChannel} onOpenChange={setOpenAddChannel}>
                <AlertDialogContent className="sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                            Add New Channel
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    {/* BODY */}
                    <div className="mt-4 space-y-4">

                        {/* Channel Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Channel Code
                            </label>
                            <input
                                type="text"
                                value={channelCode}
                                onChange={(e) => setChannelCode(e.target.value)}
                                placeholder="Enter channel code"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Channel Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Channel Name
                            </label>
                            <input
                                type="text"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder="Enter channel name"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Is Active Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                Is Active
                            </span>
                            <Switch
                                checked={isActive}
                                onCheckedChange={(checked) => setIsActive(checked)}
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                        <AlertDialogCancel
                            onClick={() => {
                                setChannelCode('')
                                setChannelName('')
                                setDescription('')
                                setIsActive(true)
                            }}
                            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </AlertDialogCancel>

                        <button
                            onClick={handleAddChannel}
                            disabled={addingChannel}
                            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {addingChannel ? 'Saving...' : 'Save'}
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={openAddSubChannel} onOpenChange={setOpenAddSubChannel}>
                <AlertDialogContent className="sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                            Add New Sub Channel
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="mt-4 space-y-4">

                        {/* Sub Channel Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Channel Code
                            </label>
                            <input
                                type="text"
                                value={subChannelCode}
                                onChange={(e) => setSubChannelCode(e.target.value)}
                                placeholder="Enter sub channel code"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Sub Channel Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Channel Name
                            </label>
                            <input
                                type="text"
                                value={subChannelName}
                                onChange={(e) => setSubChannelName(e.target.value)}
                                placeholder="Enter sub channel name"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={subDescription}
                                onChange={(e) => setSubDescription(e.target.value)}
                                placeholder="Enter description"
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Is Active */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                Is Active
                            </span>
                            <Switch
                                checked={subIsActive}
                                onCheckedChange={(checked) => setSubIsActive(checked)}
                            />
                        </div>
                    </div>

                    <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                        <AlertDialogCancel
                            onClick={() => {
                                setSubChannelCode('')
                                setSubChannelName('')
                                setSubDescription('')
                                setSubIsActive(true)
                            }}
                            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </AlertDialogCancel>

                        <button
                            onClick={handleAddSubChannel}
                            disabled={addingSubChannel}
                            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {addingSubChannel ? 'Saving...' : 'Save'}
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-6">

                {/* ================= LEFT PANEL ================= */}
                <div className="bg-white rounded-2xl shadow-md border p-6 w-85">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-semibold leading-tight">
                                Channel Management
                            </h2>
                            <p className="text-sm text-gray-500 leading-tight whitespace-nowrap">
                                Manage channels and sub channels
                            </p>
                        </div>
                    </div>

                    {/* Channel Section Header */}
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Channel
                        </label>

                        <button
                            onClick={() => setOpenAddChannel(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                        >
                            <Plus size={16} />
                            Add New
                        </button>
                    </div>

                    {/* Channel Dropdown */}
                    <div className="mb-6">
                        <select
                            disabled={loadingChannels}
                            value={selectedChannel ?? ''}
                            onChange={(e) =>
                                setSelectedChannel(
                                    e.target.value ? Number(e.target.value) : null
                                )
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>
                                {loadingChannels ? 'Loading channels...' : 'Select Channel'}
                            </option>

                            {channels.map((channel) => (
                                <option key={channel.channelId} value={channel.channelId}>
                                    {channel.channelName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sub Channels */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Sub Channels
                        </h3>

                        <button
                            onClick={() => setOpenAddSubChannel(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                        >
                            <Plus size={16} />
                            Add New
                        </button>
                    </div>

                    <ul className="space-y-1">
                        {loadingSubChannels && (
                            <li className="text-sm text-gray-500">Loading...</li>
                        )}

                        {subChannels.map((sub) => (
                            <li
                                key={sub.subChannelId}
                                onClick={() => setSelectedSubChannel(sub)}
                                className={`px-3 py-2 rounded-lg cursor-pointer transition
                ${selectedSubChannel?.subChannelId === sub.subChannelId
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-sm font-medium">
                                    {sub.subChannelName}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ================= RIGHT PANEL ================= */}
                {selectedSubChannel && (
                    <div className="flex-1 bg-gray-150 rounded-2xl shadow-md border p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedSubChannel.subChannelName} - Details
                        </h3>

                        <div className="rounded-xl">

                            {/* TABS (same placement as Roles) */}
                            <div className="-ml-px pt-2">
                                <CustomTabs
                                    tabs={channelTabs}
                                    defaultValue={activeTab}
                                    onValueChange={(value) =>
                                        setActiveTab(
                                            value as 'designation' | 'location' | 'branch'
                                        )
                                    }
                                />
                            </div>

                            {/* CONTENT */}
                            <div className="-ml-px p-4 -mt-px bg-white rounded-b-xl rounded-tr-xl h-[500px]">

                                {activeTab === 'designation' && (
                                    <>
                                        {loadingDesignation ? (
                                            <div className="flex justify-center items-center py-10">
                                                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Loading hierarchy...
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-12 gap-4 h-[500px]">

                                                {/* LEFT → TREE */}
                                                <div className="col-span-3 h-full overflow-y-auto pr-2">
                                                    <FieldTreeView
                                                        data={designationTreeData}
                                                        onSelect={(node) => {
                                                            if (node.type === "designation") {
                                                                setSelectedDesignation({
                                                                    id: node.id,
                                                                    name: node.name,
                                                                    code: node.code,
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* RIGHT → TABLE */}
                                                <div className="col-span-9 bg-white border rounded-xl p-6 h-full">

                                                    {!selectedDesignation ? (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            Select a designation from the hierarchy
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="max-w-xl">

                                                                <h4 className="text-lg font-semibold text-gray-800 mb-6">
                                                                    Designation Details
                                                                </h4>

                                                                <div className="space-y-4">

                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Designation ID
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedDesignation.id}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Designation Name
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedDesignation.name}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Designation Code
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-blue-600">
                                                                            {selectedDesignation.code}
                                                                        </span>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            {/* ✅ SAVE BUTTON RIGHT SIDE */}
                                                            <div className="flex justify-start pt-6  mt-6">
                                                                <button
                                                                    onClick={handleSaveDesignation}
                                                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg 
                           hover:bg-blue-700 transition font-medium"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'location' && (
                                    <>
                                        {loadingLocations ? (
                                            <div className="flex justify-center items-center h-full">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-sm text-gray-500">
                                                        Loading locations...
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">
                                                <DataTable
                                                    columns={locationColumns}
                                                    data={locations}
                                                    noDataMessage="No Locations Found"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'branch' && (
                                    <>
                                        {loadingBranch ? (
                                            <div className="flex justify-center items-center py-10">
                                                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Loading hierarchy...
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-12 gap-4 h-[500px]">

                                                {/* LEFT → TREE */}
                                                <div className="col-span-3 h-full overflow-y-auto pr-2">
                                                    <FieldTreeView
                                                        data={branchTreeData}
                                                        onSelect={(node) => {
                                                            if (node.type === "branch") {
                                                                setSelectedBranch({
                                                                    id: node.id,
                                                                    name: node.name,
                                                                    code: node.code,
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* RIGHT → DETAILS */}
                                                <div className="col-span-9 bg-white border rounded-xl p-6 h-full">

                                                    {!selectedBranch ? (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            Select a branch from the hierarchy
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="max-w-xl">

                                                                <h4 className="text-lg font-semibold text-gray-800 mb-6">
                                                                    Branch Details
                                                                </h4>

                                                                <div className="space-y-4">

                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Branch ID
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedBranch.id}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Branch Name
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedBranch.name}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Branch Code
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-blue-600">
                                                                            {selectedBranch.code}
                                                                        </span>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            <div className="flex justify-start pt-6 mt-6">
                                                                <button
                                                                    onClick={handleSaveBranch}
                                                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg 
                                    hover:bg-blue-700 transition font-medium"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}