"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { Menu } from "@headlessui/react";
import { BarChart, BarChart3 } from "lucide-react";
import { User, Settings, LogOut, Tag } from "lucide-react";
import { Folder, ClipboardList, Factory, Calendar } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, UserPlus } from "lucide-react";

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [period, setPeriod] = useState('day');
    const [customDate, setCustomDate] = useState(new Date());
    const [dateRange, setDateRange] = useState({
        start: new Date(),
        end: new Date()
    });

    const [dashboardData, setDashboardData] = useState({
        topServices: [],
        revenueByService: [],
        branches: [],
        revenueDistribution: [],
        loading: true
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setDashboardData(prev => ({ ...prev, loading: true }));

            const params = new URLSearchParams({
                action: 'dashboard',
                period: period,
            });

            if (period === 'custom') {
                params.append('start_date', dateRange.start.toISOString().slice(0, 10));
                params.append('end_date', dateRange.end.toISOString().slice(0, 10));
            }

            try {
                const response = await fetch(`http://localhost/API/home.php?${params.toString()}`);
                const data = await response.json();

                setDashboardData({
                    topServices: data.top_services || [],
                    revenueByService: data.revenue_by_service || [],
                    branches: data.branches || [],
                    revenueDistribution: data.revenue_distribution || [],
                    loading: false
                });
            } catch (error) {
                console.error("Error:", error);
                setDashboardData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchDashboardData();
    }, [period, dateRange]); // Add dateRange to dependencies

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        const today = new Date();
        let startDate = new Date(today);
        let endDate = new Date(today);

        if (newPeriod === 'day') {
            // Today only
            startDate = new Date(today);
            endDate = new Date(today);
        } else if (newPeriod === 'week') {
            // Current week (Monday to Sunday)
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(today.setDate(diff));
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else if (newPeriod === 'month') {
            // Current month
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (newPeriod === 'year') {
            // Current year
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
        }

        setDateRange({ start: startDate, end: endDate });
    };

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            const res = await fetch(`http://localhost/API/home.php?q=${searchQuery}`);
            const data = await res.json();
            console.log("Search Results:", data);
            toast(`Searching for: ${searchQuery}`);
        }
    };

    const handleAddUser = () => {
        toast("Add User functionality triggered.");
        console.log("Add User clicked");
    };

    const handleAddService = () => {
        toast("Add Service functionality triggered.");
        console.log("Add Service clicked");
    };

    const handleAddServiceGroup = () => {
        toast("Add Service Item Group functionality triggered.");
        console.log("Add Service Item Group clicked");
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col h-screen bg-white text-gray-900">
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
                        A
                    </div>
                    {isProfileOpen && (
                        <div className="bg-green-500 absolute top-12 right-0 text-white shadow-lg rounded-lg w-48 p-2 flex flex-col animate-fade-in text-start">
                            <Link href="/edit-profile">
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
                            <img src="/path-to-your-image/2187693(1)(1).png" alt="Lizly Logo" className="w-10 h-10 object-contain" />
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

                <main className="flex-1 p-8 max-w-screen-xl mx-auto ml-64 bg-white min-h-screen">
                    {/* Time Period Filter Buttons */}
                    <div className="flex justify-end mt-6 mb-2 space-x-4">
                        <div className="flex space-x-2">
                            {['day', 'week', 'month', 'year', 'custom'].map((p) => (
                                <motion.button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`text-xs px-3 py-1 rounded transition ${period === p
                                        ? 'bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {p === 'custom' ? 'Custom Range' : `This ${p}`}
                                </motion.button>
                            ))}
                        </div>

                        {/* Custom Date Filter - Only show when custom is selected */}
                        {period === 'custom' && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={dateRange.start.toISOString().slice(0, 10)}
                                    onChange={(e) => setDateRange(prev => ({
                                        ...prev,
                                        start: new Date(e.target.value)
                                    }))}
                                    className="border px-3 py-1 rounded"
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    value={dateRange.end.toISOString().slice(0, 10)}
                                    onChange={(e) => setDateRange(prev => ({
                                        ...prev,
                                        end: new Date(e.target.value)
                                    }))}
                                    min={dateRange.start.toISOString().slice(0, 10)}
                                    className="border px-3 py-1 rounded"
                                />
                            </div>
                        )}
                    </div>

                    {/* Services Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Ordered Services */}
                        <motion.div
                            className="p-6 bg-white rounded-lg shadow-md border border-gray-400"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-bold mb-4">Top Ordered Services</h2>
                            {dashboardData.loading ? (
                                <div className="flex justify-center items-center h-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : dashboardData.topServices.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.topServices.map((service, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex justify-between items-center"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <span>{service.name}</span>
                                            <span className="font-bold">{service.count}</span>
                                        </motion.div>
                                    ))}

                                    {/* Optional label if this is fallback data (e.g., all fixed values) */}
                                    {dashboardData.topServices.every(s => [15, 12, 10, 8, 7].includes(s.count)) && (
                                        <p className="text-xs text-gray-400 italic mt-2">* Sample data shown</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No top services found</p>
                            )}
                        </motion.div>

                        {/* Revenue by Service */}
                        <motion.div
                            className="p-6 bg-white rounded-lg shadow-md border border-gray-400"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h2 className="text-xl font-bold mb-4">Service Revenue</h2>
                            {dashboardData.loading ? (
                                <div className="flex justify-center items-center h-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : dashboardData.revenueByService.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.revenueByService.map((service, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex justify-between items-center"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <span>{service.name}</span>
                                            <span className="font-bold">₱{service.revenue.toLocaleString()}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No data available</p>
                            )}
                        </motion.div>
                    </div>

                    {/* Branches and Revenue Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-6">
                        {/* Branches List */}
                        <motion.div
                            className="p-6 bg-white rounded-lg shadow-md border border-gray-400"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">Branches</h2>
                            {dashboardData.loading ? (
                                <div className="flex justify-center items-center h-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : dashboardData.branches.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.branches.map((branch, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center space-y-2"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: branch.color_code || '#3B82F6' }}
                                            ></span>
                                            <span>{branch.name}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No branches found</p>
                            )}
                        </motion.div>

                        {/* Total Revenue Distribution with Pie Chart */}
                        <motion.div
                            className="p-6 bg-white rounded-lg shadow-md border border-gray-400"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h2 className="text-xl font-bold mb-4">Total Revenue Distribution</h2>
                            {dashboardData.loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : dashboardData.revenueDistribution.length > 0 ? (
                                <div className="flex flex-col items-center h-50">
                                    {/* Animated Pie chart */}
                                    <motion.div
                                        className="relative w-50 h-50"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                                    >
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            {dashboardData.revenueDistribution.reduce((acc, branch, index) => {
                                                const startAngle = acc.currentAngle;
                                                const endAngle = startAngle + (branch.percentage / 100) * 360;
                                                const largeArcFlag = branch.percentage > 50 ? 1 : 0;

                                                const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                                                const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                                                const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                                                const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                                                acc.paths.push(
                                                    <motion.path
                                                        key={index}
                                                        d={`M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                                                        fill={branch.color_code || '#3B82F6'}
                                                        className="hover:opacity-90 transition-opacity"
                                                        initial={{ pathLength: 0, opacity: 0 }}
                                                        animate={{ pathLength: 1, opacity: 1 }}
                                                        transition={{
                                                            duration: 1,
                                                            delay: index * 0.2,
                                                            ease: "easeInOut"
                                                        }}
                                                        whileHover={{ scale: 1.05 }}
                                                    />
                                                );

                                                acc.currentAngle = endAngle;
                                                return acc;
                                            }, { paths: [], currentAngle: 0 }).paths}
                                        </svg>
                                    </motion.div>

                                    {/* Labels under pie */}
                                    <motion.div
                                        className="mt-4 flex flex-wrap justify-center gap-3 text-xs"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        {dashboardData.revenueDistribution.map((branch, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full mr-1"
                                                    style={{ backgroundColor: branch.color_code || '#3B82F6' }}
                                                ></span>
                                                <span>{branch.branch_name} {branch.percentage}%</span>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-64 text-gray-500">
                                    No revenue data available
                                </div>
                            )}
                        </motion.div>
                    </div>
                </main>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Dialog
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Dialog.Panel className="bg-gradient-to-b from-[#77DD77] to-[#56A156] text-gray-900 p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <Dialog.Title id="modal-title" className="text-lg font-bold text-gray-900 mb-4">Select Option</Dialog.Title>
                        <div id="modal-description" className="grid grid-cols-2 gap-6">
                            {/* General Section */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="text-xl">📊</div>
                                    <h2 className="font-semibold text-[#FFFFFF]-700">General</h2>
                                </div>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={handleAddUser}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Add Users
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleAddService}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Services
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleAddServiceGroup}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Services Item Groups
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Sales Section */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="text-xl">🛒</div>
                                    <h2 className="font-semibold text-[#FFFFFF]-700">Sales</h2>
                                </div>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => toast("Customers functionality triggered.")}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Customers
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => toast("Invoices functionality triggered.")}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Invoices
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => toast("Payments functionality triggered.")}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Payments
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
                        >
                            Close
                        </button>
                    </Dialog.Panel>
                </Dialog>
            )}
        </div>
    );
}
