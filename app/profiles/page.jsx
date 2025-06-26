"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Settings, LogOut, Home, Users, Shield } from "lucide-react";

export default function ViewProfile() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const formData = {
        name: "John Mark",
        service: "Hair Stylist",
        email: "john_mark@yahoo.com",
        phone: "+639 856 3245",
        hireDate: "2024-10-10",
        contactDetails: "Regency Plain Subdivision",
        status: "Active",
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col h-screen bg-white text-gray-900">          

            {/* Sidebar */}
            <div className="flex flex-1">
                <nav className="w-64 h-screen bg-gradient-to-b from-[#467750] to-[#56A156] text-white flex flex-col items-center py-6 fixed top-0 left-0">
                    <div className="flex items-center space-x-2 mb-4">
                        <h1 className="text-xl font-bold flex items-center space-x-2">
                            <img src="/path-to-your-image/2187693(1)(1).png" alt="Lizly Logo" className="w-10 h-10 object-contain" />
                            <span>Lizly Skin Care Clinic</span>
                        </h1>
                    </div>

                    <div className="w-full space-y-2 px-4">
                        <Link href="/home">
                            <div className="w-full p-3 rounded-lg hover:bg-[#2A3F3F] text-white text-left font-medium flex items-center cursor-pointer">
                                <Home className="mr-2" size={20} /> Dashboard
                            </div>
                        </Link>
                        <Link href="/profiles">
                            <div className="w-full p-3 rounded-lg hover:bg-[#2A3F3F] text-white text-left font-medium flex items-center cursor-pointer">
                                <User className="mr-2" size={20} /> Profiles
                            </div>
                        </Link>
                        <Link href="/employeeM">
                            <div className="w-full p-3 rounded-lg hover:bg-[#2A3F3F] text-white text-left font-medium flex items-center cursor-pointer">
                                <Users className="mr-2" size={20} /> Employee Management
                            </div>
                        </Link>
                        <Link href="/userM">
                            <div className="w-full p-3 rounded-lg hover:bg-[#2A3F3F] text-white text-left font-medium flex items-center cursor-pointer">
                                <Users className="mr-2" size={20} /> User Management
                            </div>
                        </Link>
                        <Link href="/branchM">
                            <div className="w-full p-3 rounded-lg hover:bg-[#2A3F3F] text-white text-left font-medium flex items-center cursor-pointer">
                                <Home className="mr-2" size={20} /> Branch Management
                            </div>
                        </Link>
                        <Link href="/roles">
                            <div className="w-full p-3 rounded-lg hover:bg-[#2A3F3F] text-white text-left font-medium flex items-center cursor-pointer">
                                <Shield className="mr-2" size={20} /> Roles
                            </div>
                        </Link>
                    </div>
                </nav>

                <main className="flex-1 p-8 max-w-screen-xl mx-auto ml-64 bg-white min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-8 rounded shadow border border-gray-300"
                    >
                        <h2 className="text-2xl font-bold mb-6">Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-1">Name</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.name}</p>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Service</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.service}</p>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Email Address</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.email}</p>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Phone Address</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.phone}</p>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Hire Date</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.hireDate}</p>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Contact Details</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.contactDetails}</p>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Employee Status</label>
                                <p className="p-2 border rounded bg-gray-100">{formData.status}</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-pink-200 mx-auto mb-2 flex items-center justify-center">
                                        <span className="text-4xl">👩‍💼</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Photo</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
