"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
  Loader2,
  Users,
  Settings,
  Check,
  X,
  UserCheck,
  Lock,
  Unlock,
} from "lucide-react";
import { EmployeeRole } from "@/types/employee.types";

export default function EmployeeRolesPage() {
  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<EmployeeRole | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    is_active: true,
  });

  // Available permissions
  const availablePermissions = [
    {
      id: "users.read",
      name: "View Users",
      description: "Can view user information",
    },
    {
      id: "users.write",
      name: "Manage Users",
      description: "Can create, edit, and delete users",
    },
    {
      id: "employees.read",
      name: "View Employees",
      description: "Can view employee information",
    },
    {
      id: "employees.write",
      name: "Manage Employees",
      description: "Can create, edit, and delete employees",
    },
    {
      id: "controllers.read",
      name: "View Controllers",
      description: "Can view controller information",
    },
    {
      id: "controllers.write",
      name: "Manage Controllers",
      description: "Can create, edit, and delete controllers",
    },
    {
      id: "reports.read",
      name: "View Reports",
      description: "Can view and generate reports",
    },
    {
      id: "reports.write",
      name: "Manage Reports",
      description: "Can create and manage report templates",
    },
    {
      id: "shifts.read",
      name: "View Shifts",
      description: "Can view shift information",
    },
    {
      id: "shifts.write",
      name: "Manage Shifts",
      description: "Can create, edit, and delete shifts",
    },
    {
      id: "maintenance.read",
      name: "View Maintenance",
      description: "Can view maintenance records",
    },
    {
      id: "maintenance.write",
      name: "Manage Maintenance",
      description: "Can create and manage maintenance tasks",
    },
    {
      id: "admin.full",
      name: "Full Admin Access",
      description: "Complete system administrator access",
    },
  ];

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/employee-roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRoles();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingRole
        ? `/api/employee-roles/${editingRole.id}`
        : "/api/employee-roles";
      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingRole ? { ...formData, id: editingRole.id } : formData
        ),
      });

      if (response.ok) {
        alert(
          editingRole
            ? "Role updated successfully!"
            : "Role created successfully!"
        );
        setShowForm(false);
        setEditingRole(null);
        resetForm();
        fetchRoles();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role: EmployeeRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
      is_active: role.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`/api/employee-roles/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Role deleted successfully!");
        fetchRoles();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Connection error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
      is_active: true,
    });
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && role.is_active) ||
      (statusFilter === "inactive" && !role.is_active);
    return matchesSearch && matchesStatus;
  });

  const getPermissionName = (permissionId: string) => {
    const permission = availablePermissions.find((p) => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  if (showForm) {
    return (
      <div className="p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
                Employee Roles
              </h1>
              <p className="text-gray-500">
                {editingRole ? "Edit role and permissions" : "Create new role"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingRole(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
                <Shield className="h-6 w-6 text-[#8b7ee8]" />
                {editingRole ? "Edit Role" : "New Role"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Administrator, Manager, Operator"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_active">Status</Label>
                      <select
                        id="is_active"
                        name="is_active"
                        value={formData.is_active.toString()}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_active: e.target.value === "true",
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of this role..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <Label className="text-lg font-semibold">Permissions</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={permission.id}
                            className="font-medium text-sm cursor-pointer"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRole(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] hover:from-[#7c70e6] hover:to-[#9d8df1] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingRole ? "Updating..." : "Creating..."}
                      </>
                    ) : editingRole ? (
                      "Update Role"
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
            <Shield className="h-6 w-6 text-[#8b7ee8]" />
            Employee Roles
          </h1>
          <p className="text-gray-600">
            Manage roles and permissions for your employees
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] hover:from-[#7c70e6] hover:to-[#9d8df1] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-green-600">
                  {roles.filter((r) => r.is_active).length}
                </p>
              </div>
              <Unlock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Roles</p>
                <p className="text-2xl font-bold text-red-600">
                  {roles.filter((r) => !r.is_active).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] bg-clip-text text-transparent">
              Role List
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No roles found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "No roles match your search criteria."
                  : "Click 'Add Role' to create your first employee role."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <Card
                  key={role.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#8b7ee8] to-[#a78bfa] rounded-full flex items-center justify-center">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {role.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  role.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {role.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Users className="h-3 w-3" />
                                {(role as any).employee_count || 0} employees
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {role.description && (
                          <p className="text-gray-600 mb-3">
                            {role.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Permissions:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              role.permissions.map((permission) => (
                                <Badge
                                  key={permission}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {getPermissionName(permission)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">
                                No permissions assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
