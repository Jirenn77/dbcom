"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { User, Settings, LogOut, Home, X } from "lucide-react";
import { Menu } from "@headlessui/react";
import { Users, FileText, CreditCard, Package, Layers, ShoppingCart, UserPlus } from "lucide-react";
import { ClipboardList, Factory, ShoppingBag, Folder, Tag } from "lucide-react";
import { BarChart, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Memberships() {
    const [searchQuery, setSearchQuery] = useState("");
    const [memberships, setMemberships] = useState([]);
    const [newMembership, setNewMembership] = useState({ name: "", discount: "", description: "" });
    const [editMembership, setEditMembership] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState(null);
    const [membershipServices, setMembershipServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data for membership services
    const mockServices = [
        { id: 1, name: "Facial Treatment", duration: "60 mins", price: "₱800" },
        { id: 2, name: "Microdermabrasion", duration: "45 mins", price: "₱1000" },
        { id: 3, name: "Chemical Peel", duration: "30 mins", price: "₱790" },
    ];

    const fetchMemberships = async () => {
        try {
            const res = await fetch("http://localhost/API/memberships.php");
            const data = await res.json();

            if (Array.isArray(data)) {
                setMemberships(data);
            } else {
                toast.error("Invalid data format from server.");
                console.error("Expected array, got:", data);
            }
        } catch (error) {
            toast.error("Failed to load memberships.");
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        fetchMemberships();
    }, []);

    const handleSearch = () => {
        toast(`Searching for: ${searchQuery}`);
    };

    const handleAdd = async () => {
        if (!newMembership.name || !newMembership.discount || !newMembership.description) {
            toast.error("All fields are required.");
            return;
        }
        try {
            const res = await fetch("http://localhost/API/memberships.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMembership),
            });
            const data = await res.json();
            setMemberships([...memberships, data]);
            setNewMembership({ name: "", discount: "", description: "" });
            setIsModalOpen(false);
            toast.success("Membership added successfully.");
        } catch {
            toast.error("Failed to add membership.");
        }
    };


    const handleEdit = (id) => {
        const membershipToEdit = memberships.find((m) => m.id === id);
        setEditMembership({ ...membershipToEdit });
    };

    const handleSaveEdit = async () => {
        if (!editMembership.name || !editMembership.discount || !editMembership.description) {
            toast.error("All fields are required.");
            return;
        }

        try {
            const res = await fetch(`http://localhost/API/memberships.php/${editMembership.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editMembership), // includes status
            });

            const updated = await res.json();

            setMemberships((prev) =>
                prev.map((m) => (m.id === updated.id ? updated : m))
            );

            setEditMembership(null);
            toast.success("Membership updated successfully.");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update membership.");
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    const handleToggleActive = async (id) => {
        try {
            const membershipToUpdate = memberships.find((m) => m.id === id);
            const newStatus = membershipToUpdate.status === "active" ? "inactive" : "active";

            // Update state optimistically
            const updatedMemberships = memberships.map((membership) =>
                membership.id === id ? { ...membership, status: newStatus } : membership
            );
            setMemberships(updatedMemberships);

            // Update backend
            await fetch(`http://localhost/API/memberships.php/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...membershipToUpdate, status: newStatus }),
            });

            toast.success(`Membership ${newStatus === "active" ? 'activated' : 'deactivated'} successfully.`);
        } catch (error) {
            toast.error("Failed to update membership status.");
            console.error(error);
        }
    };

    const handleRowClick = (membership) => {
        setSelectedMembership(membership);
        setMembershipServices(mockServices);
    };

    const closeMembershipDetails = () => {
        setSelectedMembership(null);
    };

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

    const scaleUp = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
        exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
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
                        R
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
                        className="p-6 bg-white rounded-lg shadow-lg border border-gray-400"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >

                        {/* Table */}
                        <div className="w-full">
                            <table className="w-full border border-gray-200 mb-4 table-fixed">
                                <thead>
                                    <tr className="bg-green-200">
                                        <th className="border px-4 py-2 text-left w-1/5">Membership Name</th>
                                        <th className="border px-4 py-2 text-left w-1/6">Discount</th>
                                        <th className="border px-4 py-2 text-left w-2/5">Description</th>
                                        <th className="border px-4 py-2 text-left w-1/6">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(memberships) && memberships.map((membership) => (
                                        <motion.tr
                                            key={membership.id}
                                            className="border-b hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleRowClick(membership)}
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <td className="border px-4 py-2 truncate" title={membership.name}>{membership.name}</td>
                                            <td className="border px-4 py-2">{membership.discount}</td>
                                            <td className="border px-4 py-2 truncate" title={membership.description}>{membership.description}</td>
                                            <td className="border px-4 py-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${membership.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-200 text-gray-800'
                                                        }`}
                                                >
                                                    {membership.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Add Membership Modal */}
                    <AnimatePresence>
                        {isModalOpen && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
                                    variants={slideUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg">Add New Membership</h3>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block font-medium mb-1">Membership Name</label>
                                            <input
                                                type="text"
                                                placeholder="Membership Name"
                                                value={newMembership.name}
                                                onChange={(e) => setNewMembership({ ...newMembership, name: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Discount </label>
                                            <input
                                                type="text"
                                                placeholder="Discount %"
                                                value={newMembership.discount}
                                                onChange={(e) => setNewMembership({ ...newMembership, discount: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1">Description</label>
                                            <textarea
                                                placeholder="Description"
                                                value={newMembership.description}
                                                onChange={(e) => setNewMembership({ ...newMembership, description: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-4">
                                            <motion.button
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                onClick={handleAdd}
                                                className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Add Membership
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                   

                    {/* Membership Details Modal */}
                    <AnimatePresence>
                        {selectedMembership && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                                    variants={scaleUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-bold">{selectedMembership.name} Membership Details</h2>
                                        <motion.button
                                            onClick={closeMembershipDetails}
                                            className="text-gray-500 hover:text-gray-700"
                                            whileHover={{ rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X size={24} />
                                        </motion.button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <motion.div
                                            className="bg-gray-50 p-4 rounded-lg"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <h3 className="font-bold mb-3 text-lg">Membership Information</h3>
                                            <div className="space-y-2">
                                                <p><span className="font-semibold">Discount:</span> {selectedMembership.discount}</p>
                                                <div className="flex items-center">
                                                    <span className="font-semibold">Status:</span>
                                                    <motion.button
                                                        onClick={() => handleToggleActive(selectedMembership.id)}
                                                        className={`ml-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${selectedMembership.status === 'active'
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                            }`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {selectedMembership.status === 'active' ? 'Active' : 'Inactive'}
                                                    </motion.button>
                                                </div>
                                                <p><span className="font-semibold">Created:</span> {new Date().toLocaleDateString()}</p>
                                                <p><span className="font-semibold">Duration:</span> {selectedMembership.duration} months</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="bg-gray-50 p-4 rounded-lg"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h3 className="font-bold mb-3 text-lg">Description</h3>
                                            <p>{selectedMembership.description}</p>
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        className="mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h3 className="font-bold mb-3 text-lg">Included Services</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border border-green-400">
                                                <thead>
                                                    <tr className="bg-green-300">
                                                        <th className="border px-4 py-2 text-left">Service Name</th>
                                                        <th className="border px-4 py-2 text-left">Duration</th>
                                                        <th className="border px-4 py-2 text-left">Price</th>
                                                        <th className="border px-4 py-2 text-left">Discount Applied</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {membershipServices.map((service, index) => (
                                                        <motion.tr
                                                            key={service.id}
                                                            className="border-b hover:bg-gray-50"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 * index }}
                                                        >
                                                            <td className="border px-4 py-2">{service.name}</td>
                                                            <td className="border px-4 py-2">{service.duration}</td>
                                                            <td className="border px-4 py-2">{service.price}</td>
                                                            <td className="border px-4 py-2">
                                                                {selectedMembership.discount} (${(parseFloat(service.price.replace('$', '')) * (1 - selectedMembership.discount / 100)).toFixed(2)})
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="bg-gray-50 p-4 rounded-lg"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className="font-bold mb-3 text-lg">Membership Duration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p><span className="font-semibold">Start Date:</span> {new Date().toLocaleDateString()}</p>
                                                <p><span className="font-semibold">End Date:</span> {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p><span className="font-semibold">Days Remaining:</span> 365</p>
                                                <p><span className="font-semibold">Renewal Option:</span> Automatic</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="mt-6 flex justify-end"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <motion.button
                                            onClick={closeMembershipDetails}
                                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Close
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}