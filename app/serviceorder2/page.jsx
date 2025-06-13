"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import {
  Calendar, Home, Users, FileText, CreditCard, Package, BarChart3,
  Layers, ShoppingCart, Settings, LogOut, ArrowLeft, Pencil, Trash2,
  UserPlus, Tag, ClipboardList, Folder, BarChart, Factory, ShoppingBag, User
} from "lucide-react";

const mockServices = [
  { id: 1, name: "Facial Treatment", duration: "60 mins", price: "₱80" },
  { id: 2, name: "Microdermabrasion", duration: "45 mins", price: "₱120" },
  { id: 3, name: "Chemical Peel", duration: "30 mins", price: "₱90" },
];

// Simulating backend data fetch
const fetchServices = async () => {
  try {
    const response = await fetch('http://localhost/API/servicegroup.php?action=get_groups_with_services');
    const data = await response.json();

    // Transform backend structure to match frontend expectation
    const categories = data.map(group => ({
      id: group.group_id,
      name: group.group_name,
      services: group.services.map(service => ({
        id: service.service_id,
        name: service.name,
        price: parseFloat(service.price),
        duration: `${service.duration}m`,
      }))
    }));

    return { categories };
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return { categories: [] };
  }
};


export default function ServiceOrderPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const [customerName, setCustomerName] = useState("Mrs Jefferson");
  const [membershipType, setMembershipType] = useState("Standard");
  const [promoApplied, setPromoApplied] = useState("");
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [membershipBalance] = useState(10000);
  const [isMember, setIsMember] = useState(true);
  const membershipReduction = isMember ? subtotal * 0.5 : 0;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [showMembershipSignup, setShowMembershipSignup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    membershipType: "Standard",
  });

  const fetchCustomers = async () => {
    try {
      setIsCustomersLoading(true);
      const res = await fetch("http://localhost/API/customers.php");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();

      const formatted = data.map((cust) => ({
        id: cust.id,
        name: cust.name,
        membershipType: cust.membership_status,
        isMember: cust.membership_status !== 'None',
        balance: cust.membershipDetails?.remainingBalance || 0,
      }));

      setCustomers(formatted);
    } catch (err) {
      console.error(err);
      setCustomersError("Failed to load customers");
    } finally {
      setIsCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);


  // Fetch services on component mount
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      const { categories } = await fetchServices();
      setServiceCategories(categories);
      setActiveCategory(categories[0]?.id || null);
      setIsLoading(false);
    };

    loadServices();
  }, []);

  // Update subtotal whenever selected services change
  useEffect(() => {
    setSubtotal(selectedServices.reduce((sum, service) => sum + service.price, 0));
  }, [selectedServices]);

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleSave = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSave = () => {
    setShowConfirmation(false);
    toast.success("Service Acquire saved successfully!");
  };

  const handleClearAll = () => {
    setCustomerName("New Customer");
    setPromoApplied("");
    setDiscount(0);
    setSelectedServices([]);
    toast.info("All fields cleared");
  };

  const handleSelectCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  const handleNewCustomer = () => {
    setIsNewCustomerModalOpen(true);
    setShowMembershipSignup(false);
    setNewCustomer({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      birthday: "",
      membershipType: "Standard",
    });
  };

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name);
    setMembershipType(customer.membershipType);
    setIsMember(customer.isMember);
    setIsCustomerModalOpen(false);
  };

  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();

    const fullName = `${newCustomer.firstName} ${newCustomer.lastName}`.trim();

    const payload = {
      name: fullName,
      phone: newCustomer.phone,
      email: newCustomer.email,
      address: newCustomer.address || "",
      birthday: newCustomer.birthday || null,
      isMember: showMembershipSignup ? 1 : 0,
      membershipType: showMembershipSignup ? newCustomer.membershipType : null,
    };

    try {
      const response = await fetch("http://localhost/API/customers.php?action=add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Customer added successfully!");
        setIsNewCustomerModalOpen(false);
        setNewCustomer({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          address: "",
          birthday: "",
          membershipType: "Standard",
        });
        setShowMembershipSignup(false);
        fetchCustomers();
      } else {
        if (result.message && result.message.toLowerCase().includes("already exists")) {
          toast.error("Duplicate customer: " + result.message);
        } else {
          toast.error("Failed to add customer: " + (result.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("An error occurred. Please try again.");
    }
  }

  const handleAddMembership = (customerId) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? { ...customer, isMember: true, membershipType: "Standard", balance: 10000 }
        : customer
    ));
    toast.success("Membership added to customer!");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/home";
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      toast.error("Please enter a search query.");
    } else {
      // Perform search logic here
      toast.success(`Searching for "${searchQuery}"...`);
    }
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <Toaster />

      {/* Header */}
      <header className="flex items-center justify-between bg-[#89C07E] text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Home icon removed from here */}
        </div>

        {/* <div className="flex items-center space-x-4 flex-grow justify-center">
          <button className="text-2xl" onClick={() => setIsNewCustomerModalOpen(true)}>
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
        </div> */}

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

        {/* Main Content - Service Order */}
        <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h1 className="text-2xl font-bold mb-6">Service Acquire</h1>

            {/* Customer Section */}
            <motion.div
              className="mb-8 p-4 bg-gray-100 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{customerName}</span>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={handleSelectCustomer}
                        className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Select Customer
                      </motion.button>
                      <motion.button
                        onClick={handleNewCustomer}
                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        New Customer
                      </motion.button>
                    </div>
                  </div>

                  {isMember ? (
                    <>
                      <motion.div
                        className="flex items-center space-x-2 text-sm text-green-600 mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span>Membership Active</span>
                        <span className="text-gray-500">[Expires: Mar. 15, 2025]</span>
                      </motion.div>
                      <motion.div
                        className="text-sm mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="font-medium">Balance </span>
                        <span className="text-blue-600">₱{membershipBalance.toLocaleString()} Remaining</span>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      className="text-sm text-gray-600 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span>Regular Customer (Non-member)</span>
                    </motion.div>
                  )}

                  <motion.div
                    className="text-sm text-gray-500 flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined February 1, 2025</span>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  {isMember ? (
                    <>
                      <motion.div
                        className="flex justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-gray-600">Benefits</span>
                        <span className="font-medium">₱{membershipBalance.toLocaleString()}</span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="text-gray-600">Membership Type</span>
                        <span className="font-medium">{membershipType}</span>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      className="text-sm text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p>Non-members pay full price for all services</p>
                      <p className="text-green-600 mt-1">Sign up for membership to get discounts!</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Customer Selection Modal */}
            <AnimatePresence>
              {isCustomerModalOpen && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[85vh] flex flex-col"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                      <h3 className="text-lg font-semibold">Select Customer</h3>
                      <motion.button
                        onClick={() => setIsCustomerModalOpen(false)}
                        className="text-xl font-bold"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        &times;
                      </motion.button>
                    </div>
                    <div className="mb-4">
                      <motion.input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                        whileFocus={{ scale: 1.01 }}
                      />
                      <div className="overflow-y-auto flex-grow">
                        {isCustomersLoading ? (
                          <motion.div
                            className="flex justify-center items-center h-32"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        ) : customers.length > 0 ? (
                          <AnimatePresence>
                            {customers
                              .filter(customer =>
                                customer.name.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((customer, index) => (
                                <motion.div
                                  key={customer.id}
                                  className="p-3 border-b hover:bg-gray-50 flex justify-between items-center"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -50 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div
                                    className="cursor-pointer flex-grow"
                                    onClick={() => handleCustomerSelect(customer)}
                                  >
                                    <div className="font-medium">{customer.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {customer.isMember
                                        ? `${customer.membershipType} Membership (₱${customer.balance.toLocaleString()} remaining)`
                                        : "Regular Customer (Non-member)"}
                                    </div>
                                  </div>
                                  {!customer.isMember && (
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddMembership(customer.id);
                                      }}
                                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      Add Membership
                                    </motion.button>
                                  )}
                                </motion.div>
                              ))}
                          </AnimatePresence>
                        ) : (
                          <motion.div
                            className="text-center text-gray-500 py-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            No customers found.
                          </motion.div>
                        )
                        }
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                      <motion.button
                        onClick={() => setIsCustomerModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Customer Modal */}
            <AnimatePresence>
              {isNewCustomerModalOpen && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                      <h3 className="text-lg font-semibold">New Customer</h3>
                      <motion.button
                        onClick={() => setIsNewCustomerModalOpen(false)}
                        className="text-xl font-bold"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        &times;
                      </motion.button>
                    </div>
                    <form className="space-y-4" onSubmit={handleSaveNewCustomer}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block font-medium mb-1">Full Name*</label>
                        <div className="flex flex-col md:flex-row gap-2">
                          <motion.input
                            type="text"
                            name="firstName"
                            placeholder="First name"
                            value={newCustomer.firstName}
                            onChange={handleNewCustomerChange}
                            className="flex-1 border border-gray-400 px-2 py-1 rounded"
                            required
                            whileFocus={{ scale: 1.01 }}
                          />
                          <motion.input
                            type="text"
                            name="lastName"
                            placeholder="Last name"
                            value={newCustomer.lastName}
                            onChange={handleNewCustomerChange}
                            className="flex-1 border border-gray-400 px-2 py-1 rounded"
                            required
                            whileFocus={{ scale: 1.01 }}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div>
                          <label className="block font-medium mb-1">Phone Number*</label>
                          <motion.input
                            type="tel"
                            name="phone"
                            value={newCustomer.phone}
                            onChange={handleNewCustomerChange}
                            className="w-full border border-gray-400 px-2 py-1 rounded"
                            required
                            whileFocus={{ scale: 1.01 }}
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Email</label>
                          <motion.input
                            type="email"
                            name="email"
                            value={newCustomer.email}
                            onChange={handleNewCustomerChange}
                            className="w-full border border-gray-400 px-2 py-1 rounded"
                            whileFocus={{ scale: 1.01 }}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block font-medium mb-1">Address</label>
                        <motion.textarea
                          name="address"
                          value={newCustomer.address}
                          onChange={handleNewCustomerChange}
                          className="w-full border border-gray-400 px-2 py-1 rounded"
                          rows="3"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block font-medium mb-1">Date of Birth</label>
                        <motion.input
                          type="date"
                          name="birthday"
                          value={newCustomer.birthday}
                          onChange={handleNewCustomerChange}
                          className="w-full border border-gray-400 px-2 py-1 rounded"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>

                      <motion.div
                        className="pt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={showMembershipSignup}
                            onChange={() => setShowMembershipSignup(!showMembershipSignup)}
                          />
                          <span>Sign up for membership</span>
                        </label>
                      </motion.div>

                      {showMembershipSignup && (
                        <motion.div
                          className="bg-gray-50 p-4 rounded-lg mt-2 space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="font-medium text-green-700">Membership Sign Up</h4>
                          <div>
                            <label className="block text-sm font-medium mb-1">Membership Type*</label>
                            <motion.select
                              name="membershipType"
                              value={newCustomer.membershipType}
                              onChange={handleNewCustomerChange}
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              required
                              whileFocus={{ scale: 1.01 }}
                            >
                              <option value="Standard">Standard (P10,000 benefits)</option>
                              <option value="Premium">Premium (P20,000 benefits)</option>
                              <option value="Basic">Basic (P5,000 benefits)</option>
                            </motion.select>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        className="flex justify-end gap-2 pt-4 border-t"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.button
                          type="button"
                          onClick={() => setIsNewCustomerModalOpen(false)}
                          className="px-4 py-2 border rounded text-gray-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showMembershipSignup ? "Save as Member" : "Save as Walk-in"}
                        </motion.button>
                      </motion.div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Services Selection Section */}
            <motion.div
              className="mb-8 p-4 bg-gray-100 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold mb-4">Select Services</h2>

              {isLoading ? (
                <motion.div
                  className="flex justify-center items-center h-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              ) : (
                <>
                  {/* Category Tabs */}
                  <div className="flex overflow-x-auto pb-2 mb-4">
                    {serviceCategories.map(category => (
                      <motion.button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-4 py-2 mr-2 rounded-lg whitespace-nowrap ${activeCategory === category.id
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-200'
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category.name}
                      </motion.button>
                    ))}
                    {/* Conditionally show Members Only category */}
                    {isMember && (
                      <motion.button
                        onClick={() => setActiveCategory('members-exclusive')}
                        className={`px-4 py-2 mr-2 rounded-lg whitespace-nowrap ${activeCategory === 'members-exclusive'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-200'
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Members Exclusive
                      </motion.button>
                    )}
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCategory === 'members-exclusive' ? (
                      // Show mock services for members
                      mockServices.map(service => (
                        <motion.div
                          key={service.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedServices.some(s => s.id === service.id)
                              ? 'bg-green-100 border-green-500'
                              : 'bg-white hover:bg-gray-50'
                            }`}
                          onClick={() => handleServiceToggle(service)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{service.name}</h3>
                              <p className="text-sm text-gray-600">{service.duration}</p>
                            </div>
                            <span className="font-bold">{service.price}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Members Exclusive
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      // Show regular services for the selected category
                      serviceCategories
                        .find(cat => cat.id === activeCategory)
                        ?.services.map(service => (
                          <motion.div
                            key={service.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedServices.some(s => s.id === service.id)
                                ? 'bg-green-100 border-green-500'
                                : 'bg-white hover:bg-gray-50'
                              }`}
                            onClick={() => handleServiceToggle(service)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{service.name}</h3>
                                <p className="text-sm text-gray-600">{service.duration}</p>
                              </div>
                              <span className="font-bold">₱{service.price.toLocaleString()}</span>
                            </div>
                          </motion.div>
                        ))
                    )}
                  </div>
                </>
              )}

              {/* Selected Services List */}
              {selectedServices.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-medium mb-2">Selected Services ({selectedServices.length})</h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {selectedServices.map((service, index) => {
                        const isMemberService = mockServices.some(s => s.id === service.id);
                        const category = isMemberService
                          ? "Members Exclusive"
                          : serviceCategories.find(cat =>
                            cat.services.some(s => s.id === service.id)
                          )?.name || "Other";

                        return (
                          <motion.div
                            key={service.id}
                            className="flex justify-between items-center p-2 bg-white rounded border"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.005 }}
                          >
                            <div>
                              <span>{service.name}</span>
                              <span className="text-xs text-gray-500 block">{category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {isMemberService ? service.price : `₱${service.price.toLocaleString()}`}
                              </span>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceToggle(service);
                                }}
                                className="text-red-500 hover:text-red-700"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Promo & Discount Section */}
            <motion.div
              className="mb-8 p-4 bg-gray-100 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Promo & Discount</h2>

                {/* Info Button + Popup */}
                <div className="relative">
                  <motion.button
                    className="text-xs text-blue-600 border border-blue-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-blue-100"
                    onClick={() => setShowInfo(!showInfo)}
                    title="Promo & Membership Info"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ?
                  </motion.button>

                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        className="absolute left-full top-0 ml-2 bg-white shadow-lg p-4 rounded-lg w-80 text-sm z-20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <p className="mb-2 bg-gray-100 p-2 rounded">
                          <strong>Promo</strong> is for salon only. You cannot apply Promo & Membership together.
                        </p>
                        <p className="bg-white p-2 rounded">
                          <strong>Membership</strong> benefits apply only to salon services priced at ₱500 or below and cannot be combined with any promos.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Promo</label>
                  <motion.select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={promoApplied}
                    onChange={(e) => setPromoApplied(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                  >
                    <option value="">Select Promo</option>
                    <option value="summer2023">Summer 2023 Special</option>
                    <option value="anniversary">Anniversary Promo</option>
                    <option value="newcustomer">New Customer Discount</option>
                  </motion.select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <motion.input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex justify-end space-x-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                onClick={handleClearAll}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
            </motion.div>

            {/* Summary Section */}
            <motion.div
              className="p-4 bg-gray-100 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <motion.div
                  className="flex justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span>Subtotal</span>
                  <span className="font-medium">₱{subtotal.toLocaleString()}</span>
                </motion.div>

                <motion.div
                  className="flex justify-between text-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span>Promo Reduction</span>
                  <span>₱0</span>
                </motion.div>

                <motion.div
                  className="flex justify-between text-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span>Discount Reduction</span>
                  <span>₱{discount.toLocaleString()}</span>
                </motion.div>

                {isMember && (
                  <motion.div
                    className="flex justify-between text-green-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span>Membership Reduction</span>
                    <span>P{membershipReduction.toLocaleString()}</span>
                  </motion.div>
                )}

                <motion.div
                  className="border-t border-gray-300 pt-3 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isMember && (
                    <div className="flex justify-between font-bold">
                      <span>Remaining Membership</span>
                      <span className="text-blue-600">
                        ₱{(membershipBalance - membershipReduction).toLocaleString()}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Confirmation Modal */}
            <AnimatePresence>
              {showConfirmation && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-lg p-6 w-full max-w-md"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <h2 className="text-xl font-bold mb-4">Confirm Save Order Details?</h2>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium">{customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Promo</p>
                          <p>-</p>
                        </div>
                        {isMember && (
                          <div>
                            <p className="text-sm text-gray-500">Remaining Balance</p>
                            <p className="font-medium">
                              ₱{(membershipBalance - membershipReduction).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Services</p>
                        <ul className="space-y-2">
                          {selectedServices.map((service, index) => (
                            <motion.li
                              key={index}
                              className="flex justify-between"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <span>• {service.name}</span>
                              <span>₱{service.price.toLocaleString()}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-medium">₱{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Promo Discount</span>
                          <span>₱0</span>
                        </div>
                        {isMember && (
                          <div className="flex justify-between">
                            <span>Membership Deduction</span>
                            <span>₱{membershipReduction.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2">
                          <span>GRAND TOTAL</span>
                          <span>₱{(subtotal - membershipReduction).toLocaleString()}.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                        onClick={() => setShowConfirmation(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                        onClick={confirmSave}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Yes
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}