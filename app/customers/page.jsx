"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import {
  BarChart, BarChart3, Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart,
  Settings, LogOut, Plus, User, UserPlus, Tag, Factory, ClipboardList, Folder, ShoppingBag, Calendar, Edit, Eye, RefreshCw,
  RefreshCcwDot
} from "lucide-react";


export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Membership-related states
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedForMembership, setSelectedForMembership] = useState(null);
  const [membershipForm, setMembershipForm] = useState({
    type: "Standard",
    description: "",
    fee: "",
    benefit: "",
    validFrom: "",
    validTo: ""
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    membership: "None",
    customerId: "",
    birthday: ""
  });

  useEffect(() => {
    fetchCustomers(activeTab);
  }, [activeTab]);

  const fetchCustomers = async (filter = 'all') => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost/API/customers.php?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);  // backend returns filtered data
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  const fetchCustomerDetails = async (customerId) => {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`http://localhost/API/customers.php?customerId=${customerId}`);
      const data = await res.json();

      // Make sure to include all expected properties in the result
      setSelectedCustomer({
        id: data.id,
        name: data.name,
        contact: data.contact,
        email: data.email,
        address: data.address,
        birthday: data.birthday,
        customerId: data.customerId,
        membership: data.membership || "None",
        membershipDetails: data.membershipDetails || null,
        transactions: data.transactions || [],
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (activeTab === "all") return true;
    if (activeTab === "member") return customer.membership_status !== "None";
    if (activeTab === "nonMember") return customer.membership_status === "None";
    return true;
  });

  const handleRenewMembership = () => {
    // Implement renewal logic here
    toast.success("Membership renewed successfully");
    setIsRenewModalOpen(false);
  };

  const handleSaveMembership = () => {
    const updatedCustomers = customers.map(customer =>
      customer.id === selectedForMembership.id
        ? { ...customer, membership: membershipForm.type }
        : customer
    );
    setCustomers(updatedCustomers);
    setIsMembershipModalOpen(false);
    setSelectedCustomer(updatedCustomers.find(c => c.id === selectedForMembership.id));
    toast.success("Membership added successfully");
  };

  const handleAddMembership = (customerId) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === customerId ? { ...customer, membership: "Standard" } : customer
    );
    setCustomers(updatedCustomers);
    toast.success("Membership added successfully");
  };

  const handleAddMembershipClick = (customer) => {
    setSelectedForMembership(customer);
    setIsMembershipModalOpen(true);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim() === "") {
        fetchCustomers(activeTab);
      } else {
        const filtered = customers.filter(customer =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.contact.includes(searchQuery) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.customerId.includes(searchQuery)
        );
        setCustomers(filtered);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delaySearch);
  }, [searchQuery, activeTab]);

  const handleEditClick = (customer) => {
    setEditCustomer({ ...customer }); // Clone the customer
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedCustomer) => {
    try {
      const res = await fetch(`http://localhost/API/customers.php?action=update&id=${updatedCustomer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer),
      });

      const result = await res.json();

      if (result.success) {
        // Update local state
        const updatedList = customers.map((cust) =>
          cust.id === updatedCustomer.id ? updatedCustomer : cust
        );
        setCustomers(updatedList);
        toast.success("Customer updated successfully.");
        setIsEditModalOpen(false);
      } else {
        toast.error(result.message || "Failed to update.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    }
  };


  const handleSave = () => {
    const updatedCustomers = customers.map(customer =>
      customer.id === formData.id ? formData : customer
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer(formData);
    setEditMode(false);
    toast.success("Changes saved successfully");
  };

  const handleAddCustomer = async () => {
    try {
      // Validate required fields
      if (!newCustomer.name || !newCustomer.contact) {
        toast.error("Name and contact information are required");
        return;
      }

      // Generate customer ID if not provided
      const customerId = newCustomer.customerId || `CUS${Math.floor(100000 + Math.random() * 900000)}`;

      // Prepare the data to send
      const customerData = {
        action: "add",
        name: newCustomer.name,
        contact: newCustomer.contact,
        email: newCustomer.email,
        address: newCustomer.address,
        customerId: customerId,
        birthday: newCustomer.birthday || null // Add birthday if your form has it
      };

      // Send request to PHP backend
      const response = await fetch('customers.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add customer');
      }

      // Update local state with the new customer (optional - you could refetch instead)
      const newCustomerFromServer = {
        ...customerData,
        id: result.id, // Assuming your PHP returns the new ID
        membership: "None" // Default membership status
      };

      setCustomers([...customers, newCustomerFromServer]);
      setNewCustomer({
        name: "",
        contact: "",
        email: "",
        address: "",
        membership: "None",
        customerId: "",
        birthday: ""
      });
      setIsModalOpen(false);
      toast.success("Customer added successfully");

    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error(error.message || "Failed to add customer");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

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
            placeholder="Search customers..."
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
            A
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
                { href: "/servicess", label: "All Services", icon: <Layers size={20} /> },
                { href: "/membership", label: "Memberships", icon: <UserPlus size={20} /> },
                { href: "/membership-report", label: "Membership Report", icon: <BarChart3 size={20} /> },
                { href: "/items", label: "Beauty Deals", icon: <Tag size={20} /> },
                { href: "/serviceorder", label: "Service Acquire", icon: <ClipboardList size={20} /> },
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
                { href: "/customers", label: "Customers", icon: <Users size={20} /> },
                { href: "/invoices", label: "Invoices", icon: <FileText size={20} /> },
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
        <main className="flex-1 p-8 p-6 bg-white max-w-screen-xl mx-auto ml-64">
          {/* Top Section with Tabs and Add Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center mb-4"
          >
            {/* Membership Tabs */}
            <div className="flex border-b border-gray-200">
              {["all", "member", "nonMember"].map((tab) => (
                <motion.button
                  key={tab}
                  className={`py-2 px-4 font-medium ${activeTab === tab ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
                  onClick={() => {
                    setActiveTab(tab);
                    fetchCustomers(tab);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab === "all" ? "All Customers" : tab === "member" ? "Members" : "Non-Members"}
                </motion.button>
              ))}
            </div>

            {/* Add Customer Button with responsive margin */}
            <div className={`${selectedCustomer ? "mr-[350px]" : ""} transition-all duration-300`}>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                <span>New Customer</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="flex">
            {/* Customer List */}
            <motion.div
              className={`${selectedCustomer ? "w-[calc(100%-350px)]" : "w-full"} transition-all duration-300 pr-4`}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredCustomers.map((customer) => (
                        <motion.tr
                          key={customer.id}
                          className={`hover:bg-gray-50 cursor-pointer ${selectedCustomer?.id === customer.id ? "bg-[#E3F9E5]" : ""}`}
                          onClick={() => fetchCustomerDetails(customer.id)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          whileHover={{ scale: 1.005 }}
                        >
                          {/* Customer Column */}
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {customer.name}
                                  {customer.membership_status === "VIP" && (
                                    <motion.span
                                      className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full"
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      VIP
                                    </motion.span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">ID: {customer.customerId}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <Calendar size={12} className="inline mr-1" />
                                  {customer.birthday}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info Column */}
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{customer.contact}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[180px]">
                              {customer.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[180px]">
                              {customer.address}
                            </div>
                          </td>

                          {/* Membership Column */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <motion.span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.membership_status?.toLowerCase() === "vip"
                                  ? "bg-purple-200 text-purple-800"
                                  : customer.membership_status?.toLowerCase() === "standard"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-gray-200 text-gray-800"
                                  }`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {customer.membership_status?.toLowerCase() === "vip"
                                  ? "VIP"
                                  : customer.membership_status?.toLowerCase() === "standard"
                                    ? "Standard"
                                    : "Non-Member"}
                              </motion.span>

                              {customer.membership_status?.toLowerCase() !== "none" && customer.membershipDetails && (
                                <div className="mt-1 text-xs text-gray-500">
                                  <div>Expires: {customer.membershipDetails.expireDate}</div>
                                  <div>Balance: {customer.membershipDetails.remainingBalance}</div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="flex space-x-2">
                              {customer.membership_status === "None" ? (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddMembershipClick(customer);
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <UserPlus size={16} />
                                </motion.button>
                              ) : (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsRenewModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <RefreshCcwDot size={16} />
                                </motion.button>
                              )}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(customer); // Pass the current customer
                                }}
                                className="text-gray-600 hover:text-gray-800"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit size={16} />
                              </motion.button>
                              <motion.button
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-gray-600 hover:text-gray-800"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Eye size={16} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            </motion.div>

            {/* Customer Detail Panel */}
            {selectedCustomer && (
              <div className="hidden lg:block w-[350px]">
                <div className="w-[350px] bg-white rounded-lg shadow-md border border-gray-400 p-4 fixed right-4 top-20 bottom-4 overflow-y-auto">
                  {/* Only add this spinner div - keep everything else exactly the same */}
                  {isLoadingDetails && (
                    <div className="flex justify-center mb-2">
                      <RefreshCw className="animate-spin h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {/* Panel Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Customer Info */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {selectedCustomer.contact}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {selectedCustomer.email}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Address:</span> {selectedCustomer.address}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Birthday:</span> {selectedCustomer.birthday}
                        </p>
                      </div>
                    </div>

                    {/* Membership Status */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Membership Status</h3>
                      <motion.div
                        className={`p-3 rounded-lg ${selectedCustomer.membership?.toLowerCase() === "vip"
                          ? "bg-purple-300 text-purple-800"
                          : selectedCustomer.membership?.toLowerCase() === "standard"
                            ? "bg-blue-300"
                            : "bg-gray-300"
                          }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {selectedCustomer.membership?.toLowerCase() === "vip"
                              ? "VIP"
                              : selectedCustomer.membership?.toLowerCase() === "standard"
                                ? "Standard"
                                : "Non-Member"}
                          </span>
                          {selectedCustomer.membership !== "None" && selectedCustomer.membershipDetails?.expireDate && (
                            <span className="text-xs text-gray-600">
                              Expires: {selectedCustomer.membershipDetails.expireDate}
                            </span>
                          )}
                        </div>

                        {selectedCustomer.membership !== "None" && (
                          <div className="mt-2 text-sm">
                            <p>Coverage: {selectedCustomer.membershipDetails?.coverage}</p>
                            <p>Remaining: {selectedCustomer.membershipDetails?.remainingBalance}</p>
                          </div>
                        )}
                      </motion.div>

                      <div className="mt-2">
                        {selectedCustomer.membership === "None" ? (
                          <motion.button
                            onClick={() => handleAddMembershipClick(selectedCustomer)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Add Membership
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => setIsRenewModalOpen(true)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Renew Membership
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div >

      <AnimatePresence>
        {isMembershipModalOpen && selectedForMembership && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-[600px]"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-4">
                Add Membership to {selectedForMembership.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Membership Type</label>
                  <select
                    value={membershipForm.type}
                    onChange={(e) => setMembershipForm({ ...membershipForm, type: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Standard">Standard</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={membershipForm.description}
                    onChange={(e) => setMembershipForm({ ...membershipForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fee</label>
                    <input
                      type="text"
                      value={membershipForm.fee}
                      onChange={(e) => setMembershipForm({ ...membershipForm, fee: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Benefit</label>
                    <input
                      type="text"
                      value={membershipForm.benefit}
                      onChange={(e) => setMembershipForm({ ...membershipForm, benefit: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Valid from</label>
                    <input
                      type="date"
                      value={membershipForm.validFrom}
                      onChange={(e) => setMembershipForm({ ...membershipForm, validFrom: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valid to</label>
                    <input
                      type="date"
                      value={membershipForm.validTo}
                      onChange={(e) => setMembershipForm({ ...membershipForm, validTo: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsMembershipModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMembership}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Membership Modal */}
      <AnimatePresence>
        {isRenewModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-96"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-4">Renew Membership</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Membership Type</label>
                  <select className="w-full p-2 border rounded">
                    <option>Standard (₱5,000)</option>
                    <option>VIP (₱10,000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select className="w-full p-2 border rounded">
                    <option>E-wallet</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <select className="w-full p-2 border rounded">
                    <option>1 month</option>
                    <option>2 months</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenewMembership}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Confirm Renewal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-[700px] max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact</label>
                    <input
                      type="text"
                      value={newCustomer.contact}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, contact: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="text"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, address: e.target.value })
                      }
                      className="w-full p-2 border rounded h-[calc(3.5rem)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Membership</label>
                    <select
                      value={newCustomer.membership}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, membership: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="None">Non-Member</option>
                      <option value="Standard">Standard Member</option>
                      <option value="VIP">VIP Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Customer ID (optional)
                    </label>
                    <input
                      type="text"
                      value={newCustomer.customerId}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, customerId: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Will auto-generate if empty"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditModalOpen && editCustomer && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-[700px] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-4">Edit Customer Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editCustomer.name}
                    onChange={(e) =>
                      setEditCustomer({ ...editCustomer, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <input
                    type="text"
                    value={editCustomer.contact}
                    onChange={(e) =>
                      setEditCustomer({ ...editCustomer, contact: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) =>
                      setEditCustomer({ ...editCustomer, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={editCustomer.address}
                    onChange={(e) =>
                      setEditCustomer({ ...editCustomer, address: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Birthday</label>
                  <input
                    type="date"
                    value={editCustomer.birthday}
                    onChange={(e) =>
                      setEditCustomer({ ...editCustomer, birthday: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(editCustomer)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}