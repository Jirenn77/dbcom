"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { BarChart, BarChart3 } from "lucide-react";
import { User } from "lucide-react";
import {
  Folder,
  ClipboardList,
  Factory,
  ShoppingBag,
  UserPlus,
  Tag,
  Leaf,
} from "lucide-react";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Edit,
  MoreHorizontal,
  Eye,
  Edit2,
  X,
  Moon,
  Sun,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  BarChart2,
  ChevronDown,
} from "lucide-react";

export default function ServiceGroupsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [serviceGroups, setServiceGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [linkedServices, setLinkedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    services: [], // You can populate from actual data
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  });
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "all", // 'all', 'active', 'inactive'
    sortBy: "name", // 'name', 'servicesCount', 'dateCreated'
    sortOrder: "asc", // 'asc', 'desc'
  });
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // For service groups
  const [servicesPerPage, setServicesPerPage] = useState(5); // For services list
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost/API/servicegroup.php?action=get_groups_with_services"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch service groups");
        }
        const data = await response.json();

        // ✅ Ensure the response is always an array
        if (Array.isArray(data)) {
          const updatedData = data.map((group) => ({
            ...group,
            servicesCount: group.services?.length || 0,
            averagePrice: group.services?.length
              ? (
                  group.services.reduce(
                    (acc, s) => acc + parseFloat(s.price || 0),
                    0
                  ) / group.services.length
                ).toFixed(2)
              : "0.00",
          }));
          console.log("Fetched service groups:", data);
          setServiceGroups(updatedData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setServiceGroups([]); // fallback in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchServiceGroups();
  }, []);

  const handleAddGroup = () => {
    const groupToAdd = {
      id: Math.max(...serviceGroups.map((g) => g.id)) + 1,
      name: newGroup.name,
      description: newGroup.description,
      servicesCount: 0,
      averagePrice: "0",
      services: [],
    };

    setServiceGroups([...serviceGroups, groupToAdd]);
    setNewGroup({ name: "", description: "" });
    setIsAddGroupModalOpen(false);
  };

  // THIS IS FOR EDIT2
  const handleSaveEditedService = async () => {
    try {
      const response = await axios.post(
        "http://localhost/API/servicegroup.php?action=update_service",
        {
          id: serviceToEdit.id,
          name: serviceToEdit.name,
          price: serviceToEdit.price,
          duration: serviceToEdit.duration,
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedServices = selectedGroup.services.map((s) =>
          s.id === serviceToEdit.id ? serviceToEdit : s
        );
        setSelectedGroup({ ...selectedGroup, services: updatedServices });

        setIsEditModalOpen(false);
      } else {
        console.error(
          "API update failed:",
          response.data.message || "Unknown error"
        );
        alert("Failed to update service.");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("An error occurred while updating the service.");
    }
  };

  const filteredServiceGroups = serviceGroups
    .filter((group) => {
      // Search by name or description
      const matchesSearch =
        group.group_name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        (group.description &&
          group.description
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()));

      // Filter by status if not 'all'
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && group.status === "Active") ||
        (filters.status === "inactive" && group.status === "Inactive");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sorting logic
      if (filters.sortBy === "name") {
        return filters.sortOrder === "asc"
          ? a.group_name.localeCompare(b.group_name)
          : b.group_name.localeCompare(a.group_name);
      } else if (filters.sortBy === "servicesCount") {
        return filters.sortOrder === "asc"
          ? a.servicesCount - b.servicesCount
          : b.servicesCount - a.servicesCount;
      } else if (filters.sortBy === "dateCreated") {
        return filters.sortOrder === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  // Paginated data
  const paginatedServiceGroups = filteredServiceGroups.slice(
    (currentGroupPage - 1) * itemsPerPage,
    currentGroupPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentGroupPage(1);
  }, [filters.searchQuery, filters.status, filters.sortBy, filters.sortOrder]);

  const handleEditServices = () => {
    setEditMode(true);
    setFormData(selectedService);
  };

  const handleEditServiceGroupClick = (group) => {
    setGroupToEdit(group);
    setFormData({
      name: group.name || "",
      description: group.description || "",
      status: group.status || "Active",
    });
    setLinkedServices(group.services || []);
    setEditMode(true); // open the modal
  };

  const handleEditService = (service) => {
    setServiceToEdit(service); // set the selected service in state
    setIsEditModalOpen(true); // open the edit modal
  };

  const handleSaveGroup = () => {
    const updatedGroups = serviceGroups.map((group) =>
      group.id === formData.id ? formData : group
    );
    setServiceGroups(updatedGroups);
    setSelectedGroup(formData);
    setEditMode(false);
  };

  const handleAddService = async () => {
    if (!selectedGroup || !newService.name || !newService.price) return;

    const serviceToAdd = {
      name: newService.name,
      price: parseFloat(newService.price),
      description: newService.description || null,
      duration: parseInt(newService.duration) || null,
      category: selectedGroup.group_name,
    };

    try {
      console.log("Sending:", {
        service: serviceToAdd,
        group_id: selectedGroup.id || selectedGroup.group_id,
      });

      const response = await fetch(
        "http://localhost/API/servicegroup.php?action=add_service",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: serviceToAdd,
            group_id: selectedGroup.id || selectedGroup.group_id,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const updatedGroups = serviceGroups.map((group) =>
          (group.id || group.group_id) ===
          (selectedGroup.id || selectedGroup.group_id)
            ? {
                ...group,
                services: [
                  ...group.services,
                  { ...serviceToAdd, id: result.service_id },
                ],
                servicesCount: group.services.length + 1,
              }
            : group
        );
        setServiceGroups(updatedGroups);
        setIsAddModalOpen(false); // Close modal
      } else {
        console.error("Error adding service:", result.message);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(savedMode === "true");
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }
  }, []);

  // // Apply dark mode class to document
  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //     localStorage.setItem("darkMode", "true");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     localStorage.setItem("darkMode", "false");
  //   }
  // }, [darkMode]);

  // useEffect(() => {
  //   const savedMode = localStorage.getItem("darkMode");
  //   if (savedMode) {
  //     setDarkMode(savedMode === "true");
  //   } else if (
  //     window.matchMedia &&
  //     window.matchMedia("(prefers-color-scheme: dark)").matches
  //   ) {
  //     setDarkMode(true);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //     localStorage.setItem("darkMode", "true");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     localStorage.setItem("darkMode", "false");
  //   }
  // }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  <div className="flex flex-col h-screen bg-gradient-to-b from-[#77DD77] to-[#56A156] text-gray-900"></div>;
  return (
    <div
      className={`flex flex-col h-screen ${darkMode ? "dark bg-[#0a1a14] text-gray-100" : "bg-gray-50 text-gray-800"}`}
    >
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        <div className="flex items-center space-x-4 flex-wrap gap-4 mb-1">
          {/* Search Input - Matching your current design */}
          <div className="relative flex-grow min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search groups..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="pl-10 pr-4 py-2 rounded-lg bg-white/90 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sort By - Styled to match */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="appearance-none pl-3 pr-1 py-1 rounded-l-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              >
                <option value="name">Name</option>
                <option value="servicesCount">Services Count</option>
                <option value="dateCreated">Date Created</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
            <button
              onClick={() =>
                setFilters({
                  ...filters,
                  sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                })
              }
              className="px-3 py-2 rounded-r-lg bg-white/90 text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {filters.sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4 text-gray-700" />
              ) : (
                <ArrowDown className="h-4 w-4 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 relative">
          <div
            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-amber-600 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            R
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
                <Link href="/edit-profile">
                  <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700">
                    <User size={16} /> Profile
                  </button>
                </Link>
                <Link href="/settings">
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
    {/* Logo/Branding with subtle animation */}
    <motion.div 
      className="flex items-center space-x-2 mb-8 px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-2 bg-white/10 rounded-lg">
        <Leaf size={24} className="text-emerald-300" />
      </div>
      <h1 className="text-xl font-bold text-white font-sans tracking-tight">
        Lizly Skin Care Clinic
      </h1>
    </motion.div>

    {/* Search for Mobile (hidden on desktop) */}
    <div className="px-4 mb-4 w-full lg:hidden">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300" size={18} />
        <input
          type="text"
          placeholder="Search menu..."
          className="pl-10 pr-4 py-2 rounded-lg bg-emerald-900/50 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-emerald-300"
        />
      </div>
    </div>

    {/* Menu Items with Active State Highlight */}
    <div className="w-full px-4 space-y-1 overflow-y-auto flex-grow custom-scrollbar">
      {/* Dashboard */}
      <Menu as="div" className="relative w-full">
        <Link href="/home2" passHref>
          <Menu.Button
            as="div"
            className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === '/home' ? 'bg-emerald-600 shadow-md' : 'hover:bg-emerald-600/70'}`}
          >
            <div className={`p-1.5 mr-3 rounded-lg ${router.pathname === '/home' ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
              <Home size={18} />
            </div>
            <span>Dashboard</span>
            {router.pathname === '/home2' && (
              <motion.div 
                className="ml-auto w-2 h-2 bg-white rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </Menu.Button>
        </Link>
      </Menu>

      {/* Services Dropdown - Enhanced */}
      <Menu as="div" className="relative w-full">
        {({ open }) => (
          <>
            <Menu.Button 
              className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? 'bg-emerald-600' : 'hover:bg-emerald-600/70'}`}
            >
              <div className="flex items-center">
                <div className={`p-1.5 mr-3 rounded-lg ${open ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
                  <Layers size={18} />
                </div>
                <span>Services</span>
              </div>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-emerald-300"
              >
                <ChevronDown size={18} />
              </motion.div>
            </Menu.Button>

            <AnimatePresence>
              {open && (
                <Menu.Items
                  as={motion.div}
                  static
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 ml-3 w-full bg-emerald-700/90 text-white rounded-lg shadow-lg overflow-hidden"
                >
                  {[
                    { href: "/servicess2", label: "All Services", icon: <Layers size={16} /> },
                    { href: "/membership2", label: "Memberships", icon: <UserPlus size={16} />, badge: 3 },
                    { href: "/items2", label: "Beauty Deals", icon: <Tag size={16} />, badge: 'New' },
                    { href: "/serviceorder2", label: "Service Acquire", icon: <ClipboardList size={16} /> },
                  ].map((link, index) => (
                    <Menu.Item key={link.href}>
                      {({ active }) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            className={`flex items-center justify-between space-x-3 p-3 ${active ? 'bg-emerald-600' : ''} ${router.pathname === link.href ? 'bg-emerald-600 font-medium' : ''}`}
                          >
                            <div className="flex items-center">
                              <span className={`mr-3 ${router.pathname === link.href ? 'text-white' : 'text-emerald-300'}`}>
                                {link.icon}
                              </span>
                              <span>{link.label}</span>
                            </div>
                            {link.badge && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${typeof link.badge === 'number' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        </motion.div>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              )}
            </AnimatePresence>
          </>
        )}
      </Menu>

      {/* Sales Dropdown - Enhanced */}
      <Menu as="div" className="relative w-full">
        {({ open }) => (
          <>
            <Menu.Button 
              className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? 'bg-emerald-600' : 'hover:bg-emerald-600/70'}`}
            >
              <div className="flex items-center">
                <div className={`p-1.5 mr-3 rounded-lg ${open ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
                  <BarChart2 size={18} />
                </div>
                <span>Sales</span>
              </div>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-emerald-300"
              >
                <ChevronDown size={18} />
              </motion.div>
            </Menu.Button>

            <AnimatePresence>
              {open && (
                <Menu.Items
                  as={motion.div}
                  static
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 ml-3 w-full bg-emerald-700/90 text-white rounded-lg shadow-lg overflow-hidden"
                >
                  {[
                    { href: "/customers2", label: "Customers", icon: <Users size={16} />, count: 3 },
                    { href: "/invoices2", label: "Invoices", icon: <FileText size={16} />, count: 17 },
                  ].map((link, index) => (
                    <Menu.Item key={link.href}>
                      {({ active }) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            className={`flex items-center justify-between space-x-3 p-3 ${active ? 'bg-emerald-600' : ''} ${router.pathname === link.href ? 'bg-emerald-600 font-medium' : ''}`}
                          >
                            <div className="flex items-center">
                              <span className={`mr-3 ${router.pathname === link.href ? 'text-white' : 'text-emerald-300'}`}>
                                {link.icon}
                              </span>
                              <span>{link.label}</span>
                            </div>
                            {link.count && (
                              <span className="text-xs text-emerald-200">
                                {link.count}
                              </span>
                            )}
                          </Link>
                        </motion.div>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              )}
            </AnimatePresence>
          </>
        )}
      </Menu>
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
              <p className="text-sm font-medium">Reception User</p>
              <p className="text-xs text-emerald-300">Receptionist</p>
            </div>
          </div>
          <button className="text-emerald-300 hover:text-white transition-colors">
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
        <main
          className={`flex-1 p-8 max-w-screen-xl mx-auto ml-64 ${darkMode ? "bg-[#0a1a14]" : "bg-gray-50"} min-h-screen pt-26`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center mb-4"
          >
            <h1 className="text-xl font-bold">All Service Groups</h1>
          </motion.div>

          <div className="flex">
            {/* Service Groups List - Full width table */}
            <motion.div
              className={`${selectedGroup ? "w-[calc(100%-350px)]" : "w-full"} transition-all duration-300 pr-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-lg border border-gray-400 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Group
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services Count
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServiceGroups.map((group, index) => (
                      <motion.tr
                        key={group.group_id || `group-${index}`}
                        className={`hover:bg-gray-50 cursor-pointer ${selectedGroup?.group_id === group.group_id ? "bg-[#E3F9E5]" : ""}`}
                        onClick={() => setSelectedGroup(group)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.005 }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {group.group_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-500">
                          {group.description || "No description"}
                        </td>

                        <td className="px-4 py-3">
                          <motion.span
                            className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                            whileHover={{ scale: 1.1 }}
                          >
                            {group.servicesCount} Services
                          </motion.span>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="flex space-x-2">                 
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGroup(group);
                              }}
                              className="text-gray-600 hover:text-gray-800"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination for Service Groups */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentGroupPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentGroupPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentGroupPage((prev) => prev + 1)}
                      disabled={filteredServiceGroups.length < itemsPerPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentGroupPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentGroupPage * itemsPerPage,
                            filteredServiceGroups.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredServiceGroups.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentGroupPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentGroupPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({
                          length: Math.ceil(
                            filteredServiceGroups.length / itemsPerPage
                          ),
                        }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentGroupPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentGroupPage === index + 1
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setCurrentGroupPage((prev) => prev + 1)
                          }
                          disabled={
                            currentGroupPage * itemsPerPage >=
                            filteredServiceGroups.length
                          }
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Service Group Detail Panel with Services List */}
            <AnimatePresence>
              {selectedGroup && (
                <motion.div
                  className="hidden lg:block w-[350px]"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-md border border-gray-400 p-4 h-[calc(100vh-120px)] sticky top-20 overflow-y-auto"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {/* Panel Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">
                        {selectedGroup.group_name}
                      </h2>
                      <motion.button
                        onClick={() => setSelectedGroup(null)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={20} />
                      </motion.button>
                    </div>

                    {/* Group Info */}
                    <motion.div
                      className="space-y-4 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">
                          Description
                        </h3>
                        <p className="text-sm">
                          {selectedGroup.description ||
                            "No description available"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <motion.div
                          className="bg-gray-100 p-2 rounded text-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-gray-500">
                            Total Services
                          </div>
                          <div className="font-bold">
                            {selectedGroup.servicesCount}
                          </div>
                        </motion.div>
                        <motion.div
                          className="bg-gray-100 p-2 rounded text-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-gray-500">
                            Average Price
                          </div>
                          <div className="font-bold">
                            ₱{selectedGroup.averagePrice}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Services List */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-500">
                          Services
                        </h3>
                        <motion.button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-xs text-green-600 hover:text-green-800"
                          whileHover={{ scale: 1.1 }}
                        >
                          + Add Service
                        </motion.button>
                      </div>

                      <motion.div
                        className="border rounded-lg overflow-auto max-h-[400px]"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-1/3 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="w-1/4 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="w-1/4 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                              </th>
                              <th className="w-1/12 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedGroup.services.length > 0 ? (
                              selectedGroup.services
                                .slice(
                                  (currentServicePage - 1) * servicesPerPage,
                                  currentServicePage * servicesPerPage
                                )
                                .map((service, index) => (
                                  <motion.tr
                                    key={service.id || `service-${index}`}
                                    className="hover:bg-gray-50"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <td className="px-3 py-2 text-sm text-gray-900 break-words">
                                      {service.name}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500">
                                      ₱{service.price}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500">
                                      {service.duration} mins
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500 text-right">
                                      <motion.button
                                        className="text-blue-600 hover:text-blue-800"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          handleEditService(service)
                                        }
                                      >
                                        <Edit2 size={16} />
                                      </motion.button>
                                    </td>
                                  </motion.tr>
                                ))
                            ) : (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <td
                                  colSpan="4"
                                  className="text-center text-gray-500 py-4 italic"
                                >
                                  No services available
                                </td>
                              </motion.tr>
                            )}
                          </tbody>
                        </table>

                        {/* Pagination for Services */}
                        {selectedGroup.services.length > servicesPerPage && (
                          <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200">
                            <div className="flex-1 flex justify-between">
                              <button
                                onClick={() =>
                                  setCurrentServicePage((prev) =>
                                    Math.max(prev - 1, 1)
                                  )
                                }
                                disabled={currentServicePage === 1}
                                className="relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() =>
                                  setCurrentServicePage((prev) => prev + 1)
                                }
                                disabled={
                                  currentServicePage * servicesPerPage >=
                                  selectedGroup.services.length
                                }
                                className="ml-2 relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Edit Group Modal - 2 Column Layout */}
                    <AnimatePresence>
                      {editMode && (
                        <motion.div
                          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="bg-white rounded-lg shadow-xl w-full max-w-4xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                          >
                            <div className="p-6">
                              {/* Modal Header */}
                              <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                  Edit Services Group
                                </h2>
                                <motion.button
                                  onClick={() => setEditMode(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </motion.button>
                              </div>

                              {/* 2-Column Grid Layout */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Form Fields */}
                                <motion.div
                                  className="space-y-4"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  {/* Group Name */}
                                  <div>
                                    <label className="block text-sm font-medium text-red-600 mb-1">
                                      Group Name
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <motion.input
                                      type="text"
                                      value={formData.name}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          name: e.target.value,
                                        })
                                      }
                                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Enter group name"
                                      autoFocus
                                      whileFocus={{ scale: 1.01 }}
                                    />
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Description
                                    </label>
                                    <motion.textarea
                                      value={formData.description}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          description: e.target.value,
                                        })
                                      }
                                      rows={5}
                                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Enter description (optional)"
                                      whileFocus={{ scale: 1.01 }}
                                    />
                                  </div>

                                  {/* Status Dropdown */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Status
                                    </label>
                                    <motion.select
                                      value={formData.status}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          status: e.target.value,
                                        })
                                      }
                                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                      whileFocus={{ scale: 1.01 }}
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                    </motion.select>
                                  </div>
                                </motion.div>

                                {/* Right Column - Services List */}
                                <motion.div
                                  className="space-y-4"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="block text-sm font-medium text-gray-700">
                                        Linked Services
                                      </label>
                                      <motion.button
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm border rounded text-gray-700 transition-colors"
                                        // Instead of a separate handleEditServices, just open your add service modal
                                        onClick={() => {
                                          setSelectedGroup(formData); // Pass current editing group
                                          setIsAddModalOpen(true);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        Add Service
                                      </motion.button>
                                    </div>

                                    <motion.div
                                      className="border border-gray-300 rounded flex-grow overflow-y-auto p-3 bg-gray-50"
                                      whileHover={{ scale: 1.01 }}
                                    >
                                      {linkedServices.length > 0 ? (
                                        <ul className="space-y-2">
                                          {linkedServices.map(
                                            (service, index) => (
                                              <motion.li
                                                key={index}
                                                className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                  delay: index * 0.05,
                                                }}
                                              >
                                                <span className="flex-grow text-sm">
                                                  {service.name}
                                                </span>
                                                <motion.button
                                                  onClick={() =>
                                                    handleRemoveService(index)
                                                  }
                                                  className="text-red-500 hover:text-red-700"
                                                  whileHover={{ scale: 1.2 }}
                                                  whileTap={{ scale: 0.9 }}
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                  </svg>
                                                </motion.button>
                                              </motion.li>
                                            )
                                          )}
                                        </ul>
                                      ) : (
                                        <div className="h-full flex items-center justify-center">
                                          <p className="text-gray-500 italic">
                                            No services linked to this group
                                          </p>
                                        </div>
                                      )}
                                    </motion.div>
                                  </div>
                                </motion.div>
                              </div>

                              {/* Modal Footer */}
                              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                                <motion.button
                                  onClick={() => setEditMode(false)}
                                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  onClick={handleSaveGroup}
                                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Save Changes
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add Service Modal */}
          <AnimatePresence>
            {isAddModalOpen && selectedGroup && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white p-6 rounded-lg w-96"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <h2 className="text-xl font-bold mb-4">Add New Service</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Service Name
                      </label>
                      <motion.input
                        type="text"
                        value={newService.name}
                        onChange={(e) =>
                          setNewService({ ...newService, name: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Price
                        </label>
                        <motion.input
                          type="number"
                          value={newService.price}
                          onChange={(e) =>
                            setNewService({
                              ...newService,
                              price: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Duration (mins)
                        </label>
                        <motion.input
                          type="number"
                          value={newService.duration}
                          onChange={(e) =>
                            setNewService({
                              ...newService,
                              duration: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <motion.button
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleAddService}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add Service
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isEditModalOpen && serviceToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Edit Service</h2>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={serviceToEdit.name}
                    onChange={(e) =>
                      setServiceToEdit({
                        ...serviceToEdit,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={serviceToEdit.price}
                    onChange={(e) =>
                      setServiceToEdit({
                        ...serviceToEdit,
                        price: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={serviceToEdit.duration}
                    onChange={(e) =>
                      setServiceToEdit({
                        ...serviceToEdit,
                        duration: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedService}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Group Modal - Matched to Edit Modal */}
          <AnimatePresence>
            {isAddGroupModalOpen && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">
                        Create Services Group
                      </h2>
                      <motion.button
                        onClick={() => setIsAddGroupModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Modal Content */}
                    <div className="space-y-5">
                      {/* Group Name */}
                      <div>
                        <label className="block text-sm font-medium text-red-600 mb-1">
                          Group Name<span className="text-red-500">*</span>
                        </label>
                        <motion.input
                          type="text"
                          value={newGroup.name}
                          onChange={(e) =>
                            setNewGroup({ ...newGroup, name: e.target.value })
                          }
                          className="w-full border border-gray-400 rounded px-3 py-2 text-sm"
                          placeholder="e.g., Hair Services"
                          autoFocus
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <motion.textarea
                          value={newGroup.description}
                          onChange={(e) =>
                            setNewGroup({
                              ...newGroup,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full border border-gray-400 rounded px-3 py-2 text-sm"
                          placeholder="Brief description of this service group"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>

                      {/* Status Dropdown (Hidden by default, shown if needed) */}
                      {newGroup.hasOwnProperty("status") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <motion.select
                            value={newGroup.status || "Active"}
                            onChange={(e) =>
                              setNewGroup({
                                ...newGroup,
                                status: e.target.value,
                              })
                            }
                            className="w-full border border-gray-400 rounded px-3 py-2 text-sm"
                            whileFocus={{ scale: 1.01 }}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </motion.select>
                        </div>
                      )}

                      {/* Services Section (Hidden for add modal by default) */}
                      {newGroup.hasOwnProperty("services") && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Services Link to Groups
                            </label>
                            <motion.button
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm border rounded"
                              onClick={handleEditServices}
                              whileHover={{ scale: 1.05 }}
                            >
                              Edit Services
                            </motion.button>
                          </div>
                          <motion.div
                            className="border border-gray-400 rounded h-40 overflow-y-auto p-2 text-sm bg-white"
                            whileHover={{ scale: 1.01 }}
                          >
                            <p className="text-gray-500 italic">
                              No services linked yet
                            </p>
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer - Matched to Edit Modal */}
                    <div className="flex space-x-2 pt-4 border-t mt-6">
                      <motion.button
                        onClick={handleAddGroup}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Create Group
                      </motion.button>
                      <motion.button
                        onClick={() => setIsAddGroupModalOpen(false)}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
