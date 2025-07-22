"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { User, Settings, LogOut, Home, X } from "lucide-react";
import { Menu } from "@headlessui/react";
import {
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { ClipboardList, Factory, ShoppingBag, Folder, Tag } from "lucide-react";
import { BarChart, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Memberships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memberships, setMemberships] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState([]);
  const [includedServices, setIncludedServices] = useState([]);
  const [availablePremiumServices, setAvailablePremiumServices] = useState([]);
  const [editMembership, setEditMembership] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [membershipServices, setMembershipServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const servicesPerPage = 12;
  const [newMembership, setNewMembership] = useState({
    name: "",
    description: "",
    type: "standard",
  });

  const calculateDiscountedPrice = (originalPrice, membershipType) => {
  const discount = membershipType === 'vip' ? 0.5 : 0.3;
  return originalPrice * (1 - discount);
};

  const getDiscountPercentage = (membershipType) => {
    return membershipType === "vip" ? "50%" : "30%";
  };

  //   // Mock data for membership services
  //   const mockServices = [
  //     { id: 1, name: "Facial Treatment", duration: "60 mins", price: "₱800" },
  //     { id: 2, name: "Microdermabrasion", duration: "45 mins", price: "₱1000" },
  //     { id: 3, name: "Chemical Peel", duration: "30 mins", price: "₱790" },
  //   ];

  const fetchMemberships = async () => {
    try {
      const res = await fetch("http://localhost/API/memberships.php");
      const data = await res.json();

      if (Array.isArray(data)) {
        setMemberships(data);
      } else {
        toast.error("Invalid data format from server.");
        console.error("Expected array, got:", data);
      }
    } catch (error) {
      toast.error("Failed to load memberships.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

 const fetchPremiumServices = async (membershipType) => {
  try {
    const res = await fetch(
      `http://localhost/API/servicegroup.php?action=premium_services&membership_type=${membershipType}`
    );
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (Array.isArray(data)) {
      return data.map((service) => ({
        id: service.service_id,
        name: service.name,
        duration: service.duration ? `${service.duration} mins` : "N/A",
        originalPrice: parseFloat(service.originalPrice),
        price: `₱${parseFloat(service.originalPrice).toFixed(2)}`,
        discountedPrice: service.discountedPrice ? parseFloat(service.discountedPrice) : null,
        discountPercentage: service.discountPercentage || null,
        description: service.description || 'No description available',
        category: service.category,
        membershipType: service.membershipType || membershipType
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching premium services:", error);
    return [];
  }
};

  const handleSearch = () => {
    toast(`Searching for: ${searchQuery}`);
  };

  const handleAdd = async () => {
    if (
      !newMembership.name ||
      !newMembership.type || 
      !newMembership.description
    ) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const membershipToSend = {
        ...newMembership,
        discount: newMembership.type === "vip" ? "50" : "30", 
      };

      const res = await fetch("http://localhost/API/memberships.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(membershipToSend), 
      });

      const data = await res.json();
      setMemberships([...memberships, data]);
      setNewMembership({
        name: "",
        type: "standard",
        description: "",
      });
      setIsModalOpen(false);
      toast.success("Membership added successfully.");
    } catch (error) {
      console.error("Add error:", error);
      toast.error("Failed to add membership.");
    }
  };

  const handleEdit = (id) => {
    const membershipToEdit = memberships.find((m) => m.id === id);
    setEditMembership({
      ...membershipToEdit,
      type: membershipToEdit.discount === "50" ? "vip" : "standard",
    });
  };

  const handleSaveEdit = async () => {
    if (
      !editMembership.name ||
      !editMembership.type || 
      !editMembership.description
    ) {
      toast.error("All fields are required.");
      return;
    }

    try {
      
      const membershipToSend = {
        ...editMembership,
        discount: editMembership.type === "vip" ? "50" : "30", 
      };

      const res = await fetch(
        `http://localhost/API/memberships.php/${editMembership.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(membershipToSend), 
        }
      );

      const updated = await res.json();

      const updatedWithType = {
        ...updated,
        type: updated.discount === "50" ? "vip" : "standard",
      };

      setMemberships((prev) =>
        prev.map((m) => (m.id === updatedWithType.id ? updatedWithType : m))
      );

      setEditMembership(null);
      toast.success("Membership updated successfully.");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update membership.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleToggleActive = async (id) => {
    try {
      const membershipToUpdate = memberships.find((m) => m.id === id);
      const newStatus =
        membershipToUpdate.status === "active" ? "inactive" : "active";

      const updatedMemberships = memberships.map((membership) =>
        membership.id === id ? { ...membership, status: newStatus } : membership
      );
      setMemberships(updatedMemberships);

      await fetch(`http://localhost/API/memberships.php/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...membershipToUpdate, status: newStatus }),
      });

      toast.success(
        `Membership ${newStatus === "active" ? "activated" : "deactivated"} successfully.`
      );
    } catch (error) {
      toast.error("Failed to update membership status.");
      console.error(error);
    }
  };

  const handleRowClick = async (membership) => {
  const membershipType = membership.discount === '50' ? 'vip' : 'standard';
  setSelectedMembership({
    ...membership,
    type: membershipType
  });
  setIsLoadingServices(true);

  try {
    const services = await fetchPremiumServices(membershipType);
    setMembershipServices(services);
  } catch (error) {
    console.error("Error loading services:", error);
    toast.error("Failed to load services");
  } finally {
    setIsLoadingServices(false);
  }
};

  const closeMembershipDetails = () => {
    setSelectedMembership(null);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: 50, opacity: 0, transition: { duration: 0.2 } },
  };

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
  };


  const SummaryView = ({
  services,
  searchTerm,
  categoryFilter,
  membershipType,
}) => {
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(filteredServices.map((s) => s.category))
  );

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryServices = filteredServices.filter(
          (s) => s.category === category
        );
        
        const categoryTotal = categoryServices.reduce(
          (sum, s) => sum + s.originalPrice, 0
        );
        
        const categoryDiscountedTotal = categoryServices.reduce(
          (sum, s) => sum + s.discountedPrice, 0
        );

        return (
          <div key={category} className="border-b pb-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{category}</h4>
              <span className="text-sm text-gray-600">
                {categoryServices.length} services
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">
                Original: ₱{categoryTotal.toFixed(2)}
              </span>
              <span className="font-medium text-red-500">
                {membershipType === 'vip' ? '50%' : '30%'} off: ₱{categoryDiscountedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DetailedView = ({
  services,
  searchTerm,
  categoryFilter,
  membershipType, 
  currentPage,
  servicesPerPage,
  setCurrentPage,
}) => {
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(
    indexOfFirstService,
    indexOfLastService
  );
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            membershipType={membershipType} 
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ service, membershipType }) => {
  return (
    <motion.div
      className="border rounded-lg p-3 hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{service.name}</h4>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          {service.category}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <div>Duration: {service.duration}</div>
        <div className="flex justify-between mt-1">
          <span>Original: ₱{service.originalPrice.toFixed(2)}</span>
          <span className="font-medium text-red-500">
            {service.discountPercentage} off: ₱{service.discountedPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="flex items-center justify-between bg-[#89C07E] text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Home icon removed from here */}
        </div>

        <div className="flex items-center space-x-4 flex-grow justify-center">
          <motion.input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button
            onClick={handleSearch}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        </div>

        <div className="flex items-center space-x-4 relative">
          <motion.div
            className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            A
          </motion.div>
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="bg-green-500 absolute top-12 right-0 text-white shadow-lg rounded-lg w-48 p-2 flex flex-col text-start"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeIn}
              >
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
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded justify-start"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
              <Menu.Button
                as="div"
                className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center cursor-pointer"
              >
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
                {
                  href: "/servicess",
                  label: "All Services",
                  icon: <Layers size={20} />,
                },
                {
                  href: "/membership",
                  label: "Memberships",
                  icon: <UserPlus size={20} />,
                },
                {
                  href: "/membership-report",
                  label: "Membership Report",
                  icon: <BarChart3 size={20} />,
                },
                {
                  href: "/items",
                  label: "Beauty Deals",
                  icon: <Tag size={20} />,
                },
                {
                  href: "/serviceorder",
                  label: "Service Acquire",
                  icon: <ClipboardList size={20} />,
                },
              ].map((link) => (
                <Menu.Item key={link.href}>
                  {({ active }) => (
                    <Link
                      href={link.href}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${active ? "bg-[#2A3F3F] text-white" : ""}`}
                    >
                      {link.icon}
                      <span className="font-normal md:font-bold">
                        {link.label}
                      </span>
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
                {
                  href: "/customers",
                  label: "Customers",
                  icon: <Users size={20} />,
                },
                {
                  href: "/invoices",
                  label: "Invoices",
                  icon: <FileText size={20} />,
                },
              ].map((link) => (
                <Menu.Item key={link.href}>
                  {({ active }) => (
                    <Link
                      href={link.href}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${active ? "bg-[#2A3F3F] text-white" : ""}`}
                    >
                      {link.icon}
                      <span className="font-normal md:font-bold">
                        {link.label}
                      </span>
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
            className="p-6 bg-white rounded-lg shadow-lg border border-gray-400"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Memberships</h2>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#5BBF5B] rounded-lg hover:bg-[#4CAF4C] text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + New Membership
              </motion.button>
            </div>

            {/* Table */}
            <div className="w-full">
              <table className="w-full border border-gray-200 mb-4 table-fixed">
                <thead>
                  <tr className="bg-green-200">
                    <th className="border px-4 py-2 text-left w-1/5">
                      Membership Name
                    </th>
                    <th className="border px-4 py-2 text-left w-1/6">
                      Discount
                    </th>
                    <th className="border px-4 py-2 text-left w-2/5">
                      Description
                    </th>
                    <th className="border px-4 py-2 text-left w-1/6">Status</th>
                    <th className="border px-4 py-2 text-center w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(memberships) &&
                    memberships.map((membership) => (
                      <motion.tr
                        key={membership.id}
                        className="border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleRowClick(membership)}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        transition={{ duration: 0.2 }}
                      >
                        <td
                          className="border px-4 py-2 truncate"
                          title={membership.name}
                        >
                          {membership.name}
                        </td>
                        <td className="border px-4 py-2">
                          {membership.discount}
                        </td>
                        <td
                          className="border px-4 py-2 truncate"
                          title={membership.description}
                        >
                          {membership.description}
                        </td>
                        <td className="border px-4 py-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              membership.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {membership.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          <div className="flex space-x-2 justify-center">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(membership.id);
                              }}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full"
                              whileHover={{
                                scale: 1.2,
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                              }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Add Membership Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Add New Membership</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Membership Type
                      </label>
                      <select
                        value={newMembership.type} // or editMembership.type for edit modal
                        onChange={(e) =>
                          setNewMembership({
                            ...newMembership,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="standard">
                          Standard (30% discount)
                        </option>
                        <option value="vip">VIP (50% discount)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        placeholder="Description"
                        value={newMembership.description}
                        onChange={(e) =>
                          setNewMembership({
                            ...newMembership,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add Membership
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Modal */}
          <AnimatePresence>
            {editMembership && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Edit Membership</h3>
                    <button
                      onClick={() => setEditMembership(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Membership Type
                      </label>
                      <select
                        value={newMembership.type} // or editMembership.type for edit modal
                        onChange={(e) =>
                          setNewMembership({
                            ...newMembership,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="standard">
                          Standard (30% discount)
                        </option>
                        <option value="vip">VIP (50% discount)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Discount{" "}
                      </label>
                      <input
                        type="text"
                        value={editMembership.discount}
                        onChange={(e) =>
                          setEditMembership({
                            ...editMembership,
                            discount: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={editMembership.description}
                        onChange={(e) =>
                          setEditMembership({
                            ...editMembership,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Status</label>
                      <select
                        value={editMembership.status}
                        onChange={(e) =>
                          setEditMembership({
                            ...editMembership,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        onClick={() => setEditMembership(null)}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save Changes
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Membership Details Modal */}
          <AnimatePresence>
            {selectedMembership && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col"
                  variants={scaleUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedMembership.name} Membership
                      </h2>
                      <p className="text-sm text-gray-600">
                        Discount: {selectedMembership.discount} | Status:
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedMembership.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {selectedMembership.status}
                        </span>
                      </p>
                    </div>
                    <motion.button
                      onClick={closeMembershipDetails}
                      className="text-gray-500 hover:text-gray-700"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={24} />
                    </motion.button>
                  </div>

                  {/* Main Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Membership Info Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 text-lg">Details</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-semibold">Description:</span>{" "}
                            {selectedMembership.description}
                          </p>
                          <p>
                            <span className="font-semibold">Created:</span>{" "}
                            {new Date().toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-semibold">Duration:</span>{" "}
                            {selectedMembership.duration || "12"} months
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={() =>
                                handleToggleActive(selectedMembership.id)
                              }
                              className={`w-full py-1 rounded-md text-sm ${
                                selectedMembership.status === "active"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              }`}
                            >
                              {selectedMembership.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 text-lg">Quick Stats</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-semibold">
                              Total Services:
                            </span>{" "}
                            {membershipServices.length}
                          </p>
                          <p>
                            <span className="font-semibold">Categories:</span>{" "}
                            {
                              Array.from(
                                new Set(
                                  membershipServices.map((s) => s.category)
                                )
                              ).length
                            }
                          </p>
                          <p>
                            <span className="font-semibold">Avg. Price:</span> ₱
                            {(
                              membershipServices.reduce(
                                (sum, s) =>
                                  sum + parseFloat(s.price.replace("₱", "")),
                                0
                              ) / membershipServices.length || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Services Main Panel */}
                    <div className="md:col-span-2 flex flex-col overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">
                          Included Services{" "}
                          <span className="text-sm font-normal">
                            ({membershipServices.length})
                          </span>
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowSummary(!showSummary)}
                            className="text-sm text-green-600 hover:underline"
                          >
                            {showSummary ? "Show Details" : "Show Summary"}
                          </button>
                        </div>
                      </div>

                      {/* Filter Controls */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        <input
                          type="text"
                          placeholder="Search services..."
                          className="px-3 py-1 border rounded-md text-sm flex-1 min-w-[200px]"
                          onChange={(e) => setSearchTerm(e.target.value)}
                          value={searchTerm}
                        />
                        <select
                          className="px-3 py-1 border rounded-md text-sm"
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          value={categoryFilter}
                        >
                          <option value="">All Categories</option>
                          {Array.from(
                            new Set(membershipServices.map((s) => s.category))
                          ).map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Services Display */}
                      <div className="flex-1 overflow-auto">
                        {isLoadingServices ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                          </div>
                        ) : showSummary ? (
                          <SummaryView
                            services={membershipServices}
                            searchTerm={searchTerm}
                            categoryFilter={categoryFilter}
                            membershipType={selectedMembership.type} 
                          />
                        ) : (
                          <DetailedView
                            services={membershipServices}
                            searchTerm={searchTerm}
                            categoryFilter={categoryFilter}
                            membershipType={selectedMembership.type}
                            currentPage={currentPage}
                            servicesPerPage={servicesPerPage}
                            setCurrentPage={setCurrentPage}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
