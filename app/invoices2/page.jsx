"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import {
  BarChart, Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart,
  Settings, LogOut, Plus, User, UserPlus, Tag, Factory, ClipboardList, Folder, ShoppingBag, BarChart3
} from "lucide-react";


export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost/API/getInvoices.php', {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();

        // No need to transform data since API already provides the correct format
        setInvoices(result);
        setFilteredInvoices(result);

      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        setError(error.message);
        toast.error(`Failed to load invoices: ${error.message}`);

        // Fallback to mock data if API fails (remove in production)
        const mockData = [
          {
            id: 1,
            name: "Sample Customer",
            invoiceNumber: "000001",
            dateIssued: "Feb 26, 2025",
            totalAmount: "₱150.00",
            paymentStatus: "Paid",
            services: [{ name: "Sample Service", price: "₱150.00" }]
          }
        ];
        setInvoices(mockData);
        setFilteredInvoices(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(invoice =>
        invoice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toString().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

  const handleSearch = () => {
    toast(`Found ${filteredInvoices.length} invoices matching "${searchQuery}"`);
  };

  const handlePaymentStatusUpdate = async (invoiceId, newStatus) => {
    try {
      // Optimistic UI update
      const updatedInvoices = invoices.map(invoice =>
        invoice.id === invoiceId ? { ...invoice, paymentStatus: newStatus } : invoice
      );

      setInvoices(updatedInvoices);
      setFilteredInvoices(updatedInvoices);

      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, paymentStatus: newStatus });
      }

      // API call to update status
      const response = await fetch('http://localhost/API/updateInvoiceStatus.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status on server');
      }

      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update invoice status");

      // Revert changes if update fails
      const originalInvoices = [...invoices];
      setInvoices(originalInvoices);
      setFilteredInvoices(originalInvoices);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const filterInvoicesByPeriod = (period) => {
    const today = new Date();
    let filtered = [...invoices]; // Start with a copy of all invoices

    if (period === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday of this week
      filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfWeek;
      });
    }
    else if (period === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfMonth;
      });
    }
    else if (period === 'year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfYear;
      });
    }

    setFilteredInvoices(filtered);
    toast.success(`Showing invoices from this ${period}`);
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
          <button className="text-2xl" onClick={() => setIsModalOpen(true)}>
            ➕
          </button>
          <input
            type="text"
            placeholder="Search for..."
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

        <main className="flex-1 p-6 bg-white max-w-screen-xl mx-auto ml-64">
          {/* Header with Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center mb-4"
          >
            <h1 className="text-xl font-bold">All Invoices</h1>
            <div className={`flex space-x-2 ${selectedInvoice ? "mr-[350px]" : ""} transition-all duration-300`}>
              <motion.button
                onClick={() => filterInvoicesByPeriod('week')}
                className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>This Week</span>
              </motion.button>
              <motion.button
                onClick={() => filterInvoicesByPeriod('month')}
                className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>This Month</span>
              </motion.button>
              <motion.button
                onClick={() => filterInvoicesByPeriod('year')}
                className="flex items-center space-x-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>This Year</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer name or invoice number..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1.5 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3">Loading invoices...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-red-800 font-bold">Error Loading Data</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex">
              {/* Invoice List */}
              <div className={`${selectedInvoice ? "w-[calc(100%-350px)]" : "w-full"} transition-all duration-300 pr-4`}>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice, index) => (
                          <motion.tr
                            key={invoice.id}
                            className={`group hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${selectedInvoice?.id === invoice.id ? "bg-[#E3F9E5]" : ""}`}
                            onClick={() => setSelectedInvoice(invoice)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{
                              backgroundColor: "rgba(243, 244, 246, 0.7)",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            }}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {invoice.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {invoice.dateIssued}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {invoice.totalAmount}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <motion.span
                                className={`px-2 py-1 text-xs rounded-full ${invoice.paymentStatus === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                                  }`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {invoice.paymentStatus}
                              </motion.span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 space-x-2">
                              {invoice.paymentStatus === "Pending" && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePaymentStatusUpdate(invoice.id, "Paid");
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  Mark Paid
                                </motion.button>
                              )}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.print();
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                Print
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                            No invoices found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              </div>

              {/* Invoice Detail Panel */}
              {selectedInvoice && (
                <div className="hidden lg:block w-2/5 pl-4">
                  <div className="w-[350px] bg-white rounded-lg shadow-md border border-gray-400 p-4 fixed right-4 top-20 bottom-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-gray-200">
                      <motion.h2
                        className="text-xl font-bold"
                        whileHover={{ color: "#3B82F6" }}
                        transition={{ duration: 0.2 }}
                      >
                        Invoice #{selectedInvoice.invoiceNumber}
                      </motion.h2>
                      <motion.button
                        onClick={() => setSelectedInvoice(null)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                      <div className="grid grid-cols-2 gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <div>
                          <h3 className="text-md font-semibold mb-2">Customer</h3>
                          <p className="text-gray-700 text-sm">{selectedInvoice.name}</p>
                        </div>
                        <div>
                          <h3 className="text-md font-semibold mb-2">Details</h3>
                          <div className="grid grid-cols-2 gap-1 text-sm">
                            <span className="text-gray-600">Invoice #:</span>
                            <span>{selectedInvoice.invoiceNumber}</span>
                            <span className="text-gray-600">Date:</span>
                            <span>{selectedInvoice.dateIssued}</span>
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${selectedInvoice.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {selectedInvoice.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <h3 className="text-md font-semibold mb-2">Services</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-blue-600 transition-colors">Service</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-blue-600 transition-colors">Price</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedInvoice.services.map((service, index) => (
                                <motion.tr
                                  key={index}
                                  className="hover:bg-gray-100 transition-colors duration-150"
                                  whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.7)" }}
                                >
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-900 hover:text-blue-600 transition-colors">
                                    {service.name}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                                    {service.price}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <div className="flex justify-end items-center space-x-4">
                          <div className="w-full sm:w-64 space-y-2 text-sm">
                            <div className="flex justify-between py-1 border-b">
                              <span className="font-medium">Subtotal:</span>
                              <span>{selectedInvoice.totalAmount}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                              <span className="font-medium">Tax:</span>
                              <span>₱0.00</span>
                            </div>
                            <div className="flex justify-between py-1 font-bold">
                              <span>Total:</span>
                              <span>{selectedInvoice.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2 sticky bottom-0 bg-white pb-2">
                        <button
                          onClick={() => window.print()}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Print
                        </button>
                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div >
    </div >
  );
}