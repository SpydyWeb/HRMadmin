import { useEffect, useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { HMSService } from '@/services/hmsService'
import DataTable from '@/components/table/DataTable'
import Swal from 'sweetalert2'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createLazyFileRoute('/_auth/roles-management/')({
  component: RouteComponent,
})

function RouteComponent() {
  type Role = {
    roleId: number
    roleName: string
  }
  type MenuAccess = {
    menuId: number
    menuName: string
    hasAccess: boolean
  }
  type RoleUser = {
    userId: number
    username: string
    emailId: string
    isActive: boolean
    isLocked: boolean
    failedLoginAttempts: number
  }

  const [activeTab, setActiveTab] = useState<'menu' | 'user'>('menu')
  const [userList, setUserList] = useState<any[]>([])
  const [userLoading, setUserLoading] = useState(false)
  const [menuAccess, setMenuAccess] = useState<MenuAccess[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [menuLoading, setMenuLoading] = useState(false)
  const [openAddRole, setOpenAddRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [addingRole, setAddingRole] = useState(false)
  const [openAddUser, setOpenAddUser] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [addingUser, setAddingUser] = useState(false)


  const menuData = [
    {
      id: 1,
      name: 'HMS Dashboard (View)',
      menuDescription:
        'Allows user to view overall HMS dashboard.',
      checked: true,
    },
    {
      id: 2,
      name: 'View Agent',
      menuDescription:
        'Permission to view agent details.',
      checked: true,
    },
    {
      id: 3,
      name: 'Save Agent',
      menuDescription:
        'Allows user to create or update agent',
      checked: false,
    },
    {
      id: 4,
      name: 'Commission Report',
      menuDescription:
        'Enables access to commission reports',
      checked: true,
    },
    {
      id: 5,
      name: 'User Management',
      menuDescription:
        'Allows managing users, roles',
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
    },
    {
      id: 2,
      userId: 'gaurav',
      name: 'Gaurav Rathore',
      designation: 'Manager',
      department: 'IT',
      location: 'Indore',
      status: 'Active',
    },
    {
      id: 3,
      userId: 'saurab',
      name: 'Saurab Singh',
      designation: 'Manager',
      department: 'Operations',
      location: 'Delhi',
      status: 'Inactive',
    },
  ]

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await HMSService.getRoles()
        const apiRoles = response?.responseBody?.roles || []
        setRoles(apiRoles) // apiRoles must contain roleId + roleName
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }

    fetchRoles()
  }, [])

  useEffect(() => {
    if (!selectedRole) return

    if (activeTab === 'menu') {
      displayMenu(selectedRole)
    } else if (activeTab === 'user') {
      fetchUserList(selectedRole)
    }
  }, [activeTab])


  /* ================= MENU TABLE COLUMNS ================= */

  const menuColumns = [
    {
      header: 'Menu Name',
      accessor: 'menuName',
    },
    {
      header: 'Access',
      accessor: (row: MenuAccess) => (
        <input
          type="checkbox"
          checked={row.hasAccess}
          onChange={(e) =>
            handleMenuAccessChange(row.menuId, e.target.checked)
          }
        />
      ),
      width: '120px',
    },
  ]



  /* ================= USER TABLE COLUMNS ================= */

  const userColumns = [
    { header: 'User ID', accessor: 'userId' },
    { header: 'Username', accessor: 'username' },
    {
      header: 'Email', accessor: (row: RoleUser) => (
        <span
          className="block max-w-[240px] truncate"
          title={row.emailId}
        >
          {row.emailId}
        </span>
      ),
    },
    {
      header: 'Active',
      accessor: (row: RoleUser) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${row.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Locked',
      accessor: (row: RoleUser) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${row.isLocked
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
            }`}
        >
          {row.isLocked ? 'Yes' : 'No'}
        </span>
      ),
    },
    { header: 'Failed Attempts', accessor: 'failedLoginAttempts' },

    // 🔴 DELETE COLUMN (LAST)
    {
      header: 'Action',
      width: '80px',
      accessor: (row: RoleUser) => (
        <button
          onClick={() => handleDeleteUser(row.username)}
          className="text-red-500 hover:text-red-700 p-1 rounded-md transition"
          title="Remove User"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      Swal.fire('Required', 'Role name is required', 'warning')
      return
    }

    setAddingRole(true)

    try {
      const res = await HMSService.createRole({
        roleName: newRoleName,
        rowVersion: 0,
        role_ID: 0,
        isSystemRole: true,
        isActive: true
      })

      if (res?.responseHeader?.errorCode === 1101) {
        // Refresh role list OR push new role
        const response = await HMSService.getRoles()
        const apiRoles = response?.responseBody?.roles || []
        setRoles(apiRoles)

        setOpenAddRole(false)
        setNewRoleName('')

        Swal.fire('Success', 'Role created successfully', 'success')
      } else {
        Swal.fire(
          'Error',
          res?.responseHeader?.errorMessage || 'Failed to create role',
          'error'
        )
      }
    } catch (error) {
      Swal.fire('Error', 'Server error while creating role', 'error')
    } finally {
      setAddingRole(false)
    }
  }


  const handleAddUser = async () => {
    if (!selectedRole) return

    if (!newUsername.trim()) {
      Swal.fire('Required', 'Username is required', 'warning')
      return
    }

    setAddingUser(true)

    try {
      const res = await HMSService.assignUserToRole({
        userName: newUsername,
        roleId: selectedRole.roleId
      })

      if (res?.responseHeader?.errorCode === 1101) {

        // 🔥 Refresh user list
        await fetchUserList(selectedRole)

        setOpenAddUser(false)
        setNewUsername('')

        Swal.fire(
          'Success',
          'User added to role successfully',
          'success'
        )
      } else {
        Swal.fire(
          'Error',
          res?.responseHeader?.errorMessage || 'Failed to add user',
          'error'
        )
      }
    } catch (error) {
      Swal.fire('Error', 'Server error while adding user', 'error')
    } finally {
      setAddingUser(false)
    }
  }

  const displayMenu = async (role: Role) => {
    setMenuAccess([])
    setMenuLoading(true)

    try {
      const res = await HMSService.fetchMenu(role.roleId)

      if (res?.responseHeader?.errorCode === 1101) {
        const apiMenu = res?.responseBody?.menuAccessList || []

        const formattedMenu = apiMenu.map((item: any) => ({
          menuId: item.menuId,
          menuName: item.menuName,
          hasAccess: item.hasAccess,
        }))

        setMenuAccess(formattedMenu)
      } else {
        setMenuAccess([])
      }
    } catch (error) {
      setMenuAccess([])
      Swal.fire('Error', 'Something went wrong...!', 'error')
    } finally {
      setMenuLoading(false)
    }
  }

  const fetchUserList = async (role: Role) => {
    setUserLoading(true)
    setUserList([])

    try {
      const res = await HMSService.fetchRoleUsers(role.roleId)

      if (res?.responseHeader?.errorCode === 1101) {
        const users = res?.responseBody?.userList || []
        const formattedUsers: RoleUser[] = users.map((user: any) => ({
          userId: user.userId,
          username: user.username,
          emailId: user.emailId,
          isActive: user.isActive,
          isLocked: user.isLocked,
          failedLoginAttempts: user.failedLoginAttempts,
        }))

        setUserList(formattedUsers)
      } else {
        setUserList([])
      }
    } catch (error) {
      setUserList([])
      Swal.fire('Error', 'Failed to load users', 'error')
    } finally {
      setUserLoading(false)
    }
  }

  const handleMenuAccessChange = async (
    menuId: number,
    isChecked: boolean
  ) => {
    if (!selectedRole) return

    const roleId = selectedRole.roleId

    console.log("roleId", roleId);
    console.log("menuId", menuId);
    // 🔹 Optimistic UI update
    setMenuAccess(prev =>
      prev.map(menu =>
        menu.menuId === menuId
          ? { ...menu, hasAccess: isChecked }
          : menu
      )
    )

    try {
      let res

      if (isChecked) {
        res = await HMSService.grantMenuAccess({
          roleId,
          menuId,
        })
        if (res?.responseHeader?.errorCode == 1101) {
          Swal.fire(
            'Success',
            'Menu Access granted successfully...!',
            'success'
          )
        }
        else {
          Swal.fire(
            'Error',
            'Failed to update menu access...!',
            'error'
          )
        }
      } else {
        res = await HMSService.revokeMenuAccess({
          roleId,
          menuId,
        })
        if (res?.responseHeader?.errorCode == 1101) {
          Swal.fire(
            'Success',
            'Menu Access revoked successfully...!',
            'success'
          )
        }
        else {
          Swal.fire(
            'Error',
            'Failed to update menu access...!',
            'error'
          )
        }
      }


    }
    catch (error) {
      // 🔴 Rollback if API fails
      setMenuAccess(prev =>
        prev.map(menu =>
          menu.menuId === menuId
            ? { ...menu, hasAccess: !isChecked }
            : menu
        )
      )

      Swal.fire(
        'Error',
        'Failed to update menu access...!',
        'error'
      )
    }
  }

  const handleDeleteRole = (roleId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this role',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (!result.isConfirmed) return

      try {
        const res = await HMSService.deleteRoles(roleId)

        console.log('Delete role response:', res)

        if (res?.responseHeader?.errorCode === 1101) {
          // ✅ Update UI
          setRoles(prev => prev.filter(r => r.roleId !== roleId))
          setSelectedRole(prev =>
            prev?.roleId === roleId ? null : prev
          )

          Swal.fire('Deleted!', 'Role has been deleted.', 'success')
        } else {
          Swal.fire(
            'Error',
            res?.responseHeader?.errorMessage || 'Delete failed',
            'error'
          )
        }
      } catch (error) {
        Swal.fire('Error', 'Server error while deleting role', 'error')
      }
    })
  }

  const handleDeleteUser = (userName: string) => {
    if (!selectedRole) return
    const roleId = selectedRole.roleId

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to remove this user from the role',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove!',
    }).then(async (result) => {
      if (!result.isConfirmed) return

      try {
        const res = await HMSService.removeUserFromRole({
          userName,
          roleId
        })

        if (res?.responseHeader?.errorCode === 1101) {
          // ✅ Remove from UI using username (since API uses userName)
          setUserList(prev =>
            prev.filter(u => u.username !== userName)
          )

          Swal.fire(
            'Removed!',
            'User removed from role successfully.',
            'success'
          )
        } else {
          Swal.fire(
            'Error',
            res?.responseHeader?.errorMessage || 'Operation failed',
            'error'
          )
        }
      } catch (error) {
        Swal.fire(
          'Error',
          'Server error while removing user',
          'error'
        )
      }
    })
  }

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role)

    if (activeTab === 'menu') {
      displayMenu(role)
    } else if (activeTab === 'user') {
      fetchUserList(role)
    }
  }


  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <AlertDialog open={openAddRole} onOpenChange={setOpenAddRole}>
        <AlertDialogContent className="sm:max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
              Add New Role
            </AlertDialogTitle>
          </AlertDialogHeader>

          {/* BODY */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* FOOTER */}
          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel
              onClick={() => setNewRoleName('')}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>

            <button
              onClick={handleAddRole}
              disabled={addingRole}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {addingRole ? 'Saving...' : 'Submit'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openAddUser} onOpenChange={setOpenAddUser}>
        <AlertDialogContent className="sm:max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
              Add User To Role
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <AlertDialogFooter className="mt-6 flex justify-end gap-3">
            <AlertDialogCancel
              onClick={() => setNewUsername('')}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>

            <button
              onClick={handleAddUser}
              disabled={addingUser}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {addingUser ? 'Saving...' : 'Submit'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

            <button
              onClick={() => setOpenAddRole(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              <Plus size={16} />
              Add Role
            </button>
          </div>

          <ul className="space-y-1">
            {roles.map((role) => (
              <li
                key={role.roleId}
                onClick={() => handleRoleClick(role)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition
      ${selectedRole?.roleId === role.roleId
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                  }`}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 flex items-center justify-center rounded-md bg-blue-50 text-blue-600">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-sm font-medium">dd{role.roleName}</span>
                </div>

                {/* DELETE ICON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation() // prevent role selection
                    handleDeleteRole(role.roleId)
                    console.log('Delete role:', role)
                  }}
                  className="text-red-500 hover:text-red-700 p-1 rounded-md transition"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>

        </div>

        {/* RIGHT SIDE */}
        {selectedRole && (
          <div className="flex-1 bg-white rounded-2xl shadow-md border p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRole?.roleName} - Role Details
            </h3>

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'menu' | 'user')}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="user">User</TabsTrigger>
              </TabsList>

              {/* MENU TAB */}
              <TabsContent value="menu" className="mt-4">
                {menuLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading menu access...
                    </span>
                  </div>
                ) : (
                  <DataTable
                    columns={menuColumns}
                    data={menuAccess}
                  />
                )}
              </TabsContent>

              {/* USER TAB */}
              <TabsContent value="user" className="mt-4">
                {/* HEADER WITH ADD BUTTON */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setOpenAddUser(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <Plus size={16} />
                    Add User
                  </button>
                </div>
                {userLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading users...
                    </span>
                  </div>
                ) : (
                  <DataTable
                    columns={userColumns}
                    data={userList}
                  />
                )}
              </TabsContent>

            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
