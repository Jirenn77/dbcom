"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  Home,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  X,
  Edit,
  Save,
  Leaf,
  ChevronDown,
  ChevronsLeft,
  Check,
  ChevronRight,
} from "lucide-react";

export default function SettingsPrivileges() {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
   const [editingRoleIndex, setEditingRoleIndex] = useState(null);
    const [editedRoleName, setEditedRoleName] = useState("");
    const [editedPermissions, setEditedPermissions] = useState([]);
  const [roles, setRoles] = useState([
    {
      name: "Admin",
      permissions: ["All Services"],
    },
    {
      name: "Receptionist",
      permissions: ["View and Edit Services"],
    },
  ]);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isAddingRole, setIsAddingRole] = useState(false);

  const allPermissions = [
    "Manage Services",
    "Manage Memberships",
    "Manage Customers",
    "Monitor Services",
    "Monitor Memberships",
    "Monitor Memberships",
    "Access the Service Acquire",
    "Allow user to create, edit, the Service Category",
    "Allow user to create, edit, the Memberships",
    "Allow user to see View Reports",
    "Access the Employee Management",
    "Access the User Management",
    "Access the Branch Management",
    "Access the Roles",
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const Switch = ({ id, checked, onCheckedChange, disabled = false }) => {
    return (
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={onCheckedChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          checked ? "bg-emerald-600" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setRoles([
      ...roles,
      {
        name: newRoleName,
        permissions: selectedPermissions,
      },
    ]);

    setNewRoleName("");
    setSelectedPermissions([]);
    setIsAddingRole(false);
    toast.success("Role added successfully!");
  };

  const [permissions, setPermissions] = useState({
    employeeManagement: true,
    employeeAdd: true,
    employeeEdit: true,
    employeeDelete: true,
    userManagement: true,
    userAdd: true,
    userEdit: true,
    userDelete: true,
    branchManagement: true,
    branchAdd: true,
    branchEdit: true,
    branchDelete: true,
    rolesAccess: true,
    rolesEdit: true,
    rolesAssign: true,
  });

  const togglePermission = (permission) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }));
        toast.success(`Permission ${!permissions[permission] ? 'enabled' : 'disabled'}`);
    };

    const handleEditRole = (index) => {
        setEditingRoleIndex(index);
        setEditedRoleName(roles[index].name);
        setEditedPermissions([...roles[index].permissions]);
    };

    const handleSaveEdit = () => {
        if (!editedRoleName.trim()) {
            toast.error("Role name cannot be empty");
            return;
        }
        
        if (editedPermissions.length === 0) {
            toast.error("Please select at least one permission");
            return;
        }

        const updatedRoles = [...roles];
        updatedRoles[editingRoleIndex] = {
            name: editedRoleName,
            permissions: editedPermissions
        };

        setRoles(updatedRoles);
        setEditingRoleIndex(null);
        toast.success("Role updated successfully!");
    };

    const toggleEditPermission = (permission) => {
        if (editedPermissions.includes(permission)) {
            setEditedPermissions(editedPermissions.filter(p => p !== permission));
        } else {
            setEditedPermissions([...editedPermissions, permission]);
        }
    };

    const toggleNewPermission = (permission) => {
        if (selectedPermissions.includes(permission)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
        } else {
            setSelectedPermissions([...selectedPermissions, permission]);
        }
    };

  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster />
      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        <div className="flex items-center space-x-4 relative">
          <div
            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-amber-600 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            A
          </div>
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="absolute top-12 right-0 bg-white shadow-xl rounded-lg w-48 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/profiles">
                  <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700">
                    <User size={16} /> Profile
                  </button>
                </Link>
                <Link href="/roles">
                  <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700">
                    <Settings size={16} /> Settings
                  </button>
                </Link>
                <button
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Enhanced Sidebar */}
      <div className="flex flex-1">
        <nav className="w-64 h-screen bg-gradient-to-b from-emerald-800 to-emerald-700 text-white flex flex-col items-start py-6 fixed top-0 left-0 shadow-lg z-10">
          {/* Branding with Logo */}
          <div className="flex items-center space-x-3 mb-8 px-6">
            <div className="p-2 bg-white/10 rounded-lg flex items-center justify-center">
              <Leaf className="text-emerald-300" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white font-sans tracking-tight">
              Lizly Skin Care Clinic
            </h1>
          </div>

          {/* Menu Items with Active States */}
          <div className="w-full px-4 space-y-1 overflow-y-auto flex-grow custom-scrollbar">
            <Link href="/home" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/home" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/home" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Home size={18} />
                </div>
                <span>Dashboard</span>
                {router.pathname === "/home" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/roles" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/roles" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/roles" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Shield size={18} />
                </div>
                <span>Role Settings</span>
                {router.pathname === "/roles" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/employeeM" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/employeeM" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/employeeM" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Users size={18} />
                </div>
                <span>Employee Management</span>
                {router.pathname === "/employeeM" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/userManage" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/userManage" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/userManage" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Users size={18} />
                </div>
                <span>User Management</span>
                {router.pathname === "/userManage" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/branchM" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/branchM" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/branchM" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Home size={18} />
                </div>
                <span>Branch Management</span>
                {router.pathname === "/branchM" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>
          </div>

          {/* Enhanced Sidebar Footer */}
          <motion.div
            className="mt-auto px-6 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="border-t border-emerald-600 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-emerald-300">Administrator</p>
                  </div>
                </div>
                <button
                  className="text-emerald-300 hover:text-white transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                </button>
              </div>
              <p className="text-xs text-emerald-200 mt-3">
                Lizly Skin Care Clinic v1.2.0
              </p>
              <p className="text-xs text-emerald-300 mt-1">
                © {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>
          </motion.div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 ml-64">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Settings & Privileges
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage system roles and permissions
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "roles" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "advanced" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Advanced Permissions
            </button>
          </div>

          {/* Roles Tab Content */}
          {activeTab === "roles" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Roles Management
                  </h2>
                  <button
                    onClick={() => setIsAddingRole(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                  >
                    <span>+ New Role</span>
                  </button>
                </div>

                {isAddingRole && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 border border-gray-200 rounded-lg"
                  >
                    <h3 className="font-medium text-gray-700 mb-3">
                      Add New Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role Name
                        </label>
                        <input
                          type="text"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter role name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Permissions
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {allPermissions.slice(0, 5).map((permission) => (
                            <div key={permission} className="flex items-center">
                              <button
                                type="button"
                                onClick={() => toggleNewPermission(permission)}
                                className={`w-5 h-5 rounded mr-2 flex items-center justify-center ${selectedPermissions.includes(permission) ? "bg-emerald-600 text-white" : "border border-gray-300"}`}
                              >
                                {selectedPermissions.includes(permission) && (
                                  <Check size={14} />
                                )}
                              </button>
                              <span className="text-sm">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsAddingRole(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddRole}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Save Role
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Role Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Permissions
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roles.map((role, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {editingRoleIndex === index ? (
                              <input
                                type="text"
                                value={editedRoleName}
                                onChange={(e) =>
                                  setEditedRoleName(e.target.value)
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              role.name
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {editingRoleIndex === index ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {allPermissions
                                  .slice(0, 5)
                                  .map((permission) => (
                                    <div
                                      key={permission}
                                      className="flex items-center"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleEditPermission(permission)
                                        }
                                        className={`w-5 h-5 rounded mr-2 flex items-center justify-center ${editedPermissions.includes(permission) ? "bg-emerald-600 text-white" : "border border-gray-300"}`}
                                      >
                                        {editedPermissions.includes(
                                          permission
                                        ) && <Check size={14} />}
                                      </button>
                                      <span className="text-sm">
                                        {permission}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {role.permissions.map((perm, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                  >
                                    {perm}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingRoleIndex === index ? (
                              <>
                                <button
                                  onClick={() => setEditingRoleIndex(null)}
                                  className="text-gray-600 hover:text-gray-900 mr-3"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-emerald-600 hover:text-emerald-900"
                                >
                                  Save
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEditRole(index)}
                                className="text-emerald-600 hover:text-emerald-900"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Advanced Permissions Tab Content */}
          {activeTab === "advanced" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Advanced Permissions
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Toggle permissions for different user roles. Changes will be
                  applied immediately.
                </p>

                <div className="space-y-4">
                  {/* Employee Management Permission */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Switch
                          id="employee-management"
                          checked={permissions.employeeManagement}
                          onCheckedChange={() =>
                            togglePermission("employeeManagement")
                          }
                        />
                        <label
                          htmlFor="employee-management"
                          className="font-medium text-gray-700 cursor-pointer"
                        >
                          Access the Employee Management
                        </label>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Brands access to employee services, including adding,
                        updating, and onending employee records.
                      </p>
                    </div>
                  </div>

                  {/* User Management Permission */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Switch
                          id="user-management"
                          checked={permissions.userManagement}
                          onCheckedChange={() =>
                            togglePermission("userManagement")
                          }
                        />
                        <label
                          htmlFor="user-management"
                          className="font-medium text-gray-700 cursor-pointer"
                        >
                          Access the User Management
                        </label>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Establish user configuration, including adding, editing,
                        and deleting users.
                      </p>
                    </div>
                  </div>

                  {/* Branch Management Permission */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Switch
                          id="branch-management"
                          checked={permissions.branchManagement}
                          onCheckedChange={() =>
                            togglePermission("branchManagement")
                          }
                        />
                        <label
                          htmlFor="branch-management"
                          className="font-medium text-gray-700 cursor-pointer"
                        >
                          Access the Branch Management
                        </label>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Establish branch configuration, including adding,
                        editing, and deleting associates.
                      </p>
                    </div>
                  </div>

                  {/* Roles Permission */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Switch
                          id="roles-access"
                          checked={permissions.rolesAccess}
                          onCheckedChange={() =>
                            togglePermission("rolesAccess")
                          }
                        />
                        <label
                          htmlFor="roles-access"
                          className="font-medium text-gray-700 cursor-pointer"
                        >
                          Access the Roles
                        </label>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Manage and configure system roles and permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
