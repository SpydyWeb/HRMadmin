import { useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import CustomTabs from '@/components/CustomTabs'
import { HMSService } from '@/services/hmsService'
import { useEffect } from 'react'

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

    const [channels, setChannels] = useState<Channel[]>([])
    const [loadingChannels, setLoadingChannels] = useState(false)
    const [subChannels, setSubChannels] = useState<SubChannel[]>([])
    const [loadingSubChannels, setLoadingSubChannels] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
    const [selectedSubChannel, setSelectedSubChannel] = useState<SubChannel | null>(null)
    const [activeTab, setActiveTab] = useState<'designation' | 'location' | 'branch'>('designation')

    const channelTabs = [
        { value: 'designation', label: 'Designation' },
        { value: 'location', label: 'Locations' },
        { value: 'branch', label: 'Branch' },
    ]

    useEffect(() => {
        fetchChannels()
    }, [])

    useEffect(() => {
        if (selectedChannel) {
            fetchSubChannels(selectedChannel)
        }
    }, [selectedChannel])

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
    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
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

                    {/* Channel Dropdown */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Channel
                        </label>

                        <div className="flex items-center justify-between gap-2">
                            <select
                                disabled={loadingChannels}
                                value={selectedChannel ?? ''}
                                onChange={(e) =>
                                    setSelectedChannel(
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                } className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                            <button className="text-blue-600 hover:text-blue-800 p-1">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                    {/* Sub Channels */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Sub Channels
                        </h3>

                        <button className="text-blue-600 hover:text-blue-800">
                            <Plus size={16} />
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
                                    <div className="text-gray-600">
                                        Designation Tree View Area
                                    </div>
                                )}

                                {activeTab === 'location' && (
                                    <div className="text-gray-600">
                                        Location Tree View Area
                                    </div>
                                )}

                                {activeTab === 'branch' && (
                                    <div className="text-gray-600">
                                        Branch Tree View Area
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}