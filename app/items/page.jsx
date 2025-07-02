"use client";

import { useRouter, } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { BarChart, Pencil, Trash2, Power } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag, Tag, XIcon } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, Settings, LogOut, UserPlus } from "lucide-react";

export default function BeautyDeals() {
    const router = useRouter();
    const [deals, setDeals] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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

    function closeModal() {
        setIsOpen(false)
    }

    function openModal(deal) {
        setSelectedDeal(deal)
        setIsOpen(true)
    }

    const slideUp = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
        exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2 } },
    };

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/API/getPromosAndDiscounts.php');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDeals(data.promos);
                setDiscounts(data.discounts);
            } catch (error) {
                setError(error.message);
                toast.error('Failed to fetch data: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const handleAddItemSubmit = async (e) => {
        e.preventDefault();
        try {
            if (newItem.type === "promo") {
                // Here you would send a POST request to your backend
                // For now, we'll simulate it by updating the state
                const newDeal = {
                    type: newItem.promoType,
                    name: newItem.name,
                    description: newItem.description,
                    validFrom: newItem.validFrom,
                    validTo: newItem.validTo,
                    status: newItem.status
                };

                setDeals(prev => [...prev, newDeal]);
                toast.success("Promo added successfully!");
            } else {
                const newDiscount = {
                    name: newItem.name,
                    description: newItem.description,
                    discountType: newItem.discountType,
                    value: newItem.value,
                    status: newItem.status
                };

                setDiscounts(prev => [...prev, newDiscount]);
                toast.success("Discount added successfully!");
            }
            setIsAddModalOpen(false);
        } catch (error) {
            toast.error('Failed to add item: ' + error.message);
        }
    };

    const handleEditDeal = (index) => {
        setSelectedDeal({ ...deals[index], index });
        setIsPromoModalOpen(true); // Should open promo edit modal
        setIsOpen(false); // Close details modal if open
    };

    const handleEditDiscount = (index) => {
        setSelectedDiscount({ ...discounts[index], index });
        setIsDiscountModalOpen(true); // Should open discount edit modal
        setIsOpen(false); // Close details modal if open
    };

    const handleSaveEditPromo = async (e) => {
        e.preventDefault();

        try {
            // Send PUT/PATCH request to backend
            const response = await fetch(`http://localhost/API/getPromosAndDiscounts.php?action=update_deal`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: selectedDeal.id,
                    name: selectedDeal.name,
                    description: selectedDeal.description,
                    validFrom: selectedDeal.validFrom,
                    validTo: selectedDeal.validTo,
                    status: selectedDeal.status,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update promo.");
            }

            // Update frontend state
            setDeals(prev => {
                const updated = [...prev];
                updated[selectedDeal.index] = { ...selectedDeal };
                return updated;
            });

            toast.success("Promo updated successfully!");
            setIsPromoModalOpen(false);
        } catch (error) {
            toast.error('Failed to update promo: ' + error.message);
        }
    };

    const handleSaveEditDiscount = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost/API/getPromosAndDiscounts.php?action=update_discount", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: selectedDiscount.id,
                    name: selectedDiscount.name,
                    description: selectedDiscount.description,
                    discountType: selectedDiscount.discountType,
                    value: selectedDiscount.value,
                    status: selectedDiscount.status,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update discount.");
            }

            setDiscounts((prev) => {
                const updated = [...prev];
                updated[selectedDiscount.index] = { ...selectedDiscount };
                return updated;
            });

            toast.success("Discount updated successfully!");
            setIsDiscountModalOpen(false);
        } catch (error) {
            toast.error('Failed to update discount: ' + error.message);
        }
    };


    const handleDeleteDeal = async (index) => {
        try {
            // Here you would send a DELETE request to your backend
            setDeals(prev => prev.filter((_, i) => i !== index));
            toast.success("Deal deleted successfully!");
        } catch (error) {
            toast.error('Failed to delete deal: ' + error.message);
        }
    };

    const handleDeleteDiscount = async (index) => {
        try {
            // Here you would send a DELETE request to your backend
            setDiscounts(prev => prev.filter((_, i) => i !== index));
            toast.success("Discount deleted successfully!");
        } catch (error) {
            toast.error('Failed to delete discount: ' + error.message);
        }
    };

    const handleToggleStatus = async (index, isDeal) => {
        try {
            if (isDeal) {
                setDeals(prev => {
                    const updated = [...prev];
                    const currentStatus = updated[index].status;
                    const newStatus = currentStatus === "active" ? "inactive" : "active";
                    updated[index].status = newStatus;
                    toast.success(`Deal marked as ${newStatus}`);
                    return updated;
                });
            } else {
                setDiscounts(prev => {
                    const updated = [...prev];
                    const currentStatus = updated[index].status;
                    const newStatus = currentStatus === "active" ? "inactive" : "active";
                    updated[index].status = newStatus;
                    toast.success(`Discount marked as ${newStatus}`);
                    return updated;
                });
            }
        } catch (error) {
            toast.error('Failed to update status: ' + error.message);
        }
    };


    if (isLoading) {
        return (
            <main className="flex-1 p-6 bg-white text-gray-900 ml-64 flex items-center justify-center">
                <div>Loading...</div>
            </main>
        );
    }


    const handleSearch = () => {
        toast.success(`Searching for "${searchQuery}"...`);
        console.log("Search query:", searchQuery);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
            <Toaster />

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
                                { href: "/serviceorder", label: "Service Acquire", icon: <ClipboardList size={20} /> },
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
                                { href: "/customers", label: "Customers", icon: <Users size={20} /> },
                                { href: "/invoices", label: "Invoices", icon: <FileText size={20} /> },
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-between items-center mb-4"
                    >
                        <h2 className="text-lg font-bold">Beauty Deals</h2>
                    </motion.div>

                    {/* Promo Section */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-700">Promo</h3>
                            <motion.button
                                className="px-3 py-1 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded text-sm"
                                onClick={() => handleAddItem("promo")}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add Promo
                            </motion.button>
                        </div>
                        <motion.div
                            className="p-4 bg-white rounded-lg shadow border border-gray-200"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <div className="grid grid-cols-5 font-bold mb-4 border-b pb-2">
                                <div>Name and Description</div>
                                <div>Valid from</div>
                                <div>Valid to</div>
                                <div>Status</div>
                                <div>Actions</div>
                            </div>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {deals.map((deal, index) => (
                                        <motion.div
                                            key={index}
                                            className="grid grid-cols-5 items-center border-b pb-2 cursor-pointer"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ delay: index * 0.05, type: "spring" }}
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                            onClick={() => {
                                                setSelectedDeal(deal);
                                                setSelectedDiscount(null);  // Clear discount selection
                                                setIsOpen(true);
                                            }}
                                        >
                                            <div>
                                                <div className="font-semibold">{deal.type}</div>
                                                <div>{deal.name}</div>
                                                <div className="text-sm text-gray-600">{deal.description}</div>
                                            </div>
                                            <div>{deal.validFrom}</div>
                                            <div>{deal.validTo}</div>
                                            <div>
                                                <motion.span
                                                    className={`px-2 py-1 rounded-full text-xs ${deal.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {deal.status}
                                                </motion.span>
                                            </div>
                                            <div className="flex items-center justify-start space-x-3">
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditDeal(index);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Pencil size={18} title="Edit" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Discount Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-700">Discount</h3>
                            <motion.button
                                className="px-3 py-1 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded text-sm"
                                onClick={() => handleAddItem("discount")}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add Discount
                            </motion.button>
                        </div>
                        <motion.div
                            className="p-4 bg-white rounded-lg shadow border border-gray-200"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                        >
                            <div className="grid grid-cols-4 font-bold mb-4 border-b pb-2">
                                <div>Name and Description</div>
                                <div>Details</div>
                                <div className="text-center">Status</div>
                                <div className="text-center pr-3">Actions</div>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {discounts.map((discount, index) => (
                                        <motion.div
                                            key={index}
                                            className="grid grid-cols-4 items-center border-b pb-2 cursor-pointer"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ delay: index * 0.05, type: "spring" }}
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                            onClick={() => {
                                                setSelectedDiscount(discount);
                                                setSelectedDeal(null);  // Clear deal selection
                                                setIsOpen(true);
                                            }}
                                        >
                                            <div>
                                                <div className="font-semibold">{discount.name}</div>
                                                <div className="text-sm text-gray-600">{discount.description}</div>
                                            </div>

                                            <div>Details here</div>

                                            {/* STATUS */}
                                            <div className="flex justify-center">
                                                <motion.span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${discount.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {discount.status}
                                                </motion.span>
                                            </div>
                                            <div className="flex items-center justify-center space-x-3">
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditDiscount(index);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Pencil size={18} title="Edit" />
                                                </motion.button>

                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                </main>
            </div>

            {/* Main Details Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                            {selectedDeal?.name || selectedDiscount?.name || 'Details'}
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-500"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <XIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Content Area */}
                                    <div className="mt-4 space-y-4">
                                        {/* Basic Info Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Description</h4>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        {selectedDeal?.description || selectedDiscount?.description || 'N/A'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-gray-900">Status</h4>
                                                    <span className={`mt-1 px-2 py-1 rounded-full text-xs ${(selectedDeal?.status === "active" || selectedDiscount?.status === "active")
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {selectedDeal?.status || selectedDiscount?.status || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Conditional Fields */}
                                            <div className="space-y-4">
                                                {selectedDeal ? (
                                                    <>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Valid From</h4>
                                                            <p className="text-sm text-gray-800 mt-1">
                                                                {selectedDeal.validFrom || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Valid To</h4>
                                                            <p className="text-sm text-gray-800 mt-1">
                                                                {selectedDeal.validTo || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : selectedDiscount && (
                                                    <>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Discount Type</h4>
                                                            <p className="text-sm text-gray-800 mt-1 capitalize">
                                                                {selectedDiscount.discountType || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Value</h4>
                                                            <p className="text-sm text-gray-800 mt-1">
                                                                {selectedDiscount.value || 'N/A'}
                                                                {selectedDiscount.discountType === 'percentage' ? '%' : ''}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Services Table Section */}
                                        <div className="pt-2">
                                            <h4 className="font-semibold text-gray-900 mb-2">Included Services</h4>
                                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Service</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Category</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Original Price</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Discounted Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {(selectedDeal?.services || selectedDiscount?.services || []).map((service, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{service.category}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{service.originalPrice}</td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{service.discountedPrice}</td>
                                                            </tr>
                                                        ))}
                                                        {(!selectedDeal?.services && !selectedDiscount?.services) && (
                                                            <tr>
                                                                <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                                                                    No services included
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex justify-end space-x-3">
                                        {selectedDeal ? (
                                            <motion.button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsOpen(false);
                                                    const dealIndex = deals.findIndex(d => d.id === selectedDeal.id);
                                                    if (dealIndex !== -1) handleEditDeal(dealIndex);
                                                }}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Edit Promo
                                            </motion.button>
                                        ) : selectedDiscount ? (
                                            <motion.button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsOpen(false);
                                                    const discountIndex = discounts.findIndex(d => d.id === selectedDiscount.id);
                                                    if (discountIndex !== -1) handleEditDiscount(discountIndex);
                                                }}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Edit Discount
                                            </motion.button>
                                        ) : null}

                                        <motion.button
                                            onClick={() => setIsOpen(false)}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Close
                                        </motion.button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <AnimatePresence>
                {isAddModalOpen && newItem.type === "promo" && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[85vh] overflow-y-auto"
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h2 className="text-xl font-bold mb-6">Add Promo</h2>
                            <form onSubmit={handleAddItemSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name*</label>
                                        <input
                                            type="text"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            value={newItem.description}
                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid From</label>
                                        <input
                                            type="date"
                                            value={newItem.validFrom}
                                            onChange={(e) => setNewItem({ ...newItem, validFrom: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valid To</label>
                                        <input
                                            type="date"
                                            value={newItem.validTo}
                                            onChange={(e) => setNewItem({ ...newItem, validTo: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Services Linked to Group</label>
                                        <select
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        >
                                            <option value="">Select service group</option>
                                            {/* Options to be dynamically populated */}
                                        </select>
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
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Promo Modal */}
            {
                isPromoModalOpen && selectedDeal && (
                    <AnimatePresence>
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[85vh] overflow-y-auto"
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <h2 className="text-xl font-bold mb-6">Edit Promo</h2>
                                <form onSubmit={handleSaveEditPromo}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name*</label>
                                            <input
                                                type="text"
                                                value={selectedDeal.name}
                                                onChange={(e) =>
                                                    setSelectedDeal({ ...selectedDeal, name: e.target.value })
                                                }
                                                className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description</label>
                                            <textarea
                                                value={selectedDeal.description}
                                                onChange={(e) =>
                                                    setSelectedDeal({
                                                        ...selectedDeal,
                                                        description: e.target.value,
                                                    })
                                                }
                                                className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Valid from</label>
                                                <input
                                                    type="date"
                                                    value={selectedDeal.validFrom}
                                                    onChange={(e) =>
                                                        setSelectedDeal({ ...selectedDeal, validFrom: e.target.value })
                                                    }
                                                    className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Valid to</label>
                                                <input
                                                    type="date"
                                                    value={selectedDeal.validTo}
                                                    onChange={(e) =>
                                                        setSelectedDeal({ ...selectedDeal, validTo: e.target.value })
                                                    }
                                                    className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Status</label>
                                            <select
                                                value={selectedDeal.status}
                                                onChange={(e) =>
                                                    setSelectedDeal({ ...selectedDeal, status: e.target.value })
                                                }
                                                className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end space-x-3 mt-6">
                                            <motion.button
                                                type="button"
                                                onClick={() => setIsPromoModalOpen(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Save
                                            </motion.button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                )
            }

            {/* Add Discount Modal */}
            {
                isAddModalOpen && newItem.type === "discount" && (
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
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            value={newItem.description}
                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Discount Type</label>
                                            <select
                                                value={newItem.discountType}
                                                onChange={(e) => setNewItem({ ...newItem, discountType: e.target.value })}
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
                                                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
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
                )
            }

            {/* Edit Discount Modal */}
            {isDiscountModalOpen && selectedDiscount && (
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[85vh] overflow-y-auto"
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <h2 className="text-xl font-bold mb-6">Edit Discount</h2>
                            <form onSubmit={handleSaveEditDiscount}>
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

                                    {/* Added Status Field */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            value={selectedDiscount.status}
                                            onChange={(e) => setSelectedDiscount({ ...selectedDiscount, status: e.target.value })}
                                            className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-lg"
                                            onClick={() => setIsDiscountModalOpen(false)}
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
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div >
    );
}