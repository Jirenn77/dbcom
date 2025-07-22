"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  User,
  UserPlus,
  Tag,
  Factory,
  ClipboardList,
  Folder,
  ShoppingBag,
  BarChart3,
  BarChartIcon,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dynamic from "next/dynamic";

const RechartsBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const RechartsBar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const RechartsXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const RechartsYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const RechartsCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const RechartsTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const RechartsLegend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);
const RechartsResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [activeView, setActiveView] = useState("sales");

  useEffect(() => {
    // Fetch current user data (including branch info)
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          "http://localhost/API/getCurrentUser.php",
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const userData = await response.json();
        setCurrentUser(userData);

        // If user has a branch, set it as default filter
        if (userData.branch) {
          setSelectedBranch(userData.branch);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    // Fetch branches data
    const fetchBranches = async () => {
      try {
        const response = await fetch("http://localhost/API/getBranches.php");
        const branchesData = await response.json();
        setBranches(branchesData);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };

    fetchCurrentUser();
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost/API/getInvoices.php?branch=${selectedBranch}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
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
            services: [{ name: "Sample Service", price: "₱150.00" }],
            branch: "Main",
            handledBy: "Admin",
          },
        ];
        setInvoices(mockData);
        setFilteredInvoices(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [selectedBranch]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("http://localhost/API/getInvoices.php", {
          headers: {
            "Content-Type": "application/json",
          },
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
            services: [{ name: "Sample Service", price: "₱150.00" }],
          },
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
      const filtered = invoices.filter(
        (invoice) =>
          invoice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoiceNumber.toString().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

  const prepareChartData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Group invoices by month
    const monthlyData = invoices.reduce((acc, invoice) => {
      if (selectedBranch !== "all" && invoice.branch !== selectedBranch) {
        return acc;
      }

      const invoiceDate = new Date(invoice.dateIssued);
      const month = invoiceDate.getMonth();
      const year = invoiceDate.getFullYear();

      // Only include current year's data
      if (year !== currentYear) return acc;

      const monthName = new Date(2000, month, 1).toLocaleString("default", {
        month: "short",
      });
      const amount =
        typeof invoice.totalAmount === "string"
          ? parseFloat(invoice.totalAmount.replace(/[₱,]/g, ""))
          : invoice.totalAmount;

      if (!acc[month]) {
        acc[month] = {
          name: monthName,
          sales: 0,
          count: 0,
        };
      }

      acc[month].sales += amount || 0;
      acc[month].count += 1;

      return acc;
    }, {});

    // Fill in all months with data (even if no sales)
    const completeData = Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(2000, i, 1).toLocaleString("default", {
        month: "short",
      });
      return monthlyData[i] || { name: monthName, sales: 0, count: 0 };
    });

    return completeData;
  };

  const chartData = prepareChartData();

  const handlePaymentStatusUpdate = async (invoiceId, newStatus) => {
    try {
      // Optimistic UI update
      const updatedInvoices = invoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, paymentStatus: newStatus }
          : invoice
      );

      setInvoices(updatedInvoices);
      setFilteredInvoices(updatedInvoices);

      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, paymentStatus: newStatus });
      }

      // API call to update status
      const response = await fetch(
        "http://localhost/API/updateInvoiceStatus.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoiceId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status on server");
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

  const filterInvoicesByCustomDate = (date) => {
    setSelectedDate(date);

    if (!date) {
      setFilteredInvoices(invoices); // Reset
      return;
    }

    const filtered = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.dateIssued);
      return invoiceDate.toDateString() === new Date(date).toDateString();
    });

    setFilteredInvoices(filtered);
    toast.success(`Showing invoices on ${date.toDateString()}`);
  };

  const filterInvoicesByPeriod = (period) => {
    const now = new Date();
    let filtered = [...invoices]; // Start with a copy of all invoices

    if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday of this week
      filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfWeek;
      });
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfMonth;
      });
    } else if (period === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfYear;
      });
    }

    setFilteredInvoices(filtered);
    toast.success(`Showing invoices from this ${period}`);
  };

  // Calculate sales report data
  const calculateSalesReport = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let dailySales = 0;
    let weeklySales = 0;
    let monthlySales = 0;
    let yearlySales = 0;
    let totalSales = 0;
    let paidInvoices = 0;
    let pendingInvoices = 0;

    invoices.forEach((invoice) => {
      // Skip if invoice doesn't belong to selected branch (unless 'all' is selected)
      if (selectedBranch !== "all" && invoice.branch !== selectedBranch) {
        return;
      }

      const invoiceDate = new Date(invoice.dateIssued);
      const amount =
        typeof invoice.totalAmount === "string"
          ? parseFloat(invoice.totalAmount.replace(/[₱,]/g, ""))
          : invoice.totalAmount;

      totalSales += amount || 0;

      if (invoice.paymentStatus === "Paid") {
        paidInvoices++;
      } else {
        pendingInvoices++;
      }

      if (invoiceDate >= startOfDay) {
        dailySales += amount || 0;
      }
      if (invoiceDate >= startOfWeek) {
        weeklySales += amount || 0;
      }
      if (invoiceDate >= startOfMonth) {
        monthlySales += amount || 0;
      }
      if (invoiceDate >= startOfYear) {
        yearlySales += amount || 0;
      }
    });

    return {
      dailySales,
      weeklySales,
      monthlySales,
      yearlySales,
      totalSales,
      paidInvoices,
      pendingInvoices,
      totalInvoices: invoices.filter(
        (invoice) =>
          selectedBranch === "all" || invoice.branch === selectedBranch
      ).length,
    };
  };

  const salesReport = calculateSalesReport();

  // Group invoices by customer name (or customerId if that's better)
  const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
    if (!acc[invoice.name]) {
      acc[invoice.name] = invoice;
    } else {
      // Optionally: update if newer invoice
      if (
        new Date(invoice.dateIssued) > new Date(acc[invoice.name].dateIssued)
      ) {
        acc[invoice.name] = invoice;
      }
    }
    return acc;
  }, {});

  const selectedCustomerName = selectedInvoice?.name;

  const recentServicesForCustomer = filteredInvoices
    .filter((inv) => inv.name === selectedCustomerName)
    .flatMap((inv) =>
      inv.services.map((service) => ({
        ...service,
        invoiceDate: inv.dateIssued,
        invoiceId: inv.invoiceNumber,
        employee: service.employee || "Staff", // fallback
      }))
    )
    .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));

  const subtotal = recentServicesForCustomer.reduce((sum, service) => {
    const price =
      typeof service.price === "string"
        ? parseFloat(service.price.replace(/[₱,]/g, ""))
        : service.price;
    return sum + (price || 0);
  }, 0);

  const uniqueInvoices = Object.values(groupedInvoices);

  // Group and sum all invoices by customer name
  const invoiceTotalsByCustomer = filteredInvoices.reduce((acc, invoice) => {
    const key = invoice.name;
    const amount =
      typeof invoice.totalAmount === "string"
        ? parseFloat(invoice.totalAmount.replace(/[₱,]/g, ""))
        : invoice.totalAmount;

    if (!acc[key]) acc[key] = 0;
    acc[key] += amount || 0;
    return acc;
  }, {});

  function formatCurrency(value) {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/[₱,]/g, ""))
        : value;
    if (isNaN(num)) return "₱0.00";
    return `₱${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  }

  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster />

      {/* Header */}
      <header className="flex items-center justify-between bg-[#89C07E] text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4 flex-grow justify-center">
          <input
            type="text"
            placeholder="Search customer name or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 w-96 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-4 relative">
          <div className="flex items-center space-x-2">
            {currentUser && (
              <>
                <span className="text-sm hidden md:block">
                  {currentUser.name}
                </span>
                <span className="text-xs bg-white text-gray-900 px-2 py-1 rounded hidden md:block">
                  {currentUser.branch || "No Branch"}
                </span>
              </>
            )}
            <div
              className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {currentUser?.name?.charAt(0) || "A"}
            </div>
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
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded justify-start"
                onClick={handleLogout}
              >
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
              <Menu.Button
                as="div"
                className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center cursor-pointer"
              >
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
                {
                  href: "/servicess",
                  label: "All Services",
                  icon: <Layers size={20} />,
                },
                {
                  href: "/membership",
                  label: "Memberships",
                  icon: <UserPlus size={20} />,
                },
                {
                  href: "/membership-report",
                  label: "Membership Report",
                  icon: <BarChart3 size={20} />,
                },
                {
                  href: "/items",
                  label: "Beauty Deals",
                  icon: <Tag size={20} />,
                },
                {
                  href: "/serviceorder",
                  label: "Service Acquire",
                  icon: <ClipboardList size={20} />,
                },
              ].map((link) => (
                <Menu.Item key={link.href}>
                  {({ active }) => (
                    <Link
                      href={link.href}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${active ? "bg-[#2A3F3F] text-white" : ""}`}
                    >
                      {link.icon}
                      <span className="font-normal md:font-bold">
                        {link.label}
                      </span>
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>

          <Menu as="div" className="relative w-full px-4 mt-4">
            <Menu.Button className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center">
              <BarChart3 className="mr-2" size={20} /> Sales ▾
            </Menu.Button>
            <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
              {[
                {
                  href: "/customers",
                  label: "Customers",
                  icon: <Users size={20} />,
                },
                {
                  href: "/invoices",
                  label: "Invoices",
                  icon: <FileText size={20} />,
                },
              ].map((link) => (
                <Menu.Item key={link.href}>
                  {({ active }) => (
                    <Link
                      href={link.href}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${active ? "bg-[#2A3F3F] text-white" : ""}`}
                    >
                      {link.icon}
                      <span className="font-normal md:font-bold">
                        {link.label}
                      </span>
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </nav>

        <main className="flex-1 p-6 bg-white max-w-screen-xl mx-auto ml-64">
          {/* View Toggle Buttons */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveView("sales")}
              className={`py-2 px-4 font-medium text-sm ${activeView === "sales" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setActiveView("invoices")}
              className={`py-2 px-4 font-medium text-sm ${activeView === "invoices" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              All Invoices
            </button>
          </div>

          {/* Sales Report View */}
          {activeView === "sales" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4">
                {/* Header with branch selector */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center">
                    <BarChartIcon className="mr-2" size={20} />
                    Sales Report{" "}
                    {selectedBranch !== "all" && `- ${selectedBranch}`}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">
                      Handled by: {currentUser?.name || "User"}
                    </div>
                    <div className="relative">
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="appearance-none bg-gray-100 text-gray-900 px-3 py-1 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Branches</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.name}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily/Weekly/Monthly/Yearly Sales Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {" "}
                  {/* Increased mb-4 to mb-8 */}
                  {/* Daily Sales */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Today's Sales
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {formatCurrency(salesReport.dailySales)}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <BarChartIcon className="text-blue-600" size={20} />
                      </div>
                    </div>
                  </div>
                  {/* Weekly Sales */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          This Week
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(salesReport.weeklySales)}
                        </p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <BarChartIcon className="text-green-600" size={20} />
                      </div>
                    </div>
                  </div>
                  {/* Monthly Sales */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          This Month
                        </p>
                        <p className="text-2xl font-bold text-purple-800">
                          {formatCurrency(salesReport.monthlySales)}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <BarChartIcon className="text-purple-600" size={20} />
                      </div>
                    </div>
                  </div>
                  {/* Yearly Sales */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">
                          This Year
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          {formatCurrency(salesReport.yearlySales)}
                        </p>
                      </div>
                      <div className="bg-orange-100 p-2 rounded-full">
                        <BarChartIcon className="text-orange-600" size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bar Chart Section - Added more margin top and bottom */}
                <div className="mt-8 mb-8 h-80">
                  {" "}
                  {/* Increased mt-6 to mt-8 and added mb-8 */}
                  <h3 className="text-md font-semibold mb-4 flex items-center">
                    {" "}
                    {/* Increased mb-2 to mb-4 */}
                    <BarChartIcon className="mr-2" size={18} /> Monthly Sales
                    Breakdown
                  </h3>
                  <div className="w-full h-full">
                    <RechartsResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <RechartsCartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                        />
                        <RechartsXAxis
                          dataKey="name"
                          tick={{ fill: "#6b7280" }}
                          axisLine={{ stroke: "#d1d5db" }}
                        />
                        <RechartsYAxis
                          tick={{ fill: "#6b7280" }}
                          axisLine={{ stroke: "#d1d5db" }}
                          tickFormatter={(value) =>
                            `₱${value.toLocaleString()}`
                          }
                        />
                        <RechartsTooltip
                          formatter={(value, name) => [
                            name === "sales"
                              ? `₱${value.toLocaleString()}`
                              : value,
                            name === "sales" ? "Sales Amount" : "Invoice Count",
                          ]}
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <RechartsLegend />
                        <RechartsBar
                          dataKey="sales"
                          name="Sales Amount"
                          fill="#4f46e5"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                        <RechartsBar
                          dataKey="count"
                          name="Invoice Count"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      </RechartsBarChart>
                    </RechartsResponsiveContainer>
                  </div>
                </div>

                {/* Bottom Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {" "}
                  {/* Added mt-6 */}
                  {/* Total Sales */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">
                      Total Sales
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {formatCurrency(salesReport.totalSales)}
                    </p>
                  </div>
                  {/* Invoice Status */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">
                      Invoice Status
                    </p>
                    <div className="flex justify-between mt-1">
                      <div>
                        <span className="text-green-600 font-bold">
                          {salesReport.paidInvoices}
                        </span>
                        <span className="text-gray-600 text-sm ml-1">Paid</span>
                      </div>
                      <div>
                        <span className="text-yellow-600 font-bold">
                          {salesReport.pendingInvoices}
                        </span>
                        <span className="text-gray-600 text-sm ml-1">
                          Pending
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-800 font-bold">
                          {salesReport.totalInvoices}
                        </span>
                        <span className="text-gray-600 text-sm ml-1">
                          Total
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Quick Actions */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-medium">
                      Quick Actions
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Print Report
                      </button>
                    </div>
                  </div>
                </div>
                {/* View Invoices Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveView("invoices")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                     All Invoices{" "}
                    <ChevronRight className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Invoices Table View - Only invoice content here */}
          {activeView === "invoices" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back to Sales Report Button */}
              <div className="mb-4">
                <button
                  onClick={() => setActiveView("sales")}
                  className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                  <ChevronRight
                    className="mr-1 transform rotate-180"
                    size={16}
                  />{" "}
                  Back to Sales Report
                </button>
              </div>

              {/* Header with Filter Buttons */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center mb-4"
              >
                <h1 className="text-xl font-bold">All Invoices</h1>
                <div
                  className={`flex space-x-2 ${selectedInvoice ? "mr-[350px]" : ""} transition-all duration-300`}
                >
                  <motion.button
                    onClick={() => filterInvoicesByPeriod("week")}
                    className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>This Week</span>
                  </motion.button>
                  <motion.button
                    onClick={() => filterInvoicesByPeriod("month")}
                    className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>This Month</span>
                  </motion.button>
                  <motion.button
                    onClick={() => filterInvoicesByPeriod("year")}
                    className="flex items-center space-x-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>This Year</span>
                  </motion.button>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => filterInvoicesByCustomDate(date)}
                    placeholderText="Pick a date"
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
              </motion.div>

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
                  <div
                    className={`${selectedInvoice ? "w-[calc(100%-350px)]" : "w-full"} transition-all duration-300 pr-4`}
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
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Invoice #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Branch
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Handled By
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInvoices.length > 0 ? (
                            uniqueInvoices.map((invoice, index) => (
                              <motion.tr
                                key={invoice.id}
                                className={`group hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${selectedInvoice?.id === invoice.id ? "bg-[#E3F9E5]" : ""}`}
                                onClick={() => setSelectedInvoice(invoice)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{
                                  backgroundColor: "rgba(243, 244, 246, 0.7)",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                }}
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {invoice.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {invoice.invoiceNumber}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {invoice.branch || "N/A"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {invoice.handledBy || "Staff"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {invoice.dateIssued}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(
                                    invoiceTotalsByCustomer[invoice.name]
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <motion.span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      invoice.paymentStatus === "Paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {invoice.paymentStatus}
                                  </motion.span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                  {/* ... (keep the action buttons as they were) ... */}
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="8"
                                className="px-4 py-6 text-center text-gray-500"
                              >
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
                      <div className="w-[350px] bg-white rounded-lg shadow-md border border-gray-400 p-4 fixed right-4 top-20 h-[calc(100vh-6rem)] flex flex-col">
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

                        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                          <div className="grid grid-cols-2 gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <div>
                              <h3 className="text-md font-semibold mb-2">
                                Customer
                              </h3>
                              <p className="text-gray-700 text-sm">
                                {selectedInvoice.name}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-md font-semibold mb-2">
                                Branch
                              </h3>
                              <p className="text-gray-700 text-sm">
                                {selectedInvoice.branch || "Main"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <div>
                              <h3 className="text-md font-semibold mb-2">
                                Handled By
                              </h3>
                              <p className="text-gray-700 text-sm">
                                {selectedInvoice.handledBy || "Staff"}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-md font-semibold mb-2">
                                Details
                              </h3>
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <span className="text-gray-600">
                                  Invoice #:
                                </span>
                                <span>{selectedInvoice.invoiceNumber}</span>
                                <span className="text-gray-600">Date:</span>
                                <span>{selectedInvoice.dateIssued}</span>
                                <span className="text-gray-600">Status:</span>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    selectedInvoice.paymentStatus === "Paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {selectedInvoice.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Recent Services from all invoices of selected customer */}
                          {selectedInvoice && (
                            <div className="p-4">
                              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                                Recent Services for {selectedInvoice.name}
                              </h3>
                              <div className="space-y-2">
                                {recentServicesForCustomer.map(
                                  (service, index) => (
                                    <motion.div
                                      key={index}
                                      className="border-b pb-2 last:border-0"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <div className="flex justify-between">
                                        <span className="font-medium text-sm text-gray-900">
                                          {service.name}
                                        </span>
                                        <span className="text-sm text-gray-700">
                                          {service.price}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {service.invoiceDate} •{" "}
                                        {service.employee}
                                      </div>
                                    </motion.div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <div className="flex justify-end items-center space-x-4">
                              <div className="w-full sm:w-64 space-y-2 text-sm">
                                <div className="flex justify-between py-1 border-b">
                                  <span className="font-medium">Subtotal:</span>
                                  <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 font-bold">
                                  <span>Total:</span>
                                  <span>₱{subtotal.toFixed(2)}</span>
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
                            {selectedInvoice.paymentStatus === "Pending" && (
                              <button
                                onClick={() =>
                                  handlePaymentStatusUpdate(
                                    selectedInvoice.id,
                                    "Paid"
                                  )
                                }
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors"
                              >
                                Mark as Paid
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
