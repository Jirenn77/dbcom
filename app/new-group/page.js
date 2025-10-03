"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@headlessui/react";
import { useState } from "react";
import { toast } from "sonner";

const navLinks = [
    { href: "/servicess", label: "Services", icon: "\uD83D\uDC86‍♀️" },
    { href: "/price-list", label: "Price List", icon: "\uD83D\uDCCB" },
    { href: "/items", label: "📂", icon: "Item Groups" },
];

const salesLinks = [
    { href: "/customers", label: "Customers", icon: "👥" },
    { href: "/invoices", label: "📜" },
    { href: "/payments", label: "💰" },
];

export default function NewGroup() {
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");

    const handleSave = () => {
        if (!groupName) {
            toast.error("Group Name is required");
            return;
        }
        toast.success("Service Item Group saved successfully");
        router.push("/items");
    };

    return (
        <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
            {/* Header */}
            <header className="flex items-center justify-between bg-[#56A156] text-white p-4 w-full">
                <Link href="/home" className="text-2xl">🏠</Link>
                <div className="flex items-center space-x-4 flex-grow justify-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
                    />
                    <button className="px-3 py-1.5 bg-[#5BBF5B] rounded-lg hover:bg-[#4CAF4C] text-white text-sm">
                        Search
                    </button>
                </div>
                <Link href="/acc-settings" className="text-xl">⚙️</Link>
            </header>
            <div className="flex flex-1">
                {/* Sidebar */}
                <nav className="w-64 bg-[#66C466] text-white flex flex-col items-center py-6">
                    <h1 className="text-2xl font-bold mb-6">Lizly Skin Care Clinic</h1>
                    <Menu as="div" className="relative w-full px-4">
                        <Menu.Button className="w-full p-3 bg-[#5BBF5B] rounded-lg hover:bg-[#4CAF4C] text-left flex items-center">
                            <span className="mr-2">🛒</span> POS ▾
                        </Menu.Button>
                        <Menu.Items className="absolute left-4 mt-2 w-full bg-[#66C466] text-gray-900 rounded-lg shadow-lg z-10">
                            {navLinks.map((link) => (
                                <Menu.Item key={link.href}>
                                    {({ active }) => (
                                        <Link href={link.href} className={`flex items-center space-x-4 p-3 rounded-lg ${active ? 'bg-[#4CAF4C] text-white' : ''}`}>
                                            <span className="text-xl">{link.icon}</span>
                                            <span className="font-medium">{link.label}</span>
                                        </Link>
                                    )}
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </Menu>
                    <Link href="/" className="flex items-center space-x-4 p-3 rounded-lg bg-red-600 py-3 hover:bg-red-500 mt-auto">
                        <span className="text-xl">🚪</span>
                        <span className="ml-2 font-semibold">Logout</span>
                    </Link>
                </nav>
                {/* Main Content */}
                <main className="flex-1 p-8 bg-gradient-to-b from-[#77DD77] to-[#CFFFCF]">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4">Service Item Group Details</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Group Name*</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Enter group name"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </form>
                        <div className="flex justify-between items-center mt-6">
                            <button className="px-4 py-2 bg-gray-300 rounded-lg">Edit Services</button>
                            <div className="space-x-4">
                                <Link href="/items">
                                    <button className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
                                </Link>
                                <button onClick={handleSave} className="px-4 py-2 bg-[#5BBF5B] text-white rounded-lg">Save</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
