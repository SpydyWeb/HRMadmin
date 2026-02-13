import { useEffect, useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { HMSService } from '@/services/hmsService'


export const Route = createLazyFileRoute('/_auth/roles-management/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])


  // Dummy Data
  const menuData = [
    {
      id: 1,
      name: 'HMS Dashboard (View)',
      menuDescription: 'Allows user to view overall HMS dashboard analytics and summaries.',
      checked: true,
    },
    {
      id: 2,
      name: 'View Agent',
      menuDescription: 'Permission to view agent details including profile and performance data.',
      checked: true,
    },
    {
      id: 3,
      name: 'Save Agent',
      menuDescription: 'Allows user to create or update agent information in the system.',
      checked: false,
    },
    {
      id: 4,
      name: 'Commission Report',
      menuDescription: 'Enables access to commission reports and earnings statements.',
      checked: true,
    },
    {
      id: 5,
      name: 'User Management',
      menuDescription: 'Allows managing users, roles, and access permissions in the system.',
      checked: false,
    },
  ]


  const userData = [
    {
      id: 1,
      userId: 'navink',
      name: 'Navin Kumar',
      designation: 'Manager',
      department: 'Management',
      location: 'Mumbai',
      status: 'Active',
      remove: 'Delete',
    },
    {
      id: 2,
      userId: 'gaurav',
      name: 'Gaurav Rathore',
      designation: 'Manager',
      department: 'IT',
      location: 'Indore',
      status: 'Active',
      remove: 'Delete',
    },
    {
      id: 3,
      userId: 'saurab',
      name: 'Saurab Singh',
      designation: 'Manager',
      department: 'Operations',
      location: 'Delhi',
      status: 'Inactive',
      remove: 'Delete',
    },
    {
      id: 4,
      userId: 'muskan',
      name: 'Muskan Saini',
      designation: 'Manager',
      department: 'HR',
      location: 'Jaipur',
      status: 'Active',
      remove: 'Delete',
    },
    {
      id: 5,
      userId: 'john',
      name: 'John Due',
      designation: 'Manager',
      department: 'Finance',
      location: 'Bangalore',
      status: 'Active',
      remove: 'Delete',
    },
  ]

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await HMSService.getRoles()
        console.log('Roles API response:', response)
        const apiRoles = response?.responseBody?.roles || []

        const roleNames = apiRoles.map(
          (role: { roleName: string }) => role.roleName
        )

        setRoles(roleNames)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }

    fetchRoles()
  }, [])


  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <p className="text-sm text-gray-500 mb-6">
        Under HMS &gt; Access Management &gt; Commission &gt; Review Master
      </p>

      <div className="flex gap-6">
        {/* LEFT SIDE - ROLES */}
        <div className="bg-white rounded-2xl shadow-md border p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Roles</h2>
              <p className="text-sm text-gray-500">
                Manage system access roles
              </p>
            </div>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              <Plus size={16} />
              Add Role
            </button>
          </div>

          <ul className="space-y-1">
            {roles.map((role) => (
              <li
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition
        ${selectedRole === role
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                  }`}
              >
                <div className="h-7 w-7 flex items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm font-medium">{role}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDE - TABS */}
        {selectedRole && (
          <div className="flex-1 bg-white rounded-2xl shadow-md border p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRole} - Role Details
            </h3>

            <Tabs defaultValue="menu" className="w-full">
              <TabsList>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="user">User</TabsTrigger>
              </TabsList>

              {/* MENU TAB */}
              <TabsContent value="menu" className="mt-4">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Menu Name</th>
                      <th className="text-left p-3">Menu Description</th>
                      <th className="text-left p-3">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuData.map((menu) => (
                      <tr key={menu.id} className="border-t">
                        <td className="p-3">{menu.name}</td>
                        <td className="p-3">{menu.menuDescription}</td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            defaultChecked={menu.checked}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabsContent>

              {/* USER TAB */}
              <TabsContent value="user" className="mt-4">
                <div className="flex justify-end mb-4">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Add User to Role
                  </button>
                </div>

                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">User ID</th>
                      <th className="p-3 text-left">User Name</th>
                      <th className="p-3 text-left">Designation</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Location</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Remove</th>

                    </tr>
                  </thead>
                  <tbody>
                    {userData.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="p-3">{user.userId}</td>
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.designation}</td>
                        <td className="p-3">{user.department}</td>
                        <td className="p-3">{user.location}</td>
                        <td className="p-3">{user.status}</td>
                        <td className="p-3">
                          <button
                            className="text-red-600 hover:text-red-800 transition"
                            title="Remove User"
                            onClick={() => {
                              console.log('Delete user:', user.userId)
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
