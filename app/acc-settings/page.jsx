"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Dialog } from "@headlessui/react";
import Link from "next/link";

export default function AccountSettings() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState("user@example.com");
    const [password, setPassword] = useState("********");

    const handleSaveSettings = () => {
        toast("Settings saved successfully!");
        console.log("Settings saved:", { email, password });
    };

    return (
        <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
            <Toaster />

            {/* Header */}
            <header className="flex items-center justify-between bg-[#56A156] text-white p-4">
                <div className="flex items-center space-x-4">
                    <button className="text-2xl" onClick={() => setIsModalOpen(true)}>
                        ➕
                    </button>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
                    />
                    <button className="px-3 py-1.5 bg-[#5BBF5B] rounded-lg hover:bg-[#4CAF4C] text-white text-sm">
                        Search
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="/home">
                        <button className="text-2xl">
                            🏠
                        </button>
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold">
                        A
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <nav className="w-64 bg-[#66C466] text-white flex flex-col items-center py-6">
                    <h1 className="text-2xl font-bold mb-6">Lizly Skin Care Clinic</h1>
                    <ul className="w-full px-4 space-y-2 flex-grow">
                        <li>
                            <Link
                                href="/account-settings"
                                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-[#4CAF4C]"
                            >
                                <span className="text-xl">⚙️</span>
                                <span className="font-medium">Account Settings</span>
                            </Link>
                        </li>
                    </ul>
                    <Link
                        href="/"
                        className="flex items-center space-x-4 p-3 rounded-lg bg-red-600 py-3 rounded-lg hover:bg-red-500 mt-auto"
                    >
                        <span className="text-xl">🚪</span>
                        <span className="ml-2 font-semibold">Logout</span>
                    </Link>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Account Info Card */}
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-bold mb-4">Account Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 mt-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#56A156]"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 mt-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#56A156]"
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleSaveSettings}
                                        className="px-4 py-2 bg-[#56A156] text-white rounded-lg hover:bg-[#4CAF4C] focus:outline-none"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h2 className="text-lg font-bold mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <input type="checkbox" id="emailNotifications" className="h-5 w-5" />
                                    <label htmlFor="emailNotifications" className="text-sm">Email Notifications</label>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <input type="checkbox" id="smsNotifications" className="h-5 w-5" />
                                    <label htmlFor="smsNotifications" className="text-sm">SMS Notifications</label>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleSaveSettings}
                                        className="px-4 py-2 bg-[#56A156] text-white rounded-lg hover:bg-[#4CAF4C] focus:outline-none"
                                    >
                                        Save Preferences
                                    </button>
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
                >
                    <Dialog.Panel className="bg-[#56A156] p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <Dialog.Title className="text-lg font-bold text-[#FFFFFF] mb-4">Select Option</Dialog.Title>
                        <div className="grid grid-cols-2 gap-6">
                            {/* General Section */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="text-xl">📊</div>
                                    <h2 className="font-semibold text-[#FFFFFF]-700">General</h2>
                                </div>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => toast("Add User functionality triggered.")}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Add Users
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => toast("Add Service functionality triggered.")}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Services
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => toast("Add Service Item Group functionality triggered.")}
                                            className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                                        >
                                            + Services Item Groups
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
