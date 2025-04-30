"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dialog } from "@headlessui/react";
import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { BarChart } from "lucide-react";
import { User } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, Settings, LogOut, Plus } from "lucide-react";

const navLinks = [
  { href: "/servicess", label: "Services", icon: "💆‍♀️" },
  { href: "/price-list", label: "Price List", icon: "📋" }, // New Price List link
  { href: "/items", label: "Item Groups", icon: "📂" },
];


const salesLinks = [
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/invoices", label: "Invoices", icon: "📜" },
  { href: "/payments", label: "Payments", icon: "💰" },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);



  useEffect(() => {
    const fetchServices = async () => {
      const data = [
        {
          id: 1,
          name: "Haircut Rebond",
          type: "Hair Services",
          description: "Haircut and rebonding treatment.",
          price: "P999.00",
          adjustment: "Holiday Special",
          link: "Inventory Link 1",
        },
        {
          id: 2,
          name: "Hair Botox Treatment",
          type: "Hair Services",
          description: "Botox treatment for hair.",
          price: "P1200.00",
          adjustment: "Regular Price",
          link: "Inventory Link 2",
        },
      ];
      setServices(data);
    };
    fetchServices();
  }, []);

  const handleSearch = () => {
    toast(`Searching for: ${searchQuery}`);
    console.log("Search query:", searchQuery);
  };

  const handleEdit = () => {
    setEditMode(true);
    setFormData(selectedService);
  };

  const handleSave = () => {
    setEditMode(false);
    // Add your save logic here
    toast.success("Changes saved successfully");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleCloneItem = () => {
    toast.success("Item cloned!");
    setIsMoreModalOpen(false);
    // Add your clone logic here
};

const handleMarkAsInactive = () => {
  toast.success("Item marked as inactive!");
  setIsMoreModalOpen(false);
  // Add your mark as inactive logic here
};

const handleDelete = () => {
  if (window.confirm(`Are you sure you want to delete ${selectedItem.name}?`)) {
      toast.success("Item deleted!");
      setSelectedItem(null);
      setIsMoreModalOpen(false);
      // Add your delete logic here
  }
};

const handleAddToGroup = () => {
  toast.success("Item added to group!");
  setIsMoreModalOpen(false);
  // Add your add to group logic here
};

  <div className="flex flex-col h-screen bg-gradient-to-b from-[#77DD77] to-[#56A156] text-gray-900"></div>
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

        {/* Main Content */}
        <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
          <div className="grid grid-cols-3 gap-6">
            {/* Services List */}
            <div className="col-span-1 bg-white rounded-lg shadow-lg border border-gray-400 p-4">
              <h2 className="text-lg font-bold mb-4">All Services</h2>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-[#E3F9E5] ${selectedService?.id === service.id ? "bg-[#C5F0C5]" : ""
                      }`}
                  >
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-green-600"
                      />
                      <span>{service.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Details */}
            {selectedService && (
              <div className="col-span-2 bg-white rounded-lg shadow-lg border border-gray-400 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{selectedService.name}</h2>
                  {!editMode ? (
                    <button
                      onClick={handleEdit}
                      className="text-white px-4 py-2 rounded hover:bg-green-400"
                    >
                      ✏️
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  )}<button
                    onClick={() => setIsMoreModalOpen(true)}
                    className="p-1 text-gray-700 hover:bg-green-400 rounded"
                  >
                    More
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Type</label>
                    {editMode ? (
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option>Hair Services</option>
                        <option>Skin Services</option>
                        <option>Nail Services</option>
                      </select>
                    ) : (
                      <p>{selectedService.type}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    {editMode ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <p>{selectedService.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        <p>{selectedService.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Price Adjustment</label>
                      {editMode ? (
                        <select
                          value={formData.adjustment}
                          onChange={(e) => setFormData({ ...formData, adjustment: e.target.value })}
                          className="w-full p-2 border rounded"
                        >
                          <option>Holiday Special</option>
                          <option>Regular Price</option>
                          <option>Seasonal Discount</option>
                        </select>
                      ) : (
                        <p>{selectedService.adjustment}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Inventory Link</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <a href="#" className="text-blue-600 hover:underline">
                        {selectedService.link}
                      </a>
                    )}
                  </div>
                </div>

                {/* More Section */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-2">More</h3>
                  <button className="text-blue-600 hover:text-blue-800">
                    + Add Additional Option
                  </button>
                </div>
              </div>
            )}

            {/* More Button Modal */}
            {isMoreModalOpen && (
              <Dialog open={isMoreModalOpen} onClose={() => setIsMoreModalOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-80">
                  <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">
                    More Options
                  </Dialog.Title>
                  <div className="space-y-2">
                    <button
                      onClick={handleCloneItem}
                      className="w-full p-2 text-left hover:bg-gray-100 rounded text-gray-800"
                    >
                      Clone Item
                    </button>
                    <button
                      onClick={handleMarkAsInactive}
                      className="w-full p-2 text-left hover:bg-gray-100 rounded text-gray-800"
                    >
                      Mark as Inactive
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full p-2 text-left hover:bg-gray-100 rounded text-red-600 text-gray-800"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleAddToGroup}
                      className="w-full p-2 text-left hover:bg-gray-100 rounded text-gray-800"
                    >
                      Add to Group
                    </button>
                  </div>
                  <button
                    onClick={() => setIsMoreModalOpen(false)}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-gray-800"
                  >
                    Close
                  </button>
                </Dialog.Panel>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}