"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { BarChart } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, Settings, LogOut, Plus } from "lucide-react";

const navLinks = [
  { href: "/servicess", label: "Services", icon: "💆‍♀️" },
  { href: "/price-list", label: "Price List", icon: "📋" },
  { href: "/items", label: "Item Groups", icon: "📂" },
];

const salesLinks = [
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/invoices", label: "Invoices", icon: "📜" },
  { href: "/payments", label: "Payments", icon: "💰" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = [
        {
          id: 1,
          customer: "Lucy Anne",
          amount: "$150",
          date: "2025-02-10",
          status: "Paid",
        },
        {
          id: 2,
          customer: "Mrs. Garamuda",
          amount: "$200",
          date: "2025-02-09",
          status: "Unpaid",
        },
      ];
      setInvoices(data);
    };
    fetchInvoices();
  }, []);

  const handleSearch = () => {
    toast(`Searching for: ${searchQuery}`);
  };

  const handleEdit = () => {
    setEditMode(true);
    setFormData(selectedInvoice);
  };

  const handleSave = () => {
    setEditMode(false);
    toast.success("Invoice updated successfully");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
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
                <ShoppingCart className="mr-2" size={20} /> POS ▾
            </Menu.Button>
            <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
                {[
                    { href: "/servicess", label: "Services", icon: <Layers size={20} /> },
                    { href: "/price-list", label: "Price List", icon: <FileText size={20} /> },
                    { href: "/items", label: "Service Groups", icon: <Package size={20} /> },
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

        <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-white rounded-lg shadow-xl border border-gray-400 p-4">
              <h2 className="text-lg font-bold mb-4">All Invoices</h2>
              <ul className="space-y-2">
                {invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-[#E3F9E5] ${selectedInvoice?.id === invoice.id ? "bg-[#C5F0C5]" : ""}`}
                  >
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-green-600"
                      />
                      <span>{invoice.customer} - {invoice.amount}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            {selectedInvoice && (
              <div className="col-span-2 bg-white rounded-lg shadow-lg border border-gray-400 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Invoice for {selectedInvoice.customer}</h2>
                  {!editMode ? (
                    <button
                      onClick={handleEdit}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="font-medium">Amount:</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="px-4 py-2 rounded-lg bg-[#f1f1f1] text-gray-900"
                      />
                    ) : (
                      <span>{selectedInvoice.amount}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium">Date:</label>
                    {editMode ? (
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="px-4 py-2 rounded-lg bg-[#f1f1f1] text-gray-900"
                      />
                    ) : (
                      <span>{selectedInvoice.date}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium">Status:</label>
                    {editMode ? (
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="px-4 py-2 rounded-lg bg-[#f1f1f1] text-gray-900"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    ) : (
                      <span>{selectedInvoice.status}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
