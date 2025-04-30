"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { BarChart } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, Settings, LogOut, Plus } from "lucide-react";

export default function BeautyDeals() {
    const router = useRouter();
    const [deals, setDeals] = useState([
        { 
            type: "Membership", 
            name: "Facial Spa + Footspa", 
            description: "Bundled Promo",
            validFrom: "01/10/25",
            validTo: "01/25/25",
            status: "active"
        },
        { 
            type: "Beauty Deals", 
            name: "Hair Rebond + Haircut", 
            description: "Bundled Promo for 1000 only",
            validFrom: "01/10/25",
            validTo: "01/25/25",
            status: "active"
        }
    ]);
    const [discounts, setDiscounts] = useState([
        { name: "Hotleween Discount", description: "Input customers", status: "active" },
        { name: "Hotiday Discount", description: "10% off", status: "active" },
        { name: "Granel", description: "Calendar", status: "active" }
    ]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        type: "promo",
        promoType: "Membership",
        name: "",
        description: "",
        validFrom: "",
        validTo: "",
        discountType: "percentage",
        value: "",
        status: "active"
    });
    const [activeSection, setActiveSection] = useState("promo");

    const handleAddItem = (type) => {
        setNewItem({
            type: type,
            promoType: "Membership",
            name: "",
            description: "",
            validFrom: "",
            validTo: "",
            discountType: "percentage",
            value: "",
            status: "active"
        });
        setIsAddModalOpen(true);
    };

    const handleAddItemSubmit = (e) => {
        e.preventDefault();
        if (newItem.type === "promo") {
            setDeals(prev => [...prev, {
                type: newItem.promoType,
                name: newItem.name,
                description: newItem.description,
                validFrom: newItem.validFrom,
                validTo: newItem.validTo,
                status: newItem.status
            }]);
            toast.success("Promo added successfully!");
        } else {
            setDiscounts(prev => [...prev, {
                name: newItem.name,
                description: newItem.description,
                discountType: newItem.discountType,
                value: newItem.value,
                status: newItem.status
            }]);
            toast.success("Discount added successfully!");
        }
        setIsAddModalOpen(false);
    };

    const handleEditDeal = (index) => {
        setSelectedDeal({ ...deals[index], index });
        setIsEditModalOpen(true);
    };

    const handleEditDiscount = (index) => {
        setSelectedDiscount({ ...discounts[index], index });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (selectedDeal) {
            setDeals(prev => {
                const updated = [...prev];
                updated[selectedDeal.index] = {
                    type: selectedDeal.type,
                    name: selectedDeal.name,
                    description: selectedDeal.description,
                    validFrom: selectedDeal.validFrom,
                    validTo: selectedDeal.validTo,
                    status: selectedDeal.status
                };
                return updated;
            });
            toast.success("Deal updated successfully!");
        } else if (selectedDiscount) {
            setDiscounts(prev => {
                const updated = [...prev];
                updated[selectedDiscount.index] = {
                    name: selectedDiscount.name,
                    description: selectedDiscount.description,
                    discountType: selectedDiscount.discountType,
                    value: selectedDiscount.value,
                    status: selectedDiscount.status
                };
                return updated;
            });
            toast.success("Discount updated successfully!");
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteDeal = (index) => {
        setDeals(prev => prev.filter((_, i) => i !== index));
        toast.success("Deal deleted successfully!");
    };

    const handleDeleteDiscount = (index) => {
        setDiscounts(prev => prev.filter((_, i) => i !== index));
        toast.success("Discount deleted successfully!");
    };

    const handleToggleStatus = (index, isDeal) => {
        if (isDeal) {
            setDeals(prev => {
                const updated = [...prev];
                updated[index].status = updated[index].status === "active" ? "inactive" : "active";
                return updated;
            });
            toast.success(`Deal marked as ${deals[index].status === "active" ? "inactive" : "active"}`);
        } else {
            setDiscounts(prev => {
                const updated = [...prev];
                updated[index].status = updated[index].status === "active" ? "inactive" : "active";
                return updated;
            });
            toast.success(`Discount marked as ${discounts[index].status === "active" ? "inactive" : "active"}`);
        }
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
                    <button 
                        className="text-2xl" 
                        onClick={() => handleAddItem(activeSection === "promo" ? "promo" : "discount")}
                    >
                        ➕
                    </button>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
                    />
                    <button
                        onClick={() => {/* search functionality */}}
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
                                <Users size={16} /> Edit Profile
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

                {/* Main Content */}
                <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Beauty Deals</h2>
                    </div>
                    
                    {/* Promo Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-700">Promo</h3>
                            <button 
                                className="px-3 py-1 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded text-sm"
                                onClick={() => handleAddItem("promo")}
                            >
                                Add Promo
                            </button>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
                            <div className="grid grid-cols-5 font-bold mb-4 border-b pb-2">
                                <div>Name and Description</div>
                                <div>Valid from</div>
                                <div>Valid to</div>
                                <div>Status</div>
                                <div>Actions</div>
                            </div>
                            <div className="space-y-4">
                                {deals.map((deal, index) => (
                                    <div key={index} className="grid grid-cols-5 items-center border-b pb-2">
                                        <div>
                                            <div className="font-semibold">{deal.type}</div>
                                            <div>{deal.name}</div>
                                            <div className="text-sm text-gray-600">{deal.description}</div>
                                        </div>
                                        <div>{deal.validFrom}</div>
                                        <div>{deal.validTo}</div>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${deal.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {deal.status}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2 justify-end">
                                            <button
                                                onClick={() => handleEditDeal(index)}
                                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(index, true)}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    deal.status === "active" 
                                                        ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                                                        : "bg-gray-500 hover:bg-gray-600 text-white"
                                                }`}
                                            >
                                                {deal.status === "active" ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDeal(index)}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Discount Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-700">Discount</h3>
                            <button 
                                className="px-3 py-1 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded text-sm"
                                onClick={() => handleAddItem("discount")}
                            >
                                Add Discount
                            </button>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
                            <div className="grid grid-cols-4 font-bold mb-4 border-b pb-2">
                                <div>Name and Description</div>
                                <div>Details</div>
                                <div>Status</div>
                                <div>Actions</div>
                            </div>
                            <div className="space-y-4">
                                {discounts.map((discount, index) => (
                                    <div key={index} className="grid grid-cols-4 items-center border-b pb-2">
                                        <div>
                                            <div className="font-semibold">{discount.name}</div>
                                            <div className="text-sm text-gray-600">{discount.description}</div>
                                        </div>
                                        <div>Details here</div>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${discount.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {discount.status}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2 justify-end">
                                            <button
                                                onClick={() => handleEditDiscount(index)}
                                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(index, false)}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    discount.status === "active" 
                                                        ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                                                        : "bg-gray-500 hover:bg-gray-600 text-white"
                                                }`}
                                            >
                                                {discount.status === "active" ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDiscount(index)}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Promo Modal */}
            {isAddModalOpen && newItem.type === "promo" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                        <h2 className="text-xl font-bold mb-6">Add Promo</h2>
                        <form onSubmit={handleAddItemSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">New Price*</label>
                                    <input
                                        type="text"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid from</label>
                                        <input
                                            type="date"
                                            value={newItem.validFrom}
                                            onChange={(e) => setNewItem({...newItem, validFrom: e.target.value})}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid to</label>
                                        <input
                                            type="date"
                                            value={newItem.validTo}
                                            onChange={(e) => setNewItem({...newItem, validTo: e.target.value})}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Services Link to Groups</label>
                                    <select
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                    >
                                        <option value="">Select service group</option>
                                        {/* Options would be populated from your service groups data */}
                                    </select>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Promo Modal */}
            {isEditModalOpen && selectedDeal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                        <h2 className="text-xl font-bold mb-6">Edit Promo</h2>
                        <form onSubmit={handleSaveEdit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <input
                                        type="text"
                                        value={selectedDeal.name}
                                        onChange={(e) => setSelectedDeal({ ...selectedDeal, name: e.target.value })}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={selectedDeal.description}
                                        onChange={(e) => setSelectedDeal({ ...selectedDeal, description: e.target.value })}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid from</label>
                                        <input
                                            type="date"
                                            value={selectedDeal.validFrom}
                                            onChange={(e) => setSelectedDeal({ ...selectedDeal, validFrom: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid to</label>
                                        <input
                                            type="date"
                                            value={selectedDeal.validTo}
                                            onChange={(e) => setSelectedDeal({ ...selectedDeal, validTo: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Discount Modal */}
            {isAddModalOpen && newItem.type === "discount" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                        <h2 className="text-xl font-bold mb-6">Add Discount</h2>
                        <form onSubmit={handleAddItemSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Discount Type</label>
                                        <select
                                            value={newItem.discountType}
                                            onChange={(e) => setNewItem({...newItem, discountType: e.target.value})}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Value*</label>
                                        <input
                                            type="text"
                                            value={newItem.value}
                                            onChange={(e) => setNewItem({...newItem, value: e.target.value})}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                            placeholder={newItem.discountType === "percentage" ? "e.g. 10%" : "e.g. $50"}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Discount Modal */}
            {isEditModalOpen && selectedDiscount && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                        <h2 className="text-xl font-bold mb-6">Edit Discount</h2>
                        <form onSubmit={handleSaveEdit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <input
                                        type="text"
                                        value={selectedDiscount.name}
                                        onChange={(e) => setSelectedDiscount({ ...selectedDiscount, name: e.target.value })}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={selectedDiscount.description}
                                        onChange={(e) => setSelectedDiscount({ ...selectedDiscount, description: e.target.value })}
                                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Discount Type</label>
                                        <select
                                            value={selectedDiscount.discountType}
                                            onChange={(e) => setSelectedDiscount({ ...selectedDiscount, discountType: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Value*</label>
                                        <input
                                            type="text"
                                            value={selectedDiscount.value}
                                            onChange={(e) => setSelectedDiscount({ ...selectedDiscount, value: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                            placeholder={selectedDiscount.discountType === "percentage" ? "e.g. 10%" : "e.g. $50"}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}