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
import { Plus, Pencil, Save } from 'lucide-react'
import { MdCancel } from 'react-icons/md'

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
    const [isEditingDesignation, setIsEditingDesignation] = useState(false)
    const [activeTab, setActiveTab] = useState<
        'designation' | 'location' | 'branch' | 'partner'
    >('designation')
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
    const [parentOptions, setParentOptions] = useState<
        { id: number; name: string }[]
    >([])

    const [selectedParentBranchId, setSelectedParentBranchId] = useState<number | null>(null)
    const [branchParentOptions, setBranchParentOptions] = useState<
        { id: number; name: string }[]
    >([])
    const [branchTreeData, setBranchTreeData] = useState<any[]>([])
    const [loadingBranch, setLoadingBranch] = useState(false)

    const [selectedBranch, setSelectedBranch] = useState<{
        id: number
        name: string
        code: string
    } | null>(null)
    const [partnerTreeData, setPartnerTreeData] = useState<any[]>([])
    const [loadingPartner, setLoadingPartner] = useState(false)

    const [selectedPartner, setSelectedPartner] = useState<{
        id: number
        name: string
        code: string
        address: string
        mail: string
        phone: string
        relationMgr: number,
    } | null>(null)
    const [openAddDesignation, setOpenAddDesignation] = useState(false)
    const [newDesignationName, setNewDesignationName] = useState('')
    const [newDesignationCode, setNewDesignationCode] = useState('')
    const [addingDesignation, setAddingDesignation] = useState(false)
    const channelTabs = [
        { value: 'designation', label: 'Designation' },
        { value: 'location', label: 'Locations' },
        { value: 'branch', label: 'Branch' },
        { value: 'partner', label: 'Partner' },   // ✅ new tab
    ]
    const [isEditingBranch, setIsEditingBranch] = useState(false)
    const [openAddBranch, setOpenAddBranch] = useState(false)
    const [newBranchName, setNewBranchName] = useState('')
    const [newBranchCode, setNewBranchCode] = useState('')
    const [addingBranch, setAddingBranch] = useState(false)
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
    const [openEditLocation, setOpenEditLocation] = useState(false)
    const [editingLocation, setEditingLocation] = useState<Location | null>(null)
    const [editLocationCode, setEditLocationCode] = useState("")
    const [editLocationDesc, setEditLocationDesc] = useState("")
    const [updatingLocation, setUpdatingLocation] = useState(false)

    const [addingPartner, setAddingPartner] = useState(false)
    const [isEditingPartner, setIsEditingPartner] = useState(false)
    const [openAddPartner, setOpenAddPartner] = useState(false)
    const [newPartnerName, setNewPartnerName] = useState('')
    const [newPartnerCode, setNewPartnerCode] = useState('')

    const [newPartnerAddress, setNewPartnerAddress] = useState('')
    const [newPartnerMail, setNewPartnerMail] = useState('')
    const [newPartnerPhone, setNewPartnerPhone] = useState('')
    const [newRelationMgr, setNewRelationMgr] = useState('')
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
            activeTab === "partner" &&
            selectedChannel &&
            selectedSubChannel
        ) {
            fetchPartnerHierarchy()
        }
    }, [activeTab, selectedChannel, selectedSubChannel])

    useEffect(() => {
        if (!branchTreeData.length) return

        const collectBranches = (data: any[], arr: any[] = []) => {
            data.forEach((item) => {
                arr.push({ id: item.id, name: item.name })

                if (item.children?.length) {
                    collectBranches(item.children, arr)
                }
            })
            return arr
        }

        const allBranches = collectBranches(branchTreeData)
        setBranchParentOptions(allBranches)

    }, [branchTreeData])

    useEffect(() => {
        if (
            (activeTab === "location" || activeTab === "branch") &&
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

    useEffect(() => {
        if (!designationTreeData.length) return

        const flattenTree = (data: any[], arr: any[] = []) => {
            data.forEach((item) => {
                arr.push({ id: item.id, name: item.name })

                if (item.children?.length) {
                    flattenTree(item.children, arr)
                }
            })
            return arr
        }

        const allDesignations = flattenTree(designationTreeData)
        setParentOptions(allDesignations)

    }, [designationTreeData])

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
            console.log("this is location", list);
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
            setSelectedDesignation(null)   // 👈 ADD THIS LINE

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

    const fetchPartnerHierarchy = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        try {
            setLoadingPartner(true)

            const res = await HMSService.getPartnerHierarchy({
                partnerBranchHierarchyId: 0,
                parentBranchHierarchyId: 0,
                orgId: 0,
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
                partnerBranchCode: "",
                partnerBranch: "",
                partnerAddress: "",
                partnerMail: "",
                partnerPhone: "",
                hierarchyPath: "",
                relationMgr: 0
            })

            const apiData = res?.responseBody?.partnerBranchNode || []

            const formatTree = (data: any[]): any[] => {
                return data.map((item) => ({
                    id: item.partnerBranchHeirarchyId,
                    name: item.name,
                    code: item.partnerBranchCode,
                    partnerAddress: item.partnerAddress,
                    partnerMail: item.partnerMail,
                    partnerPhone: item.partnerPhone,
                    relationMgr: item.relationMgr,
                    type: "partner",
                    children: item.reportingBranches?.length
                        ? formatTree(item.reportingBranches)
                        : [],
                }))
            }

            setPartnerTreeData(formatTree(apiData))
            setSelectedPartner(null)

        } catch (error) {
            console.error("Failed to fetch partner hierarchy", error)
        } finally {
            setLoadingPartner(false)
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


    const handleEditLocation = (row: Location) => {
        setEditingLocation(row)
        setEditLocationCode(row.locationCode)
        setEditLocationDesc(row.locationDesc)
        setOpenEditLocation(true)
    }

    const updateLocation = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        try {
            setUpdatingLocation(true)

            const payload = {
                locationMasterId: editingLocation?.locationMasterId ?? null, // ✅ allow null for new
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
                locationCode: editLocationCode,
                locationDesc: editLocationDesc,
                isActive: true,
            }

            const res = await HMSService.saveLocation(payload)

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(
                    NOTIFICATION_CONSTANTS.SUCCESS,
                    editingLocation
                        ? "Location updated successfully"
                        : "Location added successfully"
                )

                setOpenEditLocation(false)
                fetchLocations()
            } else {
                showToast(
                    NOTIFICATION_CONSTANTS.ERROR,
                    res?.responseHeader?.errorMessage || "Operation failed"
                )
            }
        } catch (error) {
            showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                "Server error while saving location"
            )
        } finally {
            setUpdatingLocation(false)
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
                parentDesignationId: selectedParentId ?? 0,  // 👈 dynamic parent
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
                locationMasterId: selectedLocationId ?? 0,
                parentBranchId: selectedParentBranchId ?? 0,
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

    const handleSavePartner = async () => {
        if (!selectedPartner || !selectedChannel || !selectedSubChannel) return

        try {
            setGlobalLoading(true)

            const payload = {
                partnerBranchHierarchyId: selectedPartner.id ?? 0,
                parentBranchHierarchyId: 0,
                orgId: 0,
                partnerBranch: selectedPartner.name ?? "",
                partnerBranchCode: selectedPartner.code ?? "",
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
                partnerAddress: selectedPartner.address,
                partnerMail: selectedPartner.mail,
                partnerPhone: selectedPartner.phone,
                hierarchyPath: null,
                relationMgr: selectedPartner.relationMgr,
                isActive: true,
            }

            const res = await HMSService.savePartner(payload)

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(
                    NOTIFICATION_CONSTANTS.SUCCESS,
                    "Partner saved successfully"
                )
                setIsEditingPartner(false)
                fetchPartnerHierarchy()
            } else {
                showToast(
                    NOTIFICATION_CONSTANTS.ERROR,
                    res?.responseHeader?.errorMessage || "Save failed"
                )
            }
        } catch (error) {
            showToast(
                NOTIFICATION_CONSTANTS.ERROR,
                "Server error while saving partner"
            )
        } finally {
            setGlobalLoading(false)
        }
    }

    const handleAddDesignation = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        const isRootCreation = designationTreeData.length === 0

        // ✅ Require parent only if hierarchy exists
        if (!isRootCreation && !selectedDesignation) {
            showToast(
                NOTIFICATION_CONSTANTS.WARNING,
                "Please select parent designation"
            )
            return
        }

        if (!newDesignationName.trim()) {
            showToast(
                NOTIFICATION_CONSTANTS.WARNING,
                "Designation name is required"
            )
            return
        }

        try {
            setAddingDesignation(true)

            const payload = {
                designationId: 0,
                parentDesignationId: isRootCreation
                    ? 0
                    : selectedDesignation.id, // ✅ dynamic parent
                designationCode: newDesignationCode,
                designationName: newDesignationName,
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
                    "Designation added successfully"
                )

                setOpenAddDesignation(false)
                setNewDesignationName('')
                setNewDesignationCode('')

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
                "Server error while adding designation"
            )
        } finally {
            setAddingDesignation(false)
        }
    }

    const handleAddBranch = async () => {
        if (!selectedChannel || !selectedSubChannel) return

        const isRootCreation = branchTreeData.length === 0

        // ✅ Require parent only if hierarchy exists
        if (!isRootCreation && !selectedBranch) {
            showToast(
                NOTIFICATION_CONSTANTS.WARNING,
                "Please select parent branch"
            )
            return
        }

        if (!newBranchName.trim()) {
            showToast(
                NOTIFICATION_CONSTANTS.WARNING,
                "Branch name is required"
            )
            return
        }

        try {
            setAddingBranch(true)

            const payload = {
                branchId: 0,
                branchCode: newBranchCode,
                branchName: newBranchName,
                address: null,
                state: 0,
                phoneNumber: null,
                emailId: null,
                isActive: true,
                locationMasterId: 0,
                parentBranchId: isRootCreation
                    ? 0
                    : selectedBranch.id, // ✅ dynamic parent
                channelId: selectedChannel,
                subChannelId: selectedSubChannel.subChannelId,
            }

            const res = await HMSService.saveBranch(payload)

            if (res?.responseHeader?.errorCode === 1101) {
                showToast(
                    NOTIFICATION_CONSTANTS.SUCCESS,
                    "Branch added successfully"
                )

                setOpenAddBranch(false)
                setNewBranchName('')
                setNewBranchCode('')

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
                "Server error while adding branch"
            )
        } finally {
            setAddingBranch(false)
        }
    }

    const handleAddPartner = async () => {
        if (!newPartnerName || !newPartnerCode) {
            showToast(NOTIFICATION_CONSTANTS.ERROR, "Please fill all fields")
            return
        }

        try {
            setAddingPartner(true)

            // await HMSService.savePartner({
            //     partnerBranchHierarchyId: selectedPartner.id ?? 0,
            //     parentBranchHierarchyId: 0,
            //     orgId: 0,
            //     partnerBranch: selectedPartner.name ?? "",
            //     partnerBranchCode: selectedPartner.code ?? "",
            //     channelId: selectedChannel,
            //     subChannelId: selectedSubChannel.subChannelId,
            //     partnerAddress: selectedPartner.address,
            //     partnerMail: selectedPartner.mail,
            //     partnerPhone: selectedPartner.phone,
            //     hierarchyPath: null,
            //     relationMgr: selectedPartner.relationMgr,
            //     isActive: true,


            //     name: newPartnerName,
            //     partnerBranchCode: newPartnerCode,
            //     partnerAddress: newPartnerAddress,
            //     partnerMail: newPartnerMail,
            //     partnerPhone: newPartnerPhone,
            //     relationMgr: Number(newRelationMgr),
            //     parentId: selectedPartner?.id || null,
            // })

            showToast(NOTIFICATION_CONSTANTS.SUCCESS, "Partner added successfully")

            setOpenAddPartner(false)
            fetchPartnerHierarchy()

        } catch (error) {
            console.error(error)
        } finally {
            setAddingPartner(false)
        }
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {globalLoading && <Loading />}
            <AlertDialog
                open={openAddPartner}
                onOpenChange={(open) => {
                    setOpenAddPartner(open)
                    if (!open) {
                        setNewPartnerName('')
                        setNewPartnerCode('')
                        setNewPartnerAddress('')
                        setNewPartnerMail('')
                        setNewPartnerPhone('')
                        setNewRelationMgr('')
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add Partner</AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="space-y-3 mt-3">
                        <input
                            placeholder="Partner Name"
                            value={newPartnerName}
                            onChange={(e) => setNewPartnerName(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Partner Code"
                            value={newPartnerCode}
                            onChange={(e) => setNewPartnerCode(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Partner Address"
                            value={newPartnerAddress}
                            onChange={(e) => setNewPartnerAddress(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Partner Mail"
                            value={newPartnerMail}
                            onChange={(e) => setNewPartnerMail(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Partner Phone"
                            value={newPartnerPhone}
                            onChange={(e) => setNewPartnerPhone(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <input
                            placeholder="Relation Manager ID"
                            value={newRelationMgr}
                            onChange={(e) => setNewRelationMgr(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                    </div>

                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel asChild>
                            <button
                                onClick={() => {
                                    setNewPartnerName('')
                                    setNewPartnerCode('')
                                    setNewPartnerAddress('')
                                    setNewPartnerMail('')
                                    setNewPartnerPhone('')
                                    setNewRelationMgr('')
                                }}
                                className="px-4 py-2 text-sm border rounded-md flex items-center gap-1"
                            >
                                <MdCancel size={16} />
                                Cancel
                            </button>
                        </AlertDialogCancel>

                        <button
                            onClick={handleAddPartner}
                            disabled={addingPartner}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center gap-1 hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {addingPartner ? "Saving..." : "Save"}
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={openEditLocation} onOpenChange={setOpenEditLocation}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        {editingLocation ? "Edit Location" : "Add New Location"}
                    </AlertDialogHeader>

                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-sm font-medium">Location Code</label>
                            <input
                                type="text"
                                value={editLocationCode}
                                onChange={(e) => setEditLocationCode(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Location Description</label>
                            <input
                                type="text"
                                value={editLocationDesc}
                                onChange={(e) => setEditLocationDesc(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                            />
                        </div>
                    </div>

                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel asChild>
                            <button className="px-4 py-2 text-sm border rounded-md flex items-center gap-1">
                                <MdCancel size={16} /> Cancel
                            </button>
                        </AlertDialogCancel>

                        <button
                            onClick={updateLocation}
                            disabled={updatingLocation}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center gap-1 hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {updatingLocation ? "Updating..." : "Update"}
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={openAddBranch} onOpenChange={setOpenAddBranch}>
                <AlertDialogContent className="sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Add New Branch
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="space-y-4 mt-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Branch Code
                            </label>
                            <input
                                type="text"
                                value={newBranchCode}
                                onChange={(e) => setNewBranchCode(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Branch Name
                            </label>
                            <input
                                type="text"
                                value={newBranchName}
                                onChange={(e) => setNewBranchName(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                    </div>

                    <AlertDialogFooter className="mt-6">

                        <AlertDialogCancel
                            onClick={() => {
                                setNewBranchName('')
                                setNewBranchCode('')
                            }}
                        >
                            <button className="px-2 py-2 text-sm border rounded-md flex items-center gap-1">
                                <MdCancel size={16} /> Cancel
                            </button>
                        </AlertDialogCancel>

                        <button
                            onClick={handleAddBranch}
                            disabled={addingBranch}
                            className="flex items-center bg-blue-600 gap-1 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Save size={14} />
                            {addingDesignation ? "Saving..." : "Save"}
                        </button>

                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={openAddDesignation} onOpenChange={setOpenAddDesignation}>
                <AlertDialogContent className="sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Add New Designation
                        </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="space-y-4 mt-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Designation Code
                            </label>
                            <input
                                type="text"
                                value={newDesignationCode}
                                onChange={(e) => setNewDesignationCode(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Designation Name
                            </label>
                            <input
                                type="text"
                                value={newDesignationName}
                                onChange={(e) => setNewDesignationName(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                    </div>

                    <AlertDialogFooter className="mt-6">
                        {/* <AlertDialogCancel asChild>
                            <button className="px-4 py-2 text-sm border rounded-md flex items-center gap-1">
                                <MdCancel size={16} /> Cancel
                            </button>
                        </AlertDialogCancel> */}
                        <AlertDialogCancel
                            className="w-20"
                            onClick={() => {
                                setNewDesignationName('')
                                setNewDesignationCode('')
                            }}
                        >
                            <button className="px-2 py-2 text-sm border rounded-md flex items-center gap-1">
                                <MdCancel size={16} /> Cancel
                            </button>
                        </AlertDialogCancel>

                        <button
                            onClick={handleAddDesignation}
                            disabled={addingDesignation}
                            className="flex items-center bg-blue-600 gap-1 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Save size={14} />
                            {addingDesignation ? "Saving..." : "Save"}
                        </button>

                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
                                            value as 'designation' | 'location' | 'branch' | 'partner'
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
                                        ) : designationTreeData.length === 0 ? (
                                            <div className="flex justify-center items-center h-full text-gray-400">
                                                No hierarchy data available
                                                <button
                                                    onClick={() => {
                                                        // ✅ If no hierarchy exists → allow root creation
                                                        if (designationTreeData.length === 0) {
                                                            setOpenAddDesignation(true)
                                                            return
                                                        }

                                                        // ✅ If hierarchy exists → parent required
                                                        if (!selectedDesignation) {
                                                            showToast(
                                                                NOTIFICATION_CONSTANTS.WARNING,
                                                                "Please select parent designation"
                                                            )
                                                            return
                                                        }

                                                        setOpenAddDesignation(true)
                                                    }}
                                                    className="flex ml-4 items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                >
                                                    <Plus size={14} />
                                                    Add New
                                                </button>
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
                                                                setIsEditingDesignation(false)   // reset edit mode
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* RIGHT → TABLE */}
                                                <div className="col-span-9 bg-white border rounded-xl p-6 h-full">

                                                    {selectedDesignation ? (   // ✅ FIXED
                                                        <>
                                                            <div className="max-w-xl">

                                                                <div className="flex items-center justify-between mb-6">
                                                                    <h4 className="text-lg font-semibold text-gray-800">
                                                                        Designation Details
                                                                    </h4>

                                                                    <div className="flex items-center gap-2">
                                                                        {!isEditingDesignation ? (
                                                                            <>
                                                                                {/* ADD NEW */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (!selectedDesignation) return
                                                                                        setOpenAddDesignation(true)
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                                                >
                                                                                    <Plus size={14} />
                                                                                    Add New
                                                                                </button>

                                                                                {/* EDIT */}
                                                                                <button
                                                                                    onClick={() => setIsEditingDesignation(true)}
                                                                                    className="flex items-center gap-1.5 bg-gray-600 text-white px-4 py-2 text-sm rounded-md hover:bg-gray-700 transition font-medium"
                                                                                >
                                                                                    <Pencil size={14} />
                                                                                    Edit
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {/* SAVE */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleSaveDesignation()
                                                                                        setIsEditingDesignation(false)
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                                                >
                                                                                    <Save size={14} />
                                                                                    Save
                                                                                </button>

                                                                                {/* CANCEL */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setIsEditingDesignation(false)
                                                                                        setSelectedParentId(null)
                                                                                    }}

                                                                                    className="flex items-center gap-1.5 bg-gray-600 text-white px-4 py-2 text-sm rounded-md hover:bg-gray-500 transition font-medium"
                                                                                >
                                                                                    <MdCancel size={14} />
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">

                                                                    {/* ID */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Designation ID
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedDesignation.id}
                                                                        </span>
                                                                    </div>
                                                                    {/* 🔥 ADD HERE - Parent Designation */}
                                                                    {isEditingDesignation && (
                                                                        <div className="flex justify-between items-center border-b pb-3">
                                                                            <span className="text-sm font-medium text-gray-500">
                                                                                Parent Designation
                                                                            </span>

                                                                            <select
                                                                                value={selectedParentId ?? ""}
                                                                                onChange={(e) => setSelectedParentId(Number(e.target.value))}
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            >
                                                                                <option value="">Select Parent</option>

                                                                                {parentOptions
                                                                                    .filter((item) => item.id !== selectedDesignation?.id)
                                                                                    .map((item) => (
                                                                                        <option key={item.id} value={item.id}>
                                                                                            {item.name}
                                                                                        </option>
                                                                                    ))}
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                    {/* NAME */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Designation Name
                                                                        </span>

                                                                        {isEditingDesignation ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedDesignation.name}
                                                                                onChange={(e) =>
                                                                                    setSelectedDesignation((prev) =>
                                                                                        prev ? { ...prev, name: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedDesignation.name}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* CODE */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Designation Code
                                                                        </span>

                                                                        {isEditingDesignation ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedDesignation.code}
                                                                                onChange={(e) =>
                                                                                    setSelectedDesignation((prev) =>
                                                                                        prev ? { ...prev, code: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-blue-600">
                                                                                {selectedDesignation.code}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            Select a designation from the hierarchy
                                                        </div>
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
                                            <div className="bg-white border rounded-xl p-6">

                                                {/* HEADER */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-lg font-semibold text-gray-800">
                                                        Location List
                                                    </h4>

                                                    <button
                                                        onClick={() => {
                                                            setEditingLocation(null)
                                                            setEditLocationCode("")
                                                            setEditLocationDesc("")
                                                            setOpenEditLocation(true)
                                                        }}
                                                        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                    >
                                                        <Plus size={14} />
                                                        Add New
                                                    </button>
                                                </div>

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
                                        ) : branchTreeData.length === 0 ? (
                                            <div className="flex justify-center items-center h-full text-gray-400">
                                                No hierarchy data available
                                                <button
                                                    onClick={() => {
                                                        // ✅ If no hierarchy exists → allow root creation
                                                        if (branchTreeData.length === 0) {
                                                            setOpenAddBranch(true)
                                                            return
                                                        }

                                                        // ✅ If hierarchy exists → parent required
                                                        if (!selectedDesignation) {
                                                            showToast(
                                                                NOTIFICATION_CONSTANTS.WARNING,
                                                                "Please select parent designation"
                                                            )
                                                            return
                                                        }

                                                        setOpenAddBranch(true)
                                                    }}
                                                    className="flex ml-4 items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                >
                                                    <Plus size={14} />
                                                    Add New
                                                </button>
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
                                                                setIsEditingBranch(false)   // reset edit mode
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* RIGHT → DETAILS */}
                                                <div className="col-span-9 bg-white border rounded-xl p-6 h-full">

                                                    {selectedBranch ? (
                                                        <>
                                                            <div className="max-w-xl">

                                                                <div className="flex items-center justify-between mb-6">

                                                                    <h4 className="text-lg font-semibold text-gray-800">
                                                                        Branch Details
                                                                    </h4>

                                                                    <div className="flex items-center gap-2">

                                                                        {!isEditingBranch ? (
                                                                            <>
                                                                                {/* ADD NEW */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (!selectedBranch) {
                                                                                            showToast(
                                                                                                NOTIFICATION_CONSTANTS.WARNING,
                                                                                                "Please select parent branch"
                                                                                            )
                                                                                            return
                                                                                        }
                                                                                        setOpenAddBranch(true)
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                                                >
                                                                                    <Plus size={14} />
                                                                                    Add New
                                                                                </button>

                                                                                {/* EDIT */}
                                                                                <button
                                                                                    onClick={() => setIsEditingBranch(true)}
                                                                                    className="flex items-center gap-1.5 bg-gray-600 text-white px-4 py-2 text-sm rounded-md hover:bg-gray-700 transition font-medium"
                                                                                >
                                                                                    <Pencil size={14} />
                                                                                    Edit
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {/* SAVE */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleSaveBranch()
                                                                                        setIsEditingBranch(false)
                                                                                        setSelectedLocationId(null)
                                                                                        setSelectedParentBranchId(null)
                                                                                    }}
                                                                                    className="flex items-center bg-blue-600 text-white gap-1.5 px-4 py-2 text-sm rounded-md hover:bg-green-700 transition font-medium"
                                                                                >
                                                                                    <Save size={14} />
                                                                                    Save
                                                                                </button>

                                                                                {/* CANCEL */}
                                                                                <button
                                                                                    onClick={() => setIsEditingBranch(false)}
                                                                                    className="flex items-center bg-gray-600 text-white gap-1.5 px-4 py-2 text-sm rounded-md hover:bg-gray-500 transition font-medium"
                                                                                >
                                                                                    <MdCancel size={14} />
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">

                                                                    {/* ID */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Branch ID
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedBranch.id}
                                                                        </span>
                                                                    </div>
                                                                    {/* LOCATION DROPDOWN */}
                                                                    {isEditingBranch && (
                                                                        <div className="flex justify-between items-center border-b pb-3">
                                                                            <span className="text-sm font-medium text-gray-500">
                                                                                Location
                                                                            </span>

                                                                            <select
                                                                                value={selectedLocationId ?? ""}
                                                                                onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            >
                                                                                <option value="">Select Location</option>

                                                                                {locations.map((loc) => (
                                                                                    <option
                                                                                        key={loc.locationMasterId}
                                                                                        value={loc.locationMasterId}
                                                                                    >
                                                                                        {loc.locationDesc}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    )}

                                                                    {isEditingBranch && (
                                                                        <div className="flex justify-between items-center border-b pb-3">
                                                                            <span className="text-sm font-medium text-gray-500">
                                                                                Parent Branch
                                                                            </span>

                                                                            <select
                                                                                value={selectedParentBranchId ?? ""}
                                                                                onChange={(e) =>
                                                                                    setSelectedParentBranchId(Number(e.target.value))
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            >
                                                                                <option value="">Select Parent</option>

                                                                                {branchParentOptions
                                                                                    .filter((item) => item.id !== selectedBranch?.id)
                                                                                    .map((item) => (
                                                                                        <option key={item.id} value={item.id}>
                                                                                            {item.name}
                                                                                        </option>
                                                                                    ))}
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                    {/* NAME */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Branch Name
                                                                        </span>

                                                                        {isEditingBranch ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedBranch.name}
                                                                                onChange={(e) =>
                                                                                    setSelectedBranch((prev) =>
                                                                                        prev ? { ...prev, name: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedBranch.name}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* CODE */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Branch Code
                                                                        </span>

                                                                        {isEditingBranch ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedBranch.code}
                                                                                onChange={(e) =>
                                                                                    setSelectedBranch((prev) =>
                                                                                        prev ? { ...prev, code: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-blue-600">
                                                                                {selectedBranch.code}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            Select a branch from the hierarchy
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'partner' && (
                                    <>
                                        {loadingPartner ? (
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
                                                        data={partnerTreeData}
                                                        onSelect={(node) => {
                                                            if (node.type === "partner") {
                                                                setSelectedPartner({
                                                                    id: node.id,
                                                                    name: node.name,
                                                                    code: node.code,
                                                                    address: node.partnerAddress,
                                                                    mail: node.partnerMail,
                                                                    phone: node.partnerPhone,
                                                                    relationMgr: node.relationMgr,
                                                                })
                                                                setIsEditingPartner(false)
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {/* RIGHT → DETAILS */}
                                                <div className="col-span-9 bg-white border rounded-xl p-6 h-full">

                                                    {!selectedPartner ? (
                                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                            Select a partner from the hierarchy
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="max-w-xl">

                                                                <div className="flex items-center justify-between mb-6">

                                                                    <h4 className="text-lg font-semibold text-gray-800">
                                                                        Partner Details
                                                                    </h4>

                                                                    <div className="flex items-center gap-2">

                                                                        {!isEditingPartner ? (
                                                                            <>
                                                                                {/* ADD NEW */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (!selectedPartner) {
                                                                                            showToast(
                                                                                                NOTIFICATION_CONSTANTS.WARNING,
                                                                                                "Please select parent partner"
                                                                                            )
                                                                                            return
                                                                                        }
                                                                                        setOpenAddPartner(true)
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                                                >
                                                                                    <Plus size={14} />
                                                                                    Add New
                                                                                </button>

                                                                                {/* EDIT */}
                                                                                <button
                                                                                    onClick={() => setIsEditingPartner(true)}
                                                                                    className="flex items-center gap-1.5 bg-gray-600 text-white px-4 py-2 text-sm rounded-md hover:bg-gray-700 transition font-medium"
                                                                                >
                                                                                    <Pencil size={14} />
                                                                                    Edit
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {/* SAVE */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleSavePartner()
                                                                                    }}
                                                                                    className="flex items-center bg-blue-600 text-white gap-1.5 px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-medium"
                                                                                >
                                                                                    <Save size={14} />
                                                                                    Save
                                                                                </button>

                                                                                {/* CANCEL */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setIsEditingPartner(false)
                                                                                    }}
                                                                                    className="flex items-center bg-gray-600 text-white gap-1.5 px-4 py-2 text-sm rounded-md hover:bg-gray-500 transition font-medium"
                                                                                >
                                                                                    <MdCancel size={14} />
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">

                                                                    {/* ID */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Partner ID
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-800">
                                                                            {selectedPartner.id}
                                                                        </span>
                                                                    </div>

                                                                    {/* NAME */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Partner Name
                                                                        </span>

                                                                        {isEditingPartner ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedPartner.name}
                                                                                onChange={(e) =>
                                                                                    setSelectedPartner((prev) =>
                                                                                        prev ? { ...prev, name: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedPartner.name}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* CODE */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Partner Code
                                                                        </span>

                                                                        {isEditingPartner ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedPartner.code}
                                                                                onChange={(e) =>
                                                                                    setSelectedPartner((prev) =>
                                                                                        prev ? { ...prev, code: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedPartner.code}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* CODE */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Partner Address
                                                                        </span>

                                                                        {isEditingPartner ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedPartner.address}
                                                                                onChange={(e) =>
                                                                                    setSelectedPartner((prev) =>
                                                                                        prev ? { ...prev, code: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedPartner.address}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* CODE */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Partner Mail
                                                                        </span>

                                                                        {isEditingPartner ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedPartner.mail}
                                                                                onChange={(e) =>
                                                                                    setSelectedPartner((prev) =>
                                                                                        prev ? { ...prev, code: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedPartner.mail}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* CODE */}
                                                                    <div className="flex justify-between items-center border-b pb-3">
                                                                        <span className="text-sm font-medium text-gray-500">
                                                                            Partner Phone
                                                                        </span>

                                                                        {isEditingPartner ? (
                                                                            <input
                                                                                type="text"
                                                                                value={selectedPartner.phone}
                                                                                onChange={(e) =>
                                                                                    setSelectedPartner((prev) =>
                                                                                        prev ? { ...prev, code: e.target.value } : null
                                                                                    )
                                                                                }
                                                                                className="border rounded-md px-3 py-1 text-sm w-52 focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-sm font-semibold text-gray-800">
                                                                                {selectedPartner.phone}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
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
        </div >
    )
}