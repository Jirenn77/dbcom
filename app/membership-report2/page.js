"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { User, Settings, LogOut, Home, X, BarChart3 } from "lucide-react";
import { Menu } from "@headlessui/react";
import { Users, FileText, CreditCard, Package, Layers, ShoppingCart, UserPlus } from "lucide-react";
import { ClipboardList, Factory, ShoppingBag, Folder, Tag } from "lucide-react";
import { BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MembershipExpirationReport() {
    const [expiringMemberships, setExpiringMemberships] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [customerMemberships, setCustomerMemberships] = useState([]);
    const [daysThreshold, setDaysThreshold] = useState(30);
    const [customerFilter, setCustomerFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const slideUp = {
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
        exit: { y: 50, opacity: 0, transition: { duration: 0.2 } }
    };

    // Fetch expiring memberships
    const fetchExpiringMemberships = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost/API/memberships.php?expiring=${daysThreshold}`);
            const data = await res.json();
            setExpiringMemberships(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load expiring memberships.");
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch customers with filter
    const fetchCustomers = async (filter = 'all') => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost/API/customers.php?filter=${filter}`);
            if (!response.ok) throw new Error('Failed to fetch customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            toast.error("Failed to load customers.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch customer memberships
    const fetchCustomerMemberships = async () => {
        try {
            const response = await fetch('http://localhost/API/members.php');
            if (!response.ok) throw new Error('Failed to fetch customer memberships');
            const data = await response.json();
            setCustomerMemberships(data);
        } catch (error) {
            toast.error("Failed to load customer memberships.");
            console.error(error);
        }
    };

    // Fetch detailed customer information
    const fetchCustomerDetails = async (customerId) => {
        setIsLoadingDetails(true);
        try {
            const [customerRes, membershipRes] = await Promise.all([
                fetch(`http://localhost/API/customers.php?customerId=${customerId}`),
                fetch(`http://localhost/API/members.php?customer_id=${customerId}`)
            ]);

            const customerData = await customerRes.json();
            const membershipData = await membershipRes.json();

            setSelectedCustomer({
                ...customerData,
                id: customerData.id,
                first_name: customerData.first_name || customerData.name?.split(' ')[0] || '',
                last_name: customerData.last_name || customerData.name?.split(' ')[1] || '',
                contact: customerData.contact || customerData.phone || '',
                email: customerData.email,
                address: customerData.address,
                birthday: customerData.birthday,
                customerId: customerData.customerId || customerData.id,
                membership: membershipData.length > 0 ? membershipData[0].type : "None",
                membershipDetails: membershipData.length > 0 ? membershipData[0] : null,
                transactions: customerData.transactions || [],
                join_date: customerData.join_date,
                membershipData: membershipData
            });
        } catch (error) {
            toast.error("Failed to load customer details.");
            console.error("Error fetching customer details:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCustomerRowClick = async (customerId) => {
        await fetchCustomerDetails(customerId);
        setIsDetailsOpen(true);
    };

    const handleRenew = async (customerId, membershipId) => {
        try {
            const response = await fetch(`http://localhost/API/members.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    membership_id: membershipId,
                    action: 'renew'
                })
            });

            if (!response.ok) throw new Error('Failed to renew membership');

            toast.success("Membership renewed successfully!");
            fetchExpiringMemberships();
            fetchCustomers(customerFilter);
            fetchCustomerMemberships();
        } catch (error) {
            toast.error("Failed to renew membership.");
            console.error(error);
        }
    };

    const handleSendReminder = async (customerId) => {
        try {
            await fetch(`http://localhost/API/memberships.php/remind/${customerId}`, {
                method: 'POST'
            });
            toast.success("Reminder sent successfully!");
        } catch (error) {
            toast.error("Failed to send reminder.");
            console.error(error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return 'N/A';
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatCurrency = (amount) => {
    if (!amount) return 'N/A';

    // If it's a string with commas, convert to number
    if (typeof amount === 'string') {
        amount = Number(amount.replace(/,/g, ''));
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};


    useEffect(() => {
        fetchExpiringMemberships();
        fetchCustomers(customerFilter);
        fetchCustomerMemberships();
    }, [daysThreshold, customerFilter]);

    const handleLogout = () => {
        // Clear any authentication tokens or user data here
        toast.success("Logged out successfully!");
        // Redirect to login page or home page
        window.location.href = "/login"; // Adjust the path as needed
    }

    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = () => {
        // Implement search functionality here
        toast.info(`Searching for: ${searchQuery}`);
        // You can filter the expiringMemberships based on the searchQuery
        // For now, just log it
        console.log("Search query:", searchQuery);
    };

    return (
        <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <header className="flex items-center justify-between bg-[#89C07E] text-white p-4 w-full h-16 pl-64 relative">
                <div className="flex items-center space-x-4">
                    {/* Home icon removed from here */}
                </div>

                <div className="flex items-center space-x-4 flex-grow justify-center">
                    <motion.input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
                        whileFocus={{ scale: 1.02 }}
                    />
                    <motion.button
                        onClick={handleSearch}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Search
                    </motion.button>
                </div>

                <div className="flex items-center space-x-4 relative">
                    <motion.div
                        className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        A
                    </motion.div>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                className="bg-green-500 absolute top-12 right-0 text-white shadow-lg rounded-lg w-48 p-2 flex flex-col text-start"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={fadeIn}
                            >
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
                            </motion.div>
                        )}
                    </AnimatePresence>
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

                <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
                    <motion.div
                        className="p-6 bg-white rounded-lg shadow-lg border border-gray-400"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Membership Management</h2>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <label htmlFor="customerFilter" className="mr-2 font-medium">Customer Filter:</label>
                                        <select
                                            id="customerFilter"
                                            value={customerFilter}
                                            onChange={(e) => setCustomerFilter(e.target.value)}
                                            className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="all">All Customers</option>
                                            <option value="active">Active Memberships</option>
                                            <option value="expiring">Expiring Soon</option>
                                            <option value="expired">Expired</option>
                                            <option value="non_member">Non-Members</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <label htmlFor="daysThreshold" className="mr-2 font-medium">Expiring Within:</label>
                                        <select
                                            id="daysThreshold"
                                            value={daysThreshold}
                                            onChange={(e) => setDaysThreshold(Number(e.target.value))}
                                            className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="7">7 days</option>
                                            <option value="14">14 days</option>
                                            <option value="30">30 days</option>
                                            <option value="60">60 days</option>
                                            <option value="90">90 days</option>
                                        </select>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => {
                                        fetchExpiringMemberships();
                                        fetchCustomers(customerFilter);
                                        fetchCustomerMemberships();
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Refresh
                                </motion.button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 mb-4">
                                    <thead>
                                        <tr className="bg-green-200">
                                            <th className="border px-2 py-2 text-left">Customer</th>
                                            <th className="border px-2 py-2 text-left">Contact</th>
                                            <th className="border px-2 py-2 text-left">Membership</th>
                                            <th className="border px-2 py-2 text-left">Coverage</th>
                                            <th className="border px-2 py-2 text-left">Remaining</th>
                                            <th className="border px-2 py-2 text-left">Status</th>
                                            <th className="border px-2 py-2 text-left">Expires</th>
                                            <th className="border px-2 py-2 text-left">Days Left</th>
                                            <th className="border px-2 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.length > 0 ? (
                                            customers.map((customer) => {
                                                const membership = customerMemberships.find(m => m.customer_id === customer.id);
                                                return (
                                                    <motion.tr
                                                        key={customer.id}
                                                        className="border-b hover:bg-gray-50"
                                                        whileHover={{ backgroundColor: "#f9fafb" }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <td className="border px-2 py-2">
                                                            <div
                                                                className="font-medium text-blue-600 hover:underline cursor-pointer text-sm"
                                                                onClick={() => handleCustomerRowClick(customer.id)}
                                                            >
                                                                {customer.first_name || customer.name?.split(' ')[0]} {customer.last_name || customer.name?.split(' ')[1]}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{customer.email}</div>
                                                        </td>
                                                        <td className="border px-2 py-2 text-sm">
                                                            {customer.phone || customer.contact || 'N/A'}
                                                        </td>
                                                        <td className="border px-2 py-2 text-sm">
                                                            {membership?.type || 'None'}
                                                        </td>
                                                        <td className="border px-2 py-2 text-sm">
                                                            {membership ? formatCurrency(membership.coverage) : 'N/A'}
                                                        </td>
                                                        <td className="border px-2 py-2 text-sm">
                                                            {membership ? formatCurrency(membership.remaining_balance) : 'N/A'}
                                                        </td>
                                                        <td className="border px-2 py-2">
                                                            {!membership ? (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Non-Member</span>
                                                            ) : membership.expire_date && new Date(membership.expire_date) < new Date() ? (
                                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expired</span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                                                            )}
                                                        </td>
                                                        <td className="border px-2 py-2 text-sm">
                                                            {membership?.expire_date ? formatDate(membership.expire_date) : 'N/A'}
                                                        </td>
                                                        <td className="border px-2 py-2 text-sm">
                                                            {membership?.expire_date ? calculateDaysRemaining(membership.expire_date) : 'N/A'}
                                                        </td>
                                                        <td className="border px-2 py-2">
                                                            <div className="flex flex-col space-y-1">
                                                                {membership && (
                                                                    <>
                                                                        <motion.button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleSendReminder(customer.id);
                                                                            }}
                                                                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs w-full"
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                        >
                                                                            Remind
                                                                        </motion.button>
                                                                        <motion.button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRenew(customer.id, membership.id);
                                                                            }}
                                                                            className="px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs w-full"
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                        >
                                                                            Renew
                                                                        </motion.button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="border px-4 py-6 text-center text-gray-500">
                                                    No customers found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Customer Details Modal */}
                    <AnimatePresence>
                        {isDetailsOpen && selectedCustomer && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                                    variants={slideUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-bold">
                                            {selectedCustomer.first_name} {selectedCustomer.last_name}'s Details
                                        </h2>
                                        <motion.button
                                            onClick={() => setIsDetailsOpen(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                            whileHover={{ rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X size={24} />
                                        </motion.button>
                                    </div>

                                    {isLoadingDetails ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <motion.div
                                                    className="bg-gray-50 p-4 rounded-lg"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <h3 className="font-bold mb-3 text-lg">Personal Information</h3>
                                                    <div className="space-y-2">
                                                        <p><span className="font-semibold">Name:</span> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                                                        <p><span className="font-semibold">Email:</span> {selectedCustomer.email || 'N/A'}</p>
                                                        <p><span className="font-semibold">Phone:</span> {selectedCustomer.contact || 'N/A'}</p>
                                                        <p><span className="font-semibold">Address:</span> {selectedCustomer.address || 'N/A'}</p>
                                                        <p><span className="font-semibold">Birthday:</span> {selectedCustomer.birthday ? formatDate(selectedCustomer.birthday) : 'N/A'}</p>
                                                        <p><span className="font-semibold">Member Since:</span> {selectedCustomer.join_date ? formatDate(selectedCustomer.join_date) : 'N/A'}</p>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    className="bg-gray-50 p-4 rounded-lg"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <h3 className="font-bold mb-3 text-lg">Membership Information</h3>
                                                    {selectedCustomer.membershipData?.length > 0 ? (
                                                        selectedCustomer.membershipData.map((membership) => (
                                                            <div key={membership.id} className="space-y-2 mb-4 border-b pb-4">
                                                                <p><span className="font-semibold">Plan:</span> {membership.type}</p>
                                                                <p><span className="font-semibold">Coverage:</span> {formatCurrency(membership.coverage)}</p>
                                                                <p><span className="font-semibold">Remaining Balance:</span> {formatCurrency(membership.remaining_balance)}</p>
                                                                <p><span className="font-semibold">Registered:</span> {formatDate(membership.date_registered)}</p>
                                                                <p><span className="font-semibold">Expiration:</span> {formatDate(membership.expire_date)}</p>
                                                                <p><span className="font-semibold">Days Remaining:</span> {calculateDaysRemaining(membership.expire_date)}</p>
                                                                <p><span className="font-semibold">Status:</span>
                                                                    {new Date(membership.expire_date) < new Date() ? (
                                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">Expired</span>
                                                                    ) : (
                                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-gray-500">No active memberships</div>
                                                    )}
                                                </motion.div>
                                            </div>

                                            {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 && (
                                                <motion.div
                                                    className="bg-gray-50 p-4 rounded-lg mb-6"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <h3 className="font-bold mb-3 text-lg">Recent Transactions</h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-200">
                                                                    <th className="border px-3 py-2 text-left text-sm">Date</th>
                                                                    <th className="border px-3 py-2 text-left text-sm">Service</th>
                                                                    <th className="border px-3 py-2 text-left text-sm">Amount</th>
                                                                    <th className="border px-3 py-2 text-left text-sm">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedCustomer.transactions.slice(0, 5).map((transaction, index) => (
                                                                    <tr key={index}>
                                                                        <td className="border px-3 py-2 text-sm">{transaction.date ? formatDate(transaction.date) : 'N/A'}</td>
                                                                        <td className="border px-3 py-2 text-sm">{transaction.service || 'N/A'}</td>
                                                                        <td className="border px-3 py-2 text-sm">{formatCurrency(transaction.amount)}</td>
                                                                        <td className="border px-3 py-2 text-sm">
                                                                            <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-gray-100 text-gray-800'
                                                                                }`}>
                                                                                {transaction.status || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <motion.div
                                                className="flex justify-end space-x-4"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {selectedCustomer.membershipData?.length > 0 && (
                                                    <>
                                                        <motion.button
                                                            onClick={() => handleSendReminder(selectedCustomer.id)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Send Reminder
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => handleRenew(
                                                                selectedCustomer.id,
                                                                selectedCustomer.membershipData[0].id
                                                            )}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Renew Membership
                                                        </motion.button>
                                                    </>
                                                )}
                                                <motion.button
                                                    onClick={() => setIsDetailsOpen(false)}
                                                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Close
                                                </motion.button>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}


