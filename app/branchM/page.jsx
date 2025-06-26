"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Settings, LogOut, Home, Users, Shield, Plus, MoreVertical } from "lucide-react";

export default function BranchManagementPage() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    const branches = [
        { name: "Alubijid", users: 5, employees: 12 },
        { name: "Bukidnon", users: 3, employees: 9 },
        { name: "Gingoog City", users: 4, employees: 11 },
        { name: "Patag", users: 6, employees: 13 },
    ];

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

                {/* Main Content */}
                <main className="flex-1 p-8 max-w-screen-xl mx-auto ml-64 bg-white min-h-screen">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-1">Branch Management</h1>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium">All Branches</h2>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium shadow">
                                <Plus size={18} />
                                <span>Add Branch</span>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <MoreVertical size={20} className="text-gray-700" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {branches.map((branch, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{branch.name}</td>
                                        <td className="px-4 py-3 text-gray-700">{branch.users}</td>
                                        <td className="px-4 py-3 text-gray-700">{branch.employees}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
