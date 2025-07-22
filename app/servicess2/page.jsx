"use client";

import React from 'react';
import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { BarChart, BarChart3 } from "lucide-react";
import { User } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag, UserPlus, Tag } from "lucide-react";
import {
  Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart,
  Settings, LogOut, Plus, Edit, MoreHorizontal, Eye, Edit2, X
} from "lucide-react";


export default function ServiceGroupsPage() {
  const [serviceGroups, setServiceGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [linkedServices, setLinkedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    services: [], // You can populate from actual data
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "" });
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/API/servicegroup.php?action=get_groups_with_services');
        if (!response.ok) {
          throw new Error('Failed to fetch service groups');
        }
        const data = await response.json();

        // ✅ Ensure the response is always an array
        if (Array.isArray(data)) {
          const updatedData = data.map(group => ({
            ...group,
            servicesCount: group.services?.length || 0,
            averagePrice: group.services?.length
              ? (group.services.reduce((acc, s) => acc + parseFloat(s.price || 0), 0) / group.services.length).toFixed(2)
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
      id: Math.max(...serviceGroups.map(g => g.id)) + 1,
      name: newGroup.name,
      description: newGroup.description,
      servicesCount: 0,
      averagePrice: "0",
      services: []
    };

    setServiceGroups([...serviceGroups, groupToAdd]);
    setNewGroup({ name: "", description: "" });
    setIsAddGroupModalOpen(false);
  };


  const filteredServiceGroups = serviceGroups.filter((group) =>
    group.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleEdit = () => {
    setEditMode(true);
    setFormData(selectedService);
  };

  const handleSaveEditedService = async () => {
    try {
      const response = await axios.post("http://localhost/API/servicegroup.php?action=update_service", {
        id: serviceToEdit.id,
        name: serviceToEdit.name,
        price: serviceToEdit.price,
        duration: serviceToEdit.duration,
      });

      if (response.data.success) {
        // Update local state
        const updatedServices = selectedGroup.services.map((s) =>
          s.id === serviceToEdit.id ? serviceToEdit : s
        );
        setSelectedGroup({ ...selectedGroup, services: updatedServices });

        setIsEditModalOpen(false);
      } else {
        console.error("API update failed:", response.data.message || "Unknown error");
        alert("Failed to update service.");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("An error occurred while updating the service.");
    }
  };

  const handleEditServices = () => {
    setEditMode(true);
    setFormData(selectedService);
  };

  const handleEditService = (service) => {
    setServiceToEdit(service); // set the selected service in state
    setIsEditModalOpen(true);  // open the edit modal
  };

  const handleSaveGroup = () => {
    const updatedGroups = serviceGroups.map(group =>
      group.id === formData.id ? formData : group
    );
    setServiceGroups(updatedGroups);
    setSelectedGroup(formData);
    setEditMode(false);
  };

  const handleAddService = () => {
    if (!selectedGroup) return;

    const serviceToAdd = {
      id: Math.max(...selectedGroup.services.map(s => s.id)) + 1,
      ...newService
    };

    const updatedGroups = serviceGroups.map(group =>
      group.id === selectedGroup.id
        ? {
          ...group,
          services: [...group.services, serviceToAdd],
          servicesCount: group.services.length + 1
        }
        : group
    );

    setServiceGroups(updatedGroups);
    setSelectedGroup(updatedGroups.find(g => g.id === selectedGroup.id));
    setNewService({ name: "", price: "", duration: "" });
    setIsAddModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleCloneItem = () => {
    toast.success("Item cloned!");
    setIsMoreModalOpen(false);
    // Add your clone logic here
  };

  const handleMarkAsInactive = () => {
    toast.success("Item marked as inactive!");
    setIsMoreModalOpen(false);
    // Add your mark as inactive logic here
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItem.name}?`)) {
      toast.success("Item deleted!");
      setSelectedItem(null);
      setIsMoreModalOpen(false);
      // Add your delete logic here
    }
  };

  const handleAddToGroup = () => {
    toast.success("Item added to group!");
    setIsMoreModalOpen(false);
    // Add your add to group logic here
  };

  <div className="flex flex-col h-screen bg-gradient-to-b from-[#77DD77] to-[#56A156] text-gray-900"></div>
  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster />

      {/* Header */}
      <header className="flex items-center justify-between bg-[#89C07E] text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Home icon removed from here */}
        </div>

        <div className="flex items-center space-x-4 flex-grow justify-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
          />
        </div>


        <div className="flex items-center space-x-4 relative">
          <div
            className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            R
          </div>
          {isProfileOpen && (
            <div className="bg-green-500 absolute top-12 right-0 text-white shadow-lg rounded-lg w-48 p-2 flex flex-col animate-fade-in text-start">
              <Link href="/acc-settings">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-600 rounded w-full justify-start">
                  <User size={16} /> Edit Profile
                </button>
              </Link>
              <Link href="/settings">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-600 rounded w-full justify-start">
                  <Settings size={16} /> Settings
                </button>
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded justify-start" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex flex-1">
        <nav className="w-64 h-screen bg-gradient-to-b from-[#467750] to-[#56A156] text-gray-900 flex flex-col items-center py-6 fixed top-0 left-0">
          <div className="flex items-center space-x-2 mb-4">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Lizly Skin Care Clinic</span>
            </h1>
          </div>

          {/* Home Menu Button */}
          <Menu as="div" className="relative w-full px-4 mt-4">
            <Link href="/home" passHref>
              <Menu.Button as="div" className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center cursor-pointer">
                <Home className="text-2xl"></Home>
                <span className="ml-2">Dashboard</span>
              </Menu.Button>
            </Link>
          </Menu>

          <Menu as="div" className="relative w-full px-4 mt-4">
            <Menu.Button className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center">
              <Layers className="mr-2" size={20} /> Services ▾
            </Menu.Button>
            <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
              {[
                { href: "/servicess2", label: "All Services", icon: <Layers size={20} /> },
                { href: "/membership2", label: "Memberships", icon: <UserPlus size={20} /> },
                { href: "/items2", label: "Beauty Deals", icon: <Tag size={20} /> },
                { href: "/serviceorder2", label: "Service Acquire", icon: <ClipboardList size={20} /> },
              ].map((link) => (
                <Menu.Item key={link.href}>
                  {({ active }) => (
                    <Link href={link.href} className={`flex items-center space-x-4 p-3 rounded-lg ${active ? 'bg-[#2A3F3F] text-white' : ''}`}>
                      {link.icon}
                      <span className="font-normal md:font-bold">{link.label}</span>
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>

          <Menu as="div" className="relative w-full px-4 mt-4">
            <Menu.Button className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center">
              <BarChart className="mr-2" size={20} /> Sales ▾
            </Menu.Button>
            <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
              {[
                { href: "/customers2", label: "Customers", icon: <Users size={20} /> },
                { href: "/invoices2", label: "Invoices", icon: <FileText size={20} /> },
              ].map((link) => (
                <Menu.Item key={link.href}>
                  {({ active }) => (
                    <Link href={link.href} className={`flex items-center space-x-4 p-3 rounded-lg ${active ? 'bg-[#2A3F3F] text-white' : ''}`}>
                      {link.icon}
                      <span className="font-normal md:font-bold">{link.label}</span>
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Group</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services Count</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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

                        <td className="px-5 py-3 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGroup(group);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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
                      <h2 className="text-xl font-bold">{selectedGroup.group_name}</h2>
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
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
                        <p className="text-sm">{selectedGroup.description || "No description available"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <motion.div
                          className="bg-gray-100 p-2 rounded text-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-gray-500">Total Services</div>
                          <div className="font-bold">{selectedGroup.servicesCount}</div>
                        </motion.div>
                        <motion.div
                          className="bg-gray-100 p-2 rounded text-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-gray-500">Average Price</div>
                          <div className="font-bold">₱{selectedGroup.averagePrice}</div>
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
                        <h3 className="text-sm font-semibold text-gray-500">Services</h3>
                        <motion.button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-xs text-green-600 hover:text-green-800"
                          whileHover={{ scale: 1.1 }}
                        >
                          + Add Service
                        </motion.button>
                      </div>

                      <motion.div
                        className="border rounded-lg overflow-auto max-h-[400px]" // allow scroll if too tall
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-1/3 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="w-1/4 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th className="w-1/4 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedGroup.services.length > 0 ? (
                              selectedGroup.services.map((service, index) => (
                                <motion.tr
                                  key={service.id || `service-${index}`}
                                  className="hover:bg-gray-50"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <td className="px-3 py-2 text-sm text-gray-900 break-words">{service.name}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">₱{service.price}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{service.duration} mins</td>
                                </motion.tr>
                              ))
                            ) : (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <td colSpan="4" className="text-center text-gray-500 py-4 italic">
                                  No services available
                                </td>
                              </motion.tr>
                            )}
                          </tbody>
                        </table>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </main>
      </div>
    </div>
  );
}