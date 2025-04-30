"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Calendar, Home, Users, FileText, CreditCard, Package, 
  Layers, ShoppingCart, Settings, LogOut, ArrowLeft, Pencil, Trash2, Link, 
  UserPlus, Tag, ClipboardList, Folder, BarChart, Factory, ShoppingBag } from "lucide-react";

export default function ServiceOrderPage() {
  // Header and sidebar states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Service order states
  const [customerName, setCustomerName] = useState("New Customer");
  const [membershipType, setMembershipType] = useState("Standard");
  const [promoApplied, setPromoApplied] = useState("");
  const [discount, setDiscount] = useState(30);
  const [subtotal] = useState(930);
  const [membershipBalance] = useState(9500);
  const [membershipReduction] = useState(600);

  const handleSave = () => {
    toast.success("Service order saved successfully!");
  };

  const handleClearAll = () => {
    setCustomerName("New Customer");
    setPromoApplied("");
    setDiscount(0);
    toast.info("All fields cleared");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/home";
  };

  const handleSearch = () => {  
    if (searchQuery.trim() === "") {
      toast.error("Please enter a search query.");
    } else {
      // Perform search logic here
      toast.success(`Searching for "${searchQuery}"...`);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
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

        {/* Main Content - Service Order */}
        <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Service Order</h1>
            
            {/* Customer Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{customerName}</span>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setCustomerName(prompt("Enter customer name", customerName) || customerName)}
                    >
                      Change
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                    <span>Membership Active</span>
                    <span className="text-gray-500">[Expires: Mar. 15, 2025]</span>
                  </div>
                  
                  <div className="text-sm mb-2">
                    <span className="font-medium">Balance </span>
                    <span className="text-blue-600">P{membershipBalance.toLocaleString()} Remaining</span>
                  </div>
                  
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined February 1, 2025</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Benefits</span>
                    <span className="font-medium">P10,000</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membership Type</span>
                    <span className="font-medium">{membershipType}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Promo & Discount Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Promo & Discount</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Promo</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={promoApplied}
                    onChange={(e) => setPromoApplied(e.target.value)}
                  >
                    <option value="">Select Promo</option>
                    <option value="summer2023">Summer 2023 Special</option>
                    <option value="anniversary">Anniversary Promo</option>
                    <option value="newcustomer">New Customer Discount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mb-8">
              <button 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                onClick={handleClearAll}
              >
                Clear All
              </button>
              <button 
                className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
            
            {/* Summary Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">P{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-blue-600">
                  <span>Promo Reduction</span>
                  <span>P0</span>
                </div>
                
                <div className="flex justify-between text-blue-600">
                  <span>Discount Reduction</span>
                  <span>P{discount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>Membership Reduction</span>
                  <span>P{membershipReduction.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Remaining Membership</span>
                    <span className="text-blue-600">P{(membershipBalance - membershipReduction).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}