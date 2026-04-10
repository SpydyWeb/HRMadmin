import { useState, useEffect } from "react"
import Button from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { incentiveService } from "@/services/incentiveService"
import { HMSService } from "@/services/hmsService"
import { showToast } from "../ui/sonner"
import { NOTIFICATION_CONSTANTS } from "@/utils/constant"

type User = {
    userId: number
    username: string
}

export function AddUserInline({
    onSuccess,
    programId, // ✅ NEW
}: {
    onSuccess?: (users: User[]) => void
    programId: number
}) {
    const [input, setInput] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [isFocused, setIsFocused] = useState(false)

    // ✅ Fetch from API
    useEffect(() => {
        const fetchWeightages = async () => {
            try {
                const res = await incentiveService.getWeightages()
                console.log("res", res);

                const weightages = res?.responseBody?.weightages || []

                const mappedUsers: User[] = weightages.map((w: any) => ({
                    userId: w.weightageId,
                    username: w.weightageName,
                }))

                setUsers(mappedUsers)
                setFilteredUsers(mappedUsers)
            } catch (error) {
                console.error("Failed to fetch weightages", error)
            }
        }

        fetchWeightages()
    }, [])

    const handleChange = (value: string) => {
        setInput(value)

        setFilteredUsers(
            users.filter(
                (u) =>
                    u.username.toLowerCase().includes(value.toLowerCase()) &&
                    !selectedUsers.some((s) => s.userId === u.userId)
            )
        )
    }

    const addUser = (user: User) => {
        setSelectedUsers((prev) => {
            if (prev.some((u) => u.userId === user.userId)) return prev

            const updated = [...prev, user]

            setFilteredUsers(
                users.filter((u) => !updated.some((s) => s.userId === u.userId))
            )

            return updated
        })

        setInput("")
    }

    const removeUser = (user: User) => {
        setSelectedUsers((prev) => {
            const updated = prev.filter((u) => u.userId !== user.userId)

            setFilteredUsers(
                users.filter((u) => !updated.some((s) => s.userId === u.userId))
            )

            return updated
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()

            const values = input.split(",").map((v) => v.trim()).filter(Boolean)

            values.forEach((val) => {
                const found = users.find(
                    (u) => u.username.toLowerCase() === val.toLowerCase()
                )
                if (found) addUser(found)
            })
        }
    }

    return (
        <div className="relative min-w-0 w-full border rounded-md bg-white p-4">

            {/* Main column — min-w-0 allows flex/grid parents to shrink without overlapping siblings */}
            <div className="min-w-0 space-y-3">
                <h3 className="text-sm font-semibold">Select Weightages</h3>

                {/* Input + Chips */}
                <div className="border rounded-md px-2 py-1 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500">

                    {selectedUsers.map((user) => (
                        <Badge
                            key={user.userId}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md"
                        >
                            {user.username}
                            <span
                                className="cursor-pointer text-xs ml-1"
                                onClick={() => removeUser(user)}
                            >
                                ✕
                            </span>
                        </Badge>
                    ))}

                    <input
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        placeholder="Search weightages..."
                        className="flex-1 min-w-[100px] text-xs h-7 outline-none bg-transparent"
                    />
                </div>

                <p className="text-xs text-gray-500">
                    Tip: type or paste names and press Enter.
                </p>

                {/* Footer */}
                <div className="flex justify-end">
                    <Button
                        variant="blue"
                        disabled={selectedUsers.length === 0}
                        onClick={async () => {
                            try {
                                const weightageIds = selectedUsers.map((u) => u.userId)

                                const payload = {
                                    programId,
                                    weightageIds,
                                }

                                const res = await incentiveService.upsertProgramWeightages(payload)

                                console.log("Weightages saved successfully")
                                if (res?.responseHeader?.errorCode === 1101) {
                                    console.log("✅ Weightages saved successfully")

                                    showToast(
                                        NOTIFICATION_CONSTANTS.SUCCESS,
                                        res?.responseHeader?.errorMessage || "Saved successfully"
                                    )
                                } else {
                                    throw new Error(res?.responseHeader?.errorMessage || "Failed")
                                }
                                onSuccess?.(selectedUsers)

                            } catch (error) {
                                showToast(error)
                            }
                        }}
                    >
                        Save Weightage
                    </Button>
                </div>
            </div>

            {/* Suggestion list: below input on narrow panels, to the side when there is room */}
            {isFocused && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 min-w-[12rem] sm:left-auto sm:right-auto sm:top-0 sm:mt-0 sm:ml-3 sm:w-72 sm:left-full">
                    <ScrollArea className="h-45 border rounded-md bg-white shadow-md">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.userId}
                                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b"
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        addUser(user)
                                    }}
                                >
                                    {user.username}
                                </div>
                            ))
                        ) : (
                            <p className="p-2 text-sm text-gray-400">No data found</p>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}