"use client";

import { useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { User, Settings, LogOut, Home } from "lucide-react";
import { Menu } from "@headlessui/react";
import { Users, FileText, CreditCard, Package, Layers, ShoppingCart, UserPlus } from "lucide-react";
import { ClipboardList, Factory, ShoppingBag, Folder,Tag } from "lucide-react";
import { BarChart } from "lucide-react";

export default function Memberships() {
    const [searchQuery, setSearchQuery] = useState("");
    const [memberships, setMemberships] = useState([
        { id: 1, name: "VIP", discount: "50%", description: "Priority services and bigger discounts" },
        { id: 2, name: "Standard", discount: "30%", description: "Affordable benefits for loyal clients" },
    ]);
    const [newMembership, setNewMembership] = useState({ name: "", discount: "", description: "" });
    const [editMembership, setEditMembership] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSearch = () => {
        toast(`Searching for: ${searchQuery}`);
    };

    const handleAdd = () => {
        if (!newMembership.name || !newMembership.discount || !newMembership.description) {
            toast.error("All fields are required.");
            return;
        }
        setMemberships([...memberships, { ...newMembership, id: Date.now() }]);
        setNewMembership({ name: "", discount: "", description: "" });
        toast.success("Membership added successfully.");
    };

    const handleDelete = (id) => {
        setMemberships(memberships.filter((m) => m.id !== id));
        toast.success("Membership deleted successfully.");
    };

    const handleEdit = (id) => {
        const membershipToEdit = memberships.find((m) => m.id === id);
        setEditMembership({ ...membershipToEdit });
    };

    const handleSaveEdit = () => {
        if (!editMembership.name || !editMembership.discount || !editMembership.description) {
            toast.error("All fields are required.");
            return;
        }
        setMemberships((prev) =>
            prev.map((m) => (m.id === editMembership.id ? editMembership : m))
        );
        setEditMembership(null);
        toast.success("Membership updated successfully.");
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    const handleToggleActive = (id) => {
        const updatedMemberships = memberships.map((membership) =>
            membership.id === id
                ? { ...membership, isActive: !membership.isActive }
                : membership
        );
        setMemberships(updatedMemberships);
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
                        <Link href="/home2x" passHref>
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
                                { href: "/membership2", label: "Memberships", icon: <UserPlus size={20} /> }, // or <Users />
                                { href: "/items2", label: "Beauty Deals", icon: <Tag size={20} /> },
                                { href: "/serviceorder2", label: "Service Orders", icon: <ClipboardList size={20} /> },
                                // { href: "/servicegroup", label: "Service Groups", icon: <Folder size={20} /> }, // or <Layers />
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
                    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-400">
                        <h2 className="text-lg font-bold mb-4">Memberships</h2>

                        {/* Table */}
                        <table className="w-full border border-gray-300 mb-4">
                            <thead>
                                <tr className="bg-gray-300">
                                    <th className="border px-4 py-2 text-left">Membership Name</th>
                                    <th className="border px-4 py-2 text-left">Discount</th>
                                    <th className="border px-4 py-2 text-left">Description</th>
                                    <th className="border px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberships.map((membership) => (
                                    <tr key={membership.id} className="border-b hover:bg-gray-50">
                                        <td className="border px-4 py-2">{membership.name}</td>
                                        <td className="border px-4 py-2">{membership.discount}</td>
                                        <td className="border px-4 py-2">{membership.description}</td>
                                        <td className="border px-4 py-2 space-x-2">
                                            <button
                                                onClick={() => handleEdit(membership.id)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(membership.id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(membership.id)}
                                                className={`${membership.isActive ? "text-yellow-600" : "text-green-600"
                                                    } hover:underline`}
                                            >
                                                {membership.isActive ? "Mark Inactive" : "Mark Active"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Add new membership */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Membership Name"
                                value={newMembership.name}
                                onChange={(e) => setNewMembership({ ...newMembership, name: e.target.value })}
                                className="px-4 py-2 rounded-lg border w-40 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Discount %"
                                value={newMembership.discount}
                                onChange={(e) => setNewMembership({ ...newMembership, discount: e.target.value })}
                                className="px-4 py-2 rounded-lg border w-32 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newMembership.description}
                                onChange={(e) => setNewMembership({ ...newMembership, description: e.target.value })}
                                className="px-4 py-2 rounded-lg border w-64 focus:outline-none"
                            />
                            <button
                                onClick={handleAdd}
                                className="px-4 py-2 bg-[#5BBF5B] rounded-lg hover:bg-[#4CAF4C] text-white"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {editMembership && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg border border-gray-600 w-[90%] max-w-xl">
                                <h2 className="text-lg font-bold mb-4">Edit Membership</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-medium mb-1">Membership Name</label>
                                        <input
                                            type="text"
                                            value={editMembership.name}
                                            onChange={(e) => setEditMembership({ ...editMembership, name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Discount %</label>
                                        <input
                                            type="text"
                                            value={editMembership.discount}
                                            onChange={(e) => setEditMembership({ ...editMembership, discount: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Description</label>
                                        <textarea
                                            value={editMembership.description}
                                            onChange={(e) => setEditMembership({ ...editMembership, description: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditMembership(null)}
                                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
