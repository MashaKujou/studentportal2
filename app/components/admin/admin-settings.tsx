"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Settings, UserPlus, Trash2 } from 'lucide-react'
import { userStorage, type Admin } from "@/lib/storage"
import { validateEmail, validatePassword } from "@/lib/validation"
import { ExportAccounts } from './export-accounts'

export const AdminSettings = () => {
  const [newCollegerCourse, setNewCollegerCourse] = useState("")
  const [settings, setSettings] = useState({
    systemName: "Student Portal",
    maintenanceMode: false,
  })

  const [admins, setAdmins] = useState<Admin[]>([])
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load admins on mount
  useEffect(() => {
    const loadedAdmins = userStorage.getAdmins()
    setAdmins(loadedAdmins)
  }, [])

  const handleSaveSettings = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings))
  }

  const handleAddAdmin = () => {
    setErrors({})

    // Validate email
    if (!validateEmail(adminForm.email).valid) {
      setErrors({ email: "Invalid email address" })
      return
    }

    // Validate password
    const passwordValidation = validatePassword(adminForm.password)
    if (!passwordValidation.valid) {
      setErrors({ password: passwordValidation.errors[0] })
      return
    }

    // Validate names
    if (!adminForm.firstName.trim()) {
      setErrors({ firstName: "First name is required" })
      return
    }
    if (!adminForm.lastName.trim()) {
      setErrors({ lastName: "Last name is required" })
      return
    }

    try {
      const newAdmin: Admin = {
        id: `admin_${Date.now()}`,
        email: adminForm.email,
        password: adminForm.password,
        firstName: adminForm.firstName,
        lastName: adminForm.lastName,
        role: "admin",
        permissions: ["manage_users", "manage_requests", "view_analytics"],
        status: "active",
        registeredAt: new Date().toISOString(),
      }

      userStorage.addAdmin(newAdmin)
      setAdmins(userStorage.getAdmins())
      setAdminForm({ email: "", password: "", firstName: "", lastName: "" })
      setShowAddAdmin(false)
      alert("Admin account created successfully!")
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Failed to create admin account" })
    }
  }

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm("Are you sure you want to delete this admin account?")) {
      try {
        userStorage.deleteAdmin(adminId)
        setAdmins(userStorage.getAdmins())
        alert("Admin account deleted successfully!")
      } catch (error) {
        alert("Failed to delete admin account")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </div>

      {/* Export Accounts */}
      <ExportAccounts />

      {/* Admin Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Admin Account Management
            </span>
            <Button size="sm" onClick={() => setShowAddAdmin(!showAddAdmin)}>
              {showAddAdmin ? "Cancel" : "Add New Admin"}
            </Button>
          </CardTitle>
          <CardDescription>Manage admin accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Admin Form */}
          {showAddAdmin && (
            <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
              <h3 className="font-semibold">Create New Admin Account</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input
                    value={adminForm.firstName}
                    onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                    placeholder="First name"
                  />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input
                    value={adminForm.lastName}
                    onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin@example.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>
              {errors.form && (
                <div className="p-2 bg-destructive/10 border border-destructive text-destructive rounded text-sm">
                  {errors.form}
                </div>
              )}
              <Button onClick={handleAddAdmin} className="w-full">
                Create Admin Account
              </Button>
            </div>
          )}

          {/* Existing Admins List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Current Admin Accounts ({admins.length})</h3>
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admin accounts found.</p>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {admin.firstName} {admin.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Role: {admin.role} | Status: {admin.status}
                      </p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteAdmin(admin.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </CardTitle>
          <CardDescription>General system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="system-name" className="block text-sm font-medium mb-2">
              System Name
            </label>
            <Input
              id="system-name"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              placeholder="e.g., Student Portal"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Enable to restrict user access</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">{settings.maintenanceMode ? "On" : "Off"}</span>
            </label>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure when admins receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Notify on new registration</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Notify on new student request</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Notify on new message</span>
          </label>
        </CardContent>
      </Card>
    </div>
  )
}
