"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { Toaster, toast } from "sonner";
import { Dialog } from "@headlessui/react";
import { Menu } from "@headlessui/react";
import { BarChart } from "lucide-react";
import { User, Settings, LogOut,Tag } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, UserPlus } from "lucide-react";

const navLinks = [
    { href: "/servicess", label: "Services", icon: Layers },
    { href: "/price-list", label: "Price List", icon: FileText },
    { href: "/items", label: "Item Groups", icon: Package },
];

const salesLinks = [
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/payments", label: "Payments", icon: CreditCard },
];

export default function Dashboard() {
    const [upcomingAppointments, setUpcomingAppointments] = useState(0);
    const [productDetails, setProductDetails] = useState({});
    const [inventorySummary, setInventorySummary] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {

        const fetchProductDetails = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost/API/getProducts.php?action=get_product_details");
                const data = await res.json();

                setProductDetails({
                    lowStockItems: data.lowStockItems || 0,
                    allItemsGroups: data.allItemsGroups || 0,
                    allItems: data.allItems || 0,
                });
            } catch (error) {
                toast.error("Error fetching product details.");
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchInventorySummary = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost/API/getInventory.php?action=get_inventory_summary");
                const data = await res.json();

                setInventorySummary({
                    quantityInHand: data.quantity_in_hand || 0,
                    quantityToBeReceived: data.quantity_to_be_received || 0,
                });
            } catch (error) {
                toast.error("Error fetching inventory summary.");
                console.error("Error fetching inventory summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
        fetchInventorySummary();

        const interval = setInterval(() => {
            fetchProductDetails();
            fetchInventorySummary();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            const res = await fetch(`http://localhost/API/search.php?q=${searchQuery}`);
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
                        className="px-3 py-1.5 bg-[#5BBF5B] rounded-lg hover:bg-[#4CAF4C] text-gray-800 text-md"
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
                        <div className="bg-[#6CAE5E] absolute top-12 right-0 text-white shadow-lg rounded-lg w-48 p-2 flex flex-col animate-fade-in text-start">
                            <Link href="/acc-settings">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#467750] rounded w-full justify-start">
                                    <User size={16} /> Edit Profile
                                </button>
                            </Link>
                            <Link href="/settings">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#467750] rounded w-full justify-start">
                                    <Settings size={16} /> Settings
                                </button>
                            </Link>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded justify-start" onClick={handleLogout}>
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
                                { href: "/membership", label: "Memberships", icon: <UserPlus size={20} /> }, // or <Users />
                                { href: "/items", label: "Beauty Deals", icon: <Tag size={20} /> },
                                { href: "/serviceorder", label: "Service Orders", icon: <ClipboardList size={20} /> },
                                { href: "/servicegroup", label: "Service Groups", icon: <Folder size={20} /> }, // or <Layers />
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
                                { href: "/payments", label: "Payments", icon: <CreditCard size={20} /> },
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

                    {/* Inventory Menu */}
                    <Menu as="div" className="relative w-full px-4 mt-4">
                        <Menu.Button className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center">
                            <Package className="mr-2" size={20} /> Inventory ▾
                        </Menu.Button>
                        <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
                            {[
                                { href: "/products", label: "Products", icon: <Package size={20} /> },
                                { href: "/categories", label: "Product Category", icon: <Folder size={20} /> },
                                { href: "/stocks", label: "Stock Levels", icon: <ClipboardList size={20} /> },
                                { href: "/suppliers", label: "Supplier Management", icon: <Factory size={20} /> },
                                { href: "/purchase", label: "Purchase Order", icon: <ShoppingBag size={20} /> },
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
                    <div className="flex justify-end mt-6 mb-2">
                        <div className="flex space-x-2">
                            <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                This day
                            </button>
                            <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                This week
                            </button>
                            <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                This month
                            </button>
                            <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                This year
                            </button>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Ordered Services */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-400">
                            <h2 className="text-lg font-bold mb-4">Top Ordered Services</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Haircut</span>
                                    <span className="font-bold">7</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Facial Spa</span>
                                    <span className="font-bold">4</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Foot Spa</span>
                                    <span className="font-bold">2</span>
                                </div>
                            </div>
                        </div>

                        {/* Revenue by Service */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-400">
                            <h2 className="text-lg font-bold mb-4">Revenue by Service</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Haircut</span>
                                    <span className="font-bold">P500</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Facial Spa</span>
                                    <span className="font-bold">P1,000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Foot Spa</span>
                                    <span className="font-bold">P800</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branches and Revenue Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-6">
                        {/* Branches List */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-400">
                            <h2 className="text-lg font-bold mb-4">Branches</h2>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    <span>Pabayo</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    <span>Gingoog City</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    <span>Patag</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    <span>Bukidnon</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Revenue Distribution with Pie Chart */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-400">
                            <h2 className="text-lg font-bold mb-4">Total Revenue Distribution</h2>
                            <div className="h-64">
                                {/* Pie Chart Implementation */}
                                <div className="relative w-full h-full">
                                    {/* Pie Chart SVG */}
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        {/* Boldon - 25% */}
                                        <path
                                            d="M50,50 L50,0 A50,50 0 0,1 85,15 Z"
                                            fill="#3B82F6"
                                            className="hover:opacity-90 transition-opacity"
                                        />
                                        {/* Patag - 25% */}
                                        <path
                                            d="M50,50 L85,15 A50,50 0 0,1 100,50 Z"
                                            fill="#10B981"
                                            className="hover:opacity-90 transition-opacity"
                                        />
                                        {/* Dayan - 27% */}
                                        <path
                                            d="M50,50 L100,50 A50,50 0 0,1 85,85 Z"
                                            fill="#F59E0B"
                                            className="hover:opacity-90 transition-opacity"
                                        />
                                        {/* Gingoog City - 13% */}
                                        <path
                                            d="M50,50 L85,85 A50,50 0 0,1 50,100 Z"
                                            fill="#EF4444"
                                            className="hover:opacity-90 transition-opacity"
                                        />
                                        {/* Remaining 10% (if any) */}
                                        <path
                                            d="M50,50 L50,100 A50,50 0 0,1 50,0 Z"
                                            fill="#6B7280"
                                            className="hover:opacity-90 transition-opacity"
                                        />
                                    </svg>


                                    {/* Legend */}
                                    <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 text-xs">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                                            <span>Pabayo 25%</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                                            <span>Gingoog City 25%</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                                            <span>Patag 27%</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                                            <span>Bukidnon 13%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
