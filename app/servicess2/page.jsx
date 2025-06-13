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

  const handleSearch = () => {
    toast(`Searching for: ${searchQuery}`);
    console.log("Search query:", searchQuery);
  };

  const handleEdit = () => {
    setEditMode(true);
    setFormData(selectedService);
  };

  const handleEditServices = () => {
    setEditMode(true);
    setFormData(selectedService);
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
          <button className="text-2xl" onClick={() => setIsModalOpen(true)}>
            ➕
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-md"
          >
            Search
          </button>
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
            <Link href="/home2" passHref>
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
                { href: "/membership-report2", label: "Membership Report", icon: <BarChart3 size={20} /> },
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
            {/* <motion.button
              onClick={() => setIsAddGroupModalOpen(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>New Group List</span>
            </motion.button> */}
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
                    {serviceGroups.map((group, index) => (
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
                            {/* <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditMode(true);
                                setFormData(group);
                              }}
                              className="text-gray-600 hover:text-gray-800"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit size={16} />
                            </motion.button> */}
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
                        {/* <motion.button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-xs text-green-600 hover:text-green-800"
                          whileHover={{ scale: 1.1 }}
                        >
                          + Add Service
                        </motion.button> */}
                      </div>

                      <motion.div
                        className="border rounded-lg overflow-hidden"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
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
                                  <td className="px-3 py-2 text-sm text-gray-900">{service.name}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">₱{service.price}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{service.duration} mins</td>
                                  <td className="px-3 py-2 text-sm text-gray-500 text-right">
                                  </td>
                                </motion.tr>
                              ))
                            ) : (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <td colSpan="4" className="text-center text-gray-500 py-4 italic">No services available</td>
                              </motion.tr>
                            )}
                          </tbody>
                        </table>
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
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          >
                            <div className="p-6">
                              {/* Modal Header */}
                              <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Edit Services Group</h2>
                                <motion.button
                                  onClick={() => setEditMode(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                                      Group Name<span className="text-red-500">*</span>
                                    </label>
                                    <motion.input
                                      type="text"
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                                        onClick={handleEditServices}
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        Edit Services
                                      </motion.button>
                                    </div>

                                    <motion.div
                                      className="border border-gray-300 rounded flex-grow overflow-y-auto p-3 bg-gray-50"
                                      whileHover={{ scale: 1.01 }}
                                    >
                                      {linkedServices.length > 0 ? (
                                        <ul className="space-y-2">
                                          {linkedServices.map((service, index) => (
                                            <motion.li
                                              key={index}
                                              className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors"
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: index * 0.05 }}
                                            >
                                              <span className="flex-grow text-sm">{service}</span>
                                              <motion.button
                                                onClick={() => handleRemoveService(index)}
                                                className="text-red-500 hover:text-red-700"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                              </motion.button>
                                            </motion.li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <div className="h-full flex items-center justify-center">
                                          <p className="text-gray-500 italic">No services linked to this group</p>
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
                      <label className="block text-sm font-medium mb-1">Service Name</label>
                      <motion.input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <motion.input
                          type="text"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                          className="w-full p-2 border rounded"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Duration (mins)</label>
                        <motion.input
                          type="text"
                          value={newService.duration}
                          onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
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
                      <h2 className="text-xl font-semibold">Create Services Group</h2>
                      <motion.button
                        onClick={() => setIsAddGroupModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
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
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          rows={3}
                          className="w-full border border-gray-400 rounded px-3 py-2 text-sm"
                          placeholder="Brief description of this service group"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>

                      {/* Status Dropdown (Hidden by default, shown if needed) */}
                      {newGroup.hasOwnProperty('status') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <motion.select
                            value={newGroup.status || 'Active'}
                            onChange={(e) => setNewGroup({ ...newGroup, status: e.target.value })}
                            className="w-full border border-gray-400 rounded px-3 py-2 text-sm"
                            whileFocus={{ scale: 1.01 }}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </motion.select>
                        </div>
                      )}

                      {/* Services Section (Hidden for add modal by default) */}
                      {newGroup.hasOwnProperty('services') && (
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
                            <p className="text-gray-500 italic">No services linked yet</p>
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