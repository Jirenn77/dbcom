"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import {
  Calendar,
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  Layers,
  ShoppingCart,
  Settings,
  LogOut,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  Printer,
  UserPlus,
  Tag,
  ClipboardList,
  Leaf,
  BarChart2,
  Plus,
  ShoppingBag,
  User,
  Star,
  ArrowRight,
  X,
  Search,
  List,
  Scissors,
  ClipboardCheck,
  Mail,
  ChevronDown,
} from "lucide-react";

const getStepName = (step) => {
  switch (step) {
    case 1:
      return "Customer Info";
    case 2:
      return "Service Details";
    case 3:
      return "Review";
    case 4:
      return "Confirmation";
    default:
      return "Unknown Step";
  }
};

// Simulating backend data fetch
const fetchServices = async () => {
  try {
    const response = await fetch(
      "http://localhost/API/servicegroup.php?action=get_groups_with_services"
    );
    const data = await response.json();

    // Transform backend structure to match frontend expectation
    const categories = data.map((group) => ({
      id: group.group_id,
      name: group.group_name,
      services: group.services.map((service) => ({
        id: service.service_id,
        name: service.name,
        price: parseFloat(service.price),
        duration: `${service.duration}m`,
      })),
    }));

    return { categories };
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return { categories: [] };
  }
};

export default function ServiceOrderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const [promos, setPromos] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [savedOrderData, setSavedOrderData] = useState(null);
  const [useMembership, setUseMembership] = useState(true);
  const [membershipServices, setMembershipServices] = useState([]);
  const [isLoadingMembershipServices, setIsLoadingMembershipServices] =
    useState(false);
  const [serviceCategoriesWithMembers, setServiceCategoriesWithMembers] =
    useState(serviceCategories);

  const [customerName, setCustomerName] = useState("");
  const [membershipType, setMembershipType] = useState("Standard");
  const [promoApplied, setPromoApplied] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [dealServiceMap, setDealServiceMap] = useState({});
  const [discountServiceMap, setDiscountServiceMap] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const [membershipBalance, setMembershipBalance] = useState(0);
  const [membershipExpiration, setMembershipExpiration] = useState(null);
  const [isMember, setIsMember] = useState(true);
  const premiumServiceIds = membershipServices.map((s) => s.id);
  const premiumSubtotal = selectedServices
    .filter((service) => premiumServiceIds.includes(service.id))
    .reduce((sum, service) => sum + service.price * service.quantity, 0);
  const membershipReduction = isMember ? premiumSubtotal * 0.5 : 0;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [showMembershipSignup, setShowMembershipSignup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const currentUser = { name: "Admin" }; // or hardcoded for now
  const [isCustomersLoading, setIsCustomersLoading] = useState(true);
  const [membershipTemplates, setMembershipTemplates] = useState([]);
  const [customersError, setCustomersError] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    membership: "None",
    customerId: "",
    birthday: "",
  });

  const [membershipForm, setMembershipForm] = useState({
    type: "basic",
    name: "Basic",
    fee: 3000,
    consumable: 5000,
    paymentMethod: "Cash",
  });

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setOrderNumber(`INV-${year}${month}${day}-${randomNum}`);
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsCustomersLoading(true);
      const res = await fetch("http://localhost/API/customers.php");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();

      const formatted = data.map((cust) => ({
        id: cust.id,
        name: cust.name,
        membershipType: cust.membership_status,
        isMember: cust.membership_status !== "None",
        balance: cust.membershipDetails?.remainingBalance || 0,
      }));

      setCustomers(formatted);
    } catch (err) {
      console.error(err);
      setCustomersError("Failed to load customers");
    } finally {
      setIsCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch services on component mount
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      const { categories } = await fetchServices();
      setServiceCategories(categories);
      setActiveCategory(categories[0]?.id || null);
      setIsLoading(false);
    };

    loadServices();
  }, []);

  // Update subtotal whenever selected services change
  useEffect(() => {
    setSubtotal(
      selectedServices.reduce((sum, service) => sum + service.price, 0)
    );
  }, [selectedServices]);

  const handleServiceToggle = (service) => {
    setSelectedServices((prevServices) => {
      const existingService = prevServices.find((s) => s.id === service.id);
      if (existingService) {
        return prevServices.map((s) =>
          s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
        );
      } else {
        return [...prevServices, { ...service, quantity: 1 }];
      }
    });
  };

  const removeService = (id) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setSelectedServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: newQty } : s))
    );
  };

  useEffect(() => {
    const fetchServicesForGroups = async () => {
      try {
        const response = await fetch(
          "http://localhost/API/servicegroup.php?action=get_deals_with_services"
        );
        if (!response.ok) throw new Error("Failed to fetch deals");

        const deals = await response.json();

        const dealMap = {};
        const discountMap = {};

        deals.forEach((item) => {
          if (item.type === "promo") {
            dealMap[item.id] = item.services;
          } else if (item.type === "discount") {
            discountMap[item.id] = item.services;
          }
        });

        setDealServiceMap(dealMap);
        setDiscountServiceMap(discountMap);
      } catch (err) {
        toast.error("Failed to load deal/discount services: " + err.message);
      }
    };

    fetchServicesForGroups();
  }, []);

  useEffect(() => {
    const fetchPromosAndDiscounts = async () => {
      try {
        const res = await fetch(
          "http://localhost/API/getPromosAndDiscounts.php"
        );
        const data = await res.json();
        setPromos(data.promos || []);
        setDiscounts(data.discounts || []);
      } catch (error) {
        console.error("Failed to fetch promos and discounts:", error);
      }
    };

    fetchPromosAndDiscounts();
  }, []);

  const fetchPremiumServices = async (membershipType) => {
    try {
      // Add debug logging
      console.log(`Fetching premium services for: ${membershipType}`);

      const res = await fetch(
        `http://localhost/API/servicegroup.php?action=premium_services&membership_type=${membershipType}`
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", {
          status: res.status,
          statusText: res.statusText,
          errorData,
        });
        throw new Error(
          `Failed to fetch services: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("Received services:", data);

      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        return [];
      }

      return data.map((service) => ({
        id: service.service_id,
        name: service.name,
        duration: service.duration ? `${service.duration} mins` : "N/A",
        originalPrice: parseFloat(service.originalPrice),
        price: `₱${parseFloat(service.originalPrice).toFixed(2)}`,
        discountedPrice: service.discountedPrice
          ? parseFloat(service.discountedPrice)
          : null,
        discountPercentage: service.discountPercentage || "50%",
        description: service.description || "No description available",
        category: service.category || "Uncategorized",
        membershipType: service.membershipType || membershipType,
      }));
    } catch (error) {
      console.error("Error fetching premium services:", error);
      toast.error("Failed to load services. Please try again.");
      return [];
    }
  };

  useEffect(() => {
    if (isMember && membershipType) {
      const loadServices = async () => {
        setIsLoadingMembershipServices(true);
        const data = await fetchPremiumServices(membershipType);
        setMembershipServices(data);
        setIsLoadingMembershipServices(false);
      };
      loadServices();
    }
  }, [isMember, membershipType]);

  useEffect(() => {
    const fetchMembershipTemplates = async () => {
      try {
        const res = await fetch("http://localhost/API/memberships.php");
        const data = await res.json();
        setMembershipTemplates(data);
      } catch (error) {
        console.error("Failed to fetch memberships:", error);
      }
    };

    fetchMembershipTemplates();
  }, []);

  const totalAmount = selectedServices.reduce(
    (sum, s) => sum + parseFloat(s.price),
    0
  );

  const promoReduction = promoApplied?.discountedPrice ?? 0;

  const discountReduction = (() => {
    if (!discount) return 0;
    if (discount.discount_type === "percentage") {
      return (totalAmount * discount.value) / 100;
    }
    return discount.value;
  })();

  const calculatedSubtotal = Math.max(
    selectedServices.reduce(
      (sum, service) => sum + service.price * (service.quantity || 1),
      0
    ),
    0
  );

  const confirmSave = async () => {
    if (!selectedCustomer || selectedServices.length === 0) {
      toast.warning("Please select a customer and at least one service.");
      return;
    }

    const appliedMembershipReduction =
      isMember && useMembership ? membershipReduction : 0;

    const newBalance =
      isMember && useMembership
        ? membershipBalance - appliedMembershipReduction
        : membershipBalance;

    const servicesTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    );

    const grandTotal =
      servicesTotal -
      promoReduction -
      discountReduction -
      (useMembership ? appliedMembershipReduction : 0);

    const orderData = {
      order_number: orderNumber,
      customer_id: selectedCustomer.id,
      customer_name: customerName,
      services: selectedServices.map((service) => ({
        service_id: service.id,
        name: service.name,
        price: service.price,
        quantity: service.quantity,
      })),
      subtotal: servicesTotal,
      discount: discount, // keep full object if needed for reference
      promo: promoApplied || null,
      membershipReduction: appliedMembershipReduction,
      grand_total: grandTotal,
      employee_name: currentUser?.name || "Unknown",
      is_member: isMember,
      membership_type: isMember ? membershipType : null,
      new_membership_balance: isMember ? newBalance : null,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost/API/saveAcquire.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const text = await response.text();
      setMembershipBalance(newBalance);

      try {
        const result = JSON.parse(text);
        if (result.message) {
          toast.success("Service acquired successfully!");
          setSavedOrderData(orderData);
          setCurrentStep(4);
        } else {
          toast.error(result.error || "Save failed");
        }
      } catch {
        console.error("Invalid JSON from server:", text);
        toast.error("Server returned invalid JSON");
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Network error occurred");
    }
  };

  const handleNewTransaction = () => {
    setCurrentStep(1);
    setSelectedServices([]);
    setCustomerName("");
    setSelectedCustomer(null);
    setPromoApplied("");
    setDiscount(0);
    // Generate new invoice number for next transaction
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setOrderNumber(`INV-${year}${month}${day}-${randomNum}`);
  };

  const handleClearAll = () => {
    setCustomerName("New Customer");
    setPromoApplied("");
    setDiscount(0);
    setSelectedServices([]);
    toast.info("All fields cleared");
  };

  const handleSelectCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  const handleNewCustomer = () => {
    setIsNewCustomerModalOpen(true);
    setShowMembershipSignup(false);
    setNewCustomer({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      birthday: "",
      membershipType: "Basic",
    });
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault(); // Prevent reload

    try {
      if (!newCustomer.name || !newCustomer.contact) {
        toast.error("Name and contact number are required.");
        return;
      }

      // Step 1: Add customer
      const payload = {
        name: newCustomer.name,
        phone: newCustomer.contact,
        email: newCustomer.email || null,
        address: newCustomer.address || null,
        birthday: newCustomer.birthday || null,
      };

      const response = await fetch(
        "http://localhost/API/customers.php?action=add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success || !result.customer_id) {
        toast.error(result.message || "Failed to add customer.");
        return;
      }

      toast.success("Customer added successfully!");

      // Step 2: If membership is checked, create membership right away
      if (showMembershipSignup) {
        const body = {
          customer_id: result.customer_id, // use the new customer ID from backend
          action: "availed",
          type: membershipForm.type.toLowerCase(),
          coverage: parseFloat(membershipForm.consumable),
          remaining_balance: parseFloat(membershipForm.consumable),
          payment_method: membershipForm.paymentMethod || "cash",
          note: membershipForm.description || "",
          duration: 1,
        };

        if (
          membershipForm.type === "promo" &&
          !membershipForm.noExpiration &&
          membershipForm.validTo
        ) {
          body.duration = calculateDuration(membershipForm.validTo);
        }

        const membershipRes = await fetch("http://localhost/API/members.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const membershipData = await membershipRes.json();

        if (membershipData && membershipData.id) {
          toast.success("Membership added successfully!");
        } else {
          toast.error("Customer saved, but failed to create membership.");
        }
      }

      // Reset everything
      setNewCustomer({});
      setMembershipForm({});
      setShowMembershipSignup(false);
      setIsModalOpen(false);
      setIsNewCustomerModalOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding customer.");
    }
  };

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name);
    setMembershipType(customer.membershipType);
    setIsMember(customer.isMember);
    setMembershipBalance(customer.balance); // ✅ set balance here
    setMembershipExpiration(customer.expirationDate); // ✅ set expiration
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(false);
  };

  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();

    const fullName = `${newCustomer.firstName} ${newCustomer.lastName}`.trim();

    const payload = {
      name: fullName,
      phone: newCustomer.phone,
      email: newCustomer.email,
      address: newCustomer.address || "",
      birthday: newCustomer.birthday || null,
      isMember: showMembershipSignup ? 1 : 0,
      membershipType: showMembershipSignup ? newCustomer.membershipType : null,
    };

    try {
      const response = await fetch(
        "http://localhost/API/customers.php?action=add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Customer added successfully!");
        setIsNewCustomerModalOpen(false);
        setNewCustomer({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          address: "",
          birthday: "",
          membershipType: "Standard",
        });
        setShowMembershipSignup(false);
        fetchCustomers();
      } else {
        if (
          result.message &&
          result.message.toLowerCase().includes("already exists")
        ) {
          toast.error("Duplicate customer: " + result.message);
        } else {
          toast.error(
            "Failed to add customer: " + (result.message || "Unknown error")
          );
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/home";
  };

  const filteredCategories = serviceCategories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCurrency = (amount) => {
    return `₱${(Number(amount) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <Toaster />

      {/* Enhanced Sidebar */}
            <div className="flex flex-1">
              <nav className="w-64 h-screen bg-gradient-to-b from-emerald-800 to-emerald-700 text-white flex flex-col items-start py-6 fixed top-0 left-0 shadow-lg z-10">
                {/* Logo/Branding with subtle animation */}
                <motion.div
                  className="flex items-center space-x-2 mb-8 px-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Leaf size={24} className="text-emerald-300" />
                  </div>
                  <h1 className="text-xl font-bold text-white font-sans tracking-tight">
                    Lizly Skin Care Clinic
                  </h1>
                </motion.div>
      
                {/* Search for Mobile (hidden on desktop) */}
                <div className="px-4 mb-4 w-full lg:hidden">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search menu..."
                      className="pl-10 pr-4 py-2 rounded-lg bg-emerald-900/50 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-emerald-300"
                    />
                  </div>
                </div>
      
                {/* Menu Items with Active State Highlight */}
                <div className="w-full px-4 space-y-1 overflow-y-auto flex-grow custom-scrollbar">
                  {/* Dashboard */}
                  <Menu as="div" className="relative w-full">
                    <Link href="/home" passHref>
                      <Menu.Button
                        as="div"
                        className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/home" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
                      >
                        <div
                          className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/home" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                        >
                          <Home size={18} />
                        </div>
                        <span>Dashboard</span>
                        {router.pathname === "/home2" && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          />
                        )}
                      </Menu.Button>
                    </Link>
                  </Menu>
      
                  {/* Services Dropdown - Enhanced */}
                  <Menu as="div" className="relative w-full">
                    {({ open }) => (
                      <>
                        <Menu.Button
                          className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? "bg-emerald-600" : "hover:bg-emerald-600/70"}`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`p-1.5 mr-3 rounded-lg ${open ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                            >
                              <Layers size={18} />
                            </div>
                            <span>Services</span>
                          </div>
                          <motion.div
                            animate={{ rotate: open ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-emerald-300"
                          >
                            <ChevronDown size={18} />
                          </motion.div>
                        </Menu.Button>
      
                        <AnimatePresence>
                          {open && (
                            <Menu.Items
                              as={motion.div}
                              static
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-1 ml-3 w-full bg-emerald-700/90 text-white rounded-lg shadow-lg overflow-hidden"
                            >
                              {[
                                {
                                  href: "/servicess2",
                                  label: "All Services",
                                  icon: <Layers size={16} />,
                                },
                                {
                                  href: "/membership2",
                                  label: "Memberships",
                                  icon: <UserPlus size={16} />,
                                  badge: 3,
                                },
                                {
                                  href: "/items2",
                                  label: "Beauty Deals",
                                  icon: <Tag size={16} />,
                                  badge: "New",
                                },
                                {
                                  href: "/serviceorder2",
                                  label: "Service Acquire",
                                  icon: <ClipboardList size={16} />,
                                },
                              ].map((link, index) => (
                                <Menu.Item key={link.href}>
                                  {({ active }) => (
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <Link
                                        href={link.href}
                                        className={`flex items-center justify-between space-x-3 p-3 ${active ? "bg-emerald-600" : ""} ${router.pathname === link.href ? "bg-emerald-600 font-medium" : ""}`}
                                      >
                                        <div className="flex items-center">
                                          <span
                                            className={`mr-3 ${router.pathname === link.href ? "text-white" : "text-emerald-300"}`}
                                          >
                                            {link.icon}
                                          </span>
                                          <span>{link.label}</span>
                                        </div>
                                        {link.badge && (
                                          <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${typeof link.badge === "number" ? "bg-amber-500" : "bg-emerald-500"}`}
                                          >
                                            {link.badge}
                                          </span>
                                        )}
                                      </Link>
                                    </motion.div>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </Menu>
      
                  {/* Sales Dropdown - Enhanced */}
                  <Menu as="div" className="relative w-full">
                    {({ open }) => (
                      <>
                        <Menu.Button
                          className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? "bg-emerald-600" : "hover:bg-emerald-600/70"}`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`p-1.5 mr-3 rounded-lg ${open ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                            >
                              <BarChart2 size={18} />
                            </div>
                            <span>Sales</span>
                          </div>
                          <motion.div
                            animate={{ rotate: open ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-emerald-300"
                          >
                            <ChevronDown size={18} />
                          </motion.div>
                        </Menu.Button>
      
                        <AnimatePresence>
                          {open && (
                            <Menu.Items
                              as={motion.div}
                              static
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-1 ml-3 w-full bg-emerald-700/90 text-white rounded-lg shadow-lg overflow-hidden"
                            >
                              {[
                                {
                                  href: "/customers2",
                                  label: "Customers",
                                  icon: <Users size={16} />,
                                  count: 6,
                                },
                                {
                                  href: "/invoices2",
                                  label: "Invoices",
                                  icon: <FileText size={16} />,
                                  count: 30,
                                },
                              ].map((link, index) => (
                                <Menu.Item key={link.href}>
                                  {({ active }) => (
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <Link
                                        href={link.href}
                                        className={`flex items-center justify-between space-x-3 p-3 ${active ? "bg-emerald-600" : ""} ${router.pathname === link.href ? "bg-emerald-600 font-medium" : ""}`}
                                      >
                                        <div className="flex items-center">
                                          <span
                                            className={`mr-3 ${router.pathname === link.href ? "text-white" : "text-emerald-300"}`}
                                          >
                                            {link.icon}
                                          </span>
                                          <span>{link.label}</span>
                                        </div>
                                        {link.count && (
                                          <span className="text-xs text-emerald-200">
                                            {link.count}
                                          </span>
                                        )}
                                      </Link>
                                    </motion.div>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </Menu>
                </div>
      
                {/* Enhanced Sidebar Footer */}
                <motion.div
                  className="mt-auto px-6 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="border-t border-emerald-600 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Reception User</p>
                          <p className="text-xs text-emerald-300">Receptionist</p>
                        </div>
                      </div>
                      <button className="text-emerald-300 hover:text-white transition-colors">
                        <LogOut size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-200 mt-3">
                      Lizly Skin Care Clinic v1.2.0
                    </p>
                    <p className="text-xs text-emerald-300 mt-1">
                      © {new Date().getFullYear()} All Rights Reserved
                    </p>
                  </div>
                </motion.div>
              </nav>

        {/* Main Content - Service Order */}
        <main className="flex-1 p-6 bg-gray-50 text-gray-900 ml-64">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Service Acquisition
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Process customer service purchases
                </p>
              </div>

              {/* Current step indicator for mobile */}
              <div className="md:hidden mt-4 w-full">
                <div className="flex items-center justify-center bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-sm font-medium">
                    Step {currentStep} of 4 - {getStepName(currentStep)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Indicator - Desktop */}
            <div className="hidden md:flex mb-8 relative">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <motion.div
                    className={`flex flex-col items-center ${currentStep >= step ? "text-emerald-600" : "text-gray-400"}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (step - 1) * 0.1 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        currentStep >= step
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {step}
                    </div>
                    <span className="mt-2 text-sm font-medium">
                      {getStepName(step)}
                    </span>
                  </motion.div>

                  {step < 4 && (
                    <motion.div
                      className={`flex-1 mx-2 mt-5 h-1 ${
                        currentStep > step ? "bg-emerald-600" : "bg-gray-200"
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Customer Selection */}
            {currentStep === 1 && (
              <motion.div
                className="bg-gray-50 rounded-xl p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={18} />
                  Customer Selection
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info Card */}
                  <div className="lg:col-span-2 space-y-4">
                    {customerName ? (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">
                              {customerName}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isMember
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {isMember ? "Member" : "Regular Customer"}
                              </span>
                              {isMember && membershipExpiration && (
                                <span className="text-xs text-gray-500 ml-2">
                                  Expires: {formatDate(membershipExpiration)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCustomerName("");
                              setIsMember(false);
                            }}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {isMember && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Membership Type:
                              </span>
                              <span className="font-medium">
                                {membershipType}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Remaining Balance:
                              </span>
                              <span className="font-medium text-emerald-600">
                                ₱
                                {Math.max(
                                  0,
                                  membershipBalance -
                                    (useMembership ? membershipReduction : 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* New toggle: Use membership benefits */}
                        {isMember && (
                          <div className="flex justify-between items-center text-sm mt-2">
                            <label
                              htmlFor="useMembership"
                              className="text-gray-600"
                            >
                              Use membership benefits
                            </label>
                            <input
                              id="useMembership"
                              type="checkbox"
                              checked={useMembership}
                              onChange={(e) =>
                                setUseMembership(e.target.checked)
                              }
                              className="accent-emerald-600"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-center py-4">
                          No customer selected
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.button
                        onClick={handleSelectCustomer}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Users size={18} />
                        Select Existing Customer
                      </motion.button>
                      <motion.button
                        onClick={handleNewCustomer}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <UserPlus size={18} />
                        Register New Customer
                      </motion.button>
                    </div>
                  </div>

                  {/* Membership Benefits */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Star className="mr-2 text-yellow-500" size={18} />
                      Membership Benefits
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle
                          className="flex-shrink-0 mt-0.5 mr-2 text-emerald-500"
                          size={16}
                        />
                        <span>Discounts on selected services</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle
                          className="flex-shrink-0 mt-0.5 mr-2 text-emerald-500"
                          size={16}
                        />
                        <span>Exclusive member-only services</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle
                          className="flex-shrink-0 mt-0.5 mr-2 text-emerald-500"
                          size={16}
                        />
                        <span>Priority</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle
                          className="flex-shrink-0 mt-0.5 mr-2 text-emerald-500"
                          size={16}
                        />
                        <span>Special promotions</span>
                      </li>
                    </ul>
                    {!isMember && customerName && (
                      <motion.button
                        className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowMembershipSignup(true)} // 👈 open modal here
                      >
                        Upgrade to Membership
                      </motion.button>
                    )}
                  </div>
                </div>

                <motion.div
                  className="flex justify-end mt-6 pt-4 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    disabled={!customerName}
                    onClick={() => setCurrentStep(2)}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                      customerName
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={customerName ? { scale: 1.03 } : {}}
                    whileTap={customerName ? { scale: 0.97 } : {}}
                  >
                    Continue to Services
                    <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Services Selection */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Services Selection Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Categories Column */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="font-semibold mb-4 flex items-center">
                      <List className="mr-2" size={18} />
                      Service Categories
                    </h2>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredCategories.map((category) => (
                        <motion.button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between ${
                            activeCategory === category.id
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "hover:bg-gray-50"
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span>{category.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {category.services.length}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Services Column */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <h2 className="font-semibold mb-4 flex items-center">
                        <Scissors className="mr-2" size={18} />
                        {activeCategory === "members-exclusive"
                          ? "Members Exclusive Services"
                          : "Available Services"}
                      </h2>

                      {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(activeCategory === "members-exclusive"
                            ? serviceCategories.find(
                                (cat) => cat.id === "members-exclusive"
                              )?.services || []
                            : serviceCategories.find(
                                (cat) => cat.id === activeCategory
                              )?.services || []
                          ).map((service) => (
                            <motion.div
                              key={service.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedServices.some(
                                  (s) => s.id === service.id
                                )
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-200 hover:border-emerald-300"
                              }`}
                              onClick={() => handleServiceToggle(service)}
                              whileHover={{ y: -2 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{service.name}</h3>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(service.price)}
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 mt-1">
                                {service.duration}
                              </p>

                              {isMember &&
                                membershipServices.some(
                                  (p) => p.id === service.id
                                ) && (
                                  <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                                    Membership Discount
                                  </span>
                                )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Services & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Selected Services */}
                  <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold flex items-center">
                        <ShoppingCart className="mr-2" size={18} />
                        Selected Services ({selectedServices.length})
                      </h2>
                      {selectedServices.length > 0 && (
                        <button
                          onClick={() => setSelectedServices([])}
                          className="text-sm text-red-500 hover:text-red-700 flex items-center"
                        >
                          <Trash2 className="mr-1" size={16} />
                          Clear All
                        </button>
                      )}
                    </div>

                    {selectedServices.map((service, index) => (
                      <motion.div
                        key={`${service.id}-${index}`}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeService(service.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-gray-500">
                              {serviceCategories.find((cat) =>
                                cat.services.some((s) => s.id === service.id)
                              )?.name || "General"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(service.id, service.quantity - 1)
                            }
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={service.quantity === 1}
                          >
                            -
                          </button>
                          <span>{service.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(service.id, service.quantity + 1)
                            }
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold">
                          ₱
                          {(service.price * service.quantity).toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="font-semibold mb-4 flex items-center">
                      <FileText className="mr-2" size={18} />
                      Order Summary
                    </h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(calculatedSubtotal)}
                        </span>
                      </div>

                      {promoReduction > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Promo Discount:</span>
                          <span>-{formatCurrency(promoReduction)}</span>
                        </div>
                      )}

                      {discountReduction > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(discountReduction)}</span>
                        </div>
                      )}

                      {isMember && useMembership && membershipReduction > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Membership:</span>
                          <span>-{formatCurrency(membershipReduction)}</span>
                        </div>
                      )}

                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>
                            {formatCurrency(
                              calculatedSubtotal -
                                promoReduction -
                                discountReduction -
                                (useMembership ? membershipReduction : 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Promo & Discount Section */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <Tag className="mr-2" size={16} />
                        Apply Promo/Discount
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Promo
                          </label>
                          <select
                            value={promoApplied?.id || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const selectedPromo =
                                  promos.find((p) => p.id == value) || null;
                                setPromoApplied(selectedPromo);

                                // Add discounted services from the promo
                                if (
                                  selectedPromo &&
                                  dealServiceMap[selectedPromo.id]
                                ) {
                                  const promoServices = dealServiceMap[
                                    selectedPromo.id
                                  ].map((s) => ({
                                    id: s.service_id,
                                    name: s.name,
                                    category: s.category,
                                    price: parseFloat(s.discountedPrice), // use discounted price
                                    quantity: 1,
                                  }));

                                  // Merge with existing selected services
                                  setSelectedServices((prev) => [
                                    ...prev,
                                    ...promoServices,
                                  ]);
                                }
                              } else {
                                setPromoApplied(null);
                              }
                            }}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                          >
                            <option value="">Select Promo</option>
                            {promos
                              .filter((p) => p.status === "active")
                              .map((promo) => (
                                <option key={promo.id} value={promo.id}>
                                  {promo.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Discount
                          </label>
                          <select
                            value={discount?.id || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDiscount(
                                value
                                  ? discounts.find((d) => d.id == value) || null
                                  : null
                              );
                            }}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                          >
                            <option value="">Select Discount</option>
                            {discounts
                              .filter((d) => d.status === "active")
                              .map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} (
                                  {d.discount_type === "percentage"
                                    ? `${d.value}%`
                                    : formatCurrency(d.value)}
                                  )
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-6">
                      <motion.button
                        onClick={() => setCurrentStep(3)}
                        disabled={selectedServices.length === 0}
                        className={`w-full py-2 rounded-lg ${
                          selectedServices.length > 0
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        whileHover={
                          selectedServices.length > 0 ? { scale: 1.01 } : {}
                        }
                        whileTap={
                          selectedServices.length > 0 ? { scale: 0.99 } : {}
                        }
                      >
                        Review Order
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Order Confirmation */}
            {currentStep === 3 && (
              <motion.div
                className="bg-gray-50 rounded-xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <ClipboardCheck className="mr-2" size={20} />
                  Order Confirmation
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Customer Information */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <User className="mr-2" size={16} />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{customerName}</span>
                      </div>
                      {isMember && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Membership Type:
                            </span>
                            <span className="font-medium">
                              {membershipType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Remaining Balance:
                            </span>
                            <span className="font-medium text-emerald-600">
                              ₱
                              {Math.max(
                                0,
                                membershipBalance -
                                  (useMembership ? membershipReduction : 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <FileText className="mr-2" size={16} />
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      {/* Subtotal */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            selectedServices.reduce(
                              (sum, service) =>
                                sum + service.price * service.quantity,
                              0
                            )
                          )}
                        </span>
                      </div>

                      {/* Promo */}
                      {promoApplied && (
                        <div className="flex justify-between text-blue-600">
                          <span>Promo Applied:</span>
                          <span>
                            {promoApplied.name}{" "}
                            {promoApplied.discount_type === "percentage"
                              ? `(${promoApplied.discount_value || 0}%)`
                              : promoApplied.discount_type === "fixed"
                                ? `(-₱${(promoApplied.discount_value || 0).toFixed(2)})`
                                : ""}
                          </span>
                        </div>
                      )}

                      {/* Discount */}
                      {discount && (
                        <div className="flex justify-between text-blue-600">
                          <span>Discount:</span>
                          <span>
                            {discount.name}{" "}
                            {discount.discount_type === "percentage"
                              ? `(${discount.value || 0}%)`
                              : discount.discount_type === "fixed"
                                ? `(-₱${(discount.value || 0).toFixed(2)})`
                                : ""}
                          </span>
                        </div>
                      )}

                      {/* Membership */}
                      {isMember && useMembership && membershipReduction > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Membership:</span>
                          <span>-{formatCurrency(membershipReduction)}</span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Amount:</span>
                          <span>
                            {formatCurrency(
                              selectedServices.reduce(
                                (sum, service) =>
                                  sum + service.price * service.quantity,
                                0
                              ) -
                                promoReduction -
                                discountReduction -
                                (useMembership ? membershipReduction : 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Services */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Scissors className="mr-2" size={16} />
                    Selected Services
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Service</th>
                          <th className="text-center pb-2">Qty</th>
                          <th className="text-right pb-2">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedServices.map((service, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="py-3">
                              <div className="font-medium">{service.name}</div>
                              <div className="text-xs text-gray-500">
                                {serviceCategories.find((cat) =>
                                  cat.services.some((s) => s.id === service.id)
                                )?.name || "General"}
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              {service.quantity}
                            </td>
                            <td className="py-3 text-right font-medium">
                              {formatCurrency(service.price * service.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <motion.button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={16} />
                    Back to Services
                  </motion.button>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={confirmSave}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle size={16} />
                      Place Order
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Invoice */}
            {currentStep === 4 && savedOrderData && (
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-600 mb-2">
                    Order Completed!
                  </h2>
                  <p className="text-gray-600">Thank you for your purchase</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Invoice #: {savedOrderData.order_number}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Invoice Details */}
                  <div className="bg-white shadow-sm p-5 rounded-lg border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-emerald-700">
                          Lizly Skin Care Clinic
                        </h3>
                        <p className="text-sm text-gray-500">
                          Condoy Building Room 201, Pabayo Gomez Street, CDO
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: (02) 1234-5678
                        </p>
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-lg">INVOICE</h3>
                        <p className="text-sm text-gray-500">
                          #{savedOrderData.order_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(savedOrderData.date).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-b border-gray-200 py-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          Customer:
                        </span>
                        <span className="text-gray-800">{customerName}</span>
                      </div>
                      {isMember && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Membership:</span>
                            <span className="text-gray-800">
                              {membershipType}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Remaining Balance:
                            </span>
                            <span className="text-emerald-600 font-medium">
                              ₱
                              {Math.max(
                                0,
                                membershipBalance -
                                  (useMembership ? membershipReduction : 0)
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Services */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-gray-700">
                        Services
                      </h4>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left pb-2 text-sm font-medium text-gray-500">
                              Service
                            </th>
                            <th className="text-center pb-2 text-sm font-medium text-gray-500">
                              Qty
                            </th>
                            <th className="text-right pb-2 text-sm font-medium text-gray-500 tabular-nums">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedOrderData.services.map((service, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0"
                            >
                              <td className="py-3 text-sm text-gray-800">
                                {service.name}
                              </td>
                              <td className="py-3 text-center text-sm">
                                {service.quantity}
                              </td>
                              <td className="py-3 text-sm text-right text-gray-800 tabular-nums">
                                ₱
                                {(
                                  service.price * service.quantity
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      {/* Subtotal */}
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="tabular-nums">
                          ₱
                          {savedOrderData.services
                            .reduce((sum, s) => sum + s.price * s.quantity, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>

                      {/* Promo */}
                      {promoApplied && (
                        <div className="flex justify-between text-blue-600">
                          <span>Promo Applied:</span>
                          <span>
                            {promoApplied.name}{" "}
                            {promoApplied.discount_type === "percentage"
                              ? `(${promoApplied.discount_value || 0}%)`
                              : promoApplied.discount_type === "fixed"
                                ? `(-₱${(promoApplied.discount_value || 0).toFixed(2)})`
                                : ""}
                          </span>
                        </div>
                      )}

                      {/* Discount */}
                      {savedOrderData.discount && (
                        <div className="flex justify-between text-blue-600">
                          <span>Discount:</span>
                          <span>
                            {savedOrderData.discount.name}{" "}
                            {savedOrderData.discount.discount_type ===
                            "percentage"
                              ? `(${savedOrderData.discount.value || 0}%)`
                              : savedOrderData.discount.discount_type ===
                                  "fixed"
                                ? `(-₱${(savedOrderData.discount.value || 0).toFixed(2)})`
                                : ""}
                          </span>
                        </div>
                      )}

                      {/* Membership */}
                      {isMember && useMembership && membershipReduction > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Membership:</span>
                          <span className="tabular-nums">
                            -{formatCurrency(membershipReduction)}
                          </span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between font-bold text-base">
                          <span>TOTAL:</span>
                          <span className="tabular-nums">
                            {formatCurrency(
                              savedOrderData.services.reduce(
                                (sum, s) => sum + s.price * s.quantity,
                                0
                              ) -
                                (promoReduction || 0) -
                                (discountReduction || 0) -
                                (useMembership ? membershipReduction : 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Notes */}
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                      💳 Payment Details
                    </h3>
                    <div className="space-y-4">
                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Payment Method
                        </label>
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-800 font-medium shadow-inner">
                          {savedOrderData.payment_method || "Cash"}
                        </div>
                      </div>

                      {/* Amount Paid */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Amount Paid
                        </label>
                        <div className="p-3 rounded-lg bg-gray-100 text-emerald-700 font-semibold shadow-inner">
                          {formatCurrency(
                            selectedServices.reduce(
                              (sum, service) =>
                                sum + service.price * service.quantity,
                              0
                            ) -
                              (promoApplied ? promoReduction : 0) -
                              (discount ? discountReduction : 0) -
                              (isMember && useMembership
                                ? membershipReduction
                                : 0)
                          )}
                        </div>
                      </div>

                      {/* Change */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Change
                        </label>
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-800 font-medium shadow-inner">
                          ₱0.00
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Notes
                        </label>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          rows="3"
                          placeholder="Any special instructions..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                  >
                    <Printer size={16} />
                    Print Invoice
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {}}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Mail size={16} />
                      Email Receipt
                    </button>
                    <button
                      onClick={handleNewTransaction}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      New Acqusition
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Customer Selection Modal */}
            <AnimatePresence>
              {isCustomerModalOpen && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="flex justify-between items-center border-b p-4">
                      <h3 className="text-lg font-semibold">Select Customer</h3>
                      <button
                        onClick={() => setIsCustomerModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="p-4 border-b">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Search customers by name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {isCustomersLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                        </div>
                      ) : customers.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {customers
                            .filter((customer) =>
                              customer.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((customer) => (
                              <motion.li
                                key={customer.id}
                                className="p-4 hover:bg-gray-50 cursor-pointer"
                                whileHover={{ backgroundColor: "#f9fafb" }}
                                onClick={() => handleCustomerSelect(customer)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring" }}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">
                                      {customer.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {customer.phone}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {customer.isMember ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        {customer.membershipType} Member
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Regular Customer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.li>
                            ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                          <Users className="w-12 h-12 mb-4" />
                          <p>No customers found</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t flex justify-end">
                      <button
                        onClick={() => setIsCustomerModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Membership Signup Modal */}
            <AnimatePresence>
              {showMembershipSignup && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <h4 className="font-medium text-emerald-700 flex items-center">
                        <Star className="mr-2" size={16} />
                        Membership Details
                      </h4>
                      <button
                        onClick={() => setShowMembershipSignup(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
                      {/* Membership Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Membership Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={membershipForm.type}
                          onChange={(e) => {
                            const type = e.target.value;
                            const template = membershipTemplates.find(
                              (m) => m.type === type
                            );

                            setMembershipForm({
                              ...membershipForm,
                              type,
                              name: template
                                ? template.name
                                : type === "basic"
                                  ? "Basic"
                                  : "Pro",
                              fee: template
                                ? template.price
                                : type === "basic"
                                  ? 3000
                                  : 6000,
                              consumable: template
                                ? template.consumable_amount
                                : type === "basic"
                                  ? 5000
                                  : 10000,
                              validTo:
                                template && template.valid_until
                                  ? template.valid_until
                                  : "",
                              noExpiration: template
                                ? template.no_expiration === 1
                                : false,
                            });
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="basic">
                            Basic (₱3,000 for 5,000 consumable)
                          </option>
                          <option value="pro">
                            Pro (₱6,000 for 10,000 consumable)
                          </option>
                          {membershipTemplates
                            .filter((m) => m.type === "promo")
                            .map((m) => (
                              <option key={m.id} value="promo">
                                {m.name} (Promo)
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={membershipForm.paymentMethod || ""}
                          onChange={(e) =>
                            setMembershipForm({
                              ...membershipForm,
                              paymentMethod: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        >
                          <option value="">Select Method</option>
                          <option value="Cash">Cash</option>
                          <option value="GCash">GCash</option>
                          <option value="Card">Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>

                      {/* Promo fields */}
                      {membershipForm.type === "promo" && (
                        <>
                          <div>
                            <label className="block text-sm mb-1">
                              Price (₱)
                            </label>
                            <input
                              type="number"
                              value={membershipForm.fee}
                              onChange={(e) =>
                                setMembershipForm({
                                  ...membershipForm,
                                  fee: e.target.value,
                                })
                              }
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">
                              Consumable Amount
                            </label>
                            <input
                              type="number"
                              value={membershipForm.consumable}
                              onChange={(e) =>
                                setMembershipForm({
                                  ...membershipForm,
                                  consumable: e.target.value,
                                })
                              }
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          {!membershipForm.noExpiration && (
                            <div>
                              <label className="block mb-1 text-sm">
                                Valid Until
                              </label>
                              <input
                                type="date"
                                value={membershipForm.validTo}
                                onChange={(e) =>
                                  setMembershipForm({
                                    ...membershipForm,
                                    validTo: e.target.value,
                                  })
                                }
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </form>

                    {/* Action buttons */}
                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                      <button
                        type="button"
                        onClick={() => setShowMembershipSignup(false)}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                      >
                        Register as Member
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Combined Add Customer with Membership Modal */}
            <AnimatePresence>
              {(isModalOpen || isNewCustomerModalOpen) && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 auto hide-scrollbar"
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {showMembershipSignup
                          ? "Register New Member"
                          : "Add New Customer"}
                      </h2>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setIsNewCustomerModalOpen(false);
                          setShowMembershipSignup(false);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleAddCustomer}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newCustomer.name || ""}
                            onChange={(e) =>
                              setNewCustomer({
                                ...newCustomer,
                                name: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Enter Fullname"
                            required
                          />
                        </div>

                        {/* Contact */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={
                              newCustomer.contact || newCustomer.phone || ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); // numbers only
                              setNewCustomer({
                                ...newCustomer,
                                contact: value,
                                phone: value,
                              });
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g. 09XXXXXXXXX"
                            required
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={newCustomer.email || ""}
                            onChange={(e) =>
                              setNewCustomer({
                                ...newCustomer,
                                email: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Optional"
                          />
                        </div>

                        {/* Birthday */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Birthday
                          </label>
                          <input
                            type="date"
                            value={newCustomer.birthday || ""}
                            onChange={(e) =>
                              setNewCustomer({
                                ...newCustomer,
                                birthday: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <textarea
                            value={newCustomer.address || ""}
                            onChange={(e) =>
                              setNewCustomer({
                                ...newCustomer,
                                address: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      {/* Membership Signup Section */}
                      <div className="mt-6 pt-4 border-t">
                        <label className="flex items-center cursor-pointer mb-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            checked={showMembershipSignup}
                            onChange={() =>
                              setShowMembershipSignup(!showMembershipSignup)
                            }
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Sign up for membership
                          </span>
                        </label>

                        {showMembershipSignup && (
                          <motion.div
                            className="bg-gray-50 p-6 rounded-lg space-y-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="font-medium text-emerald-700 flex items-center">
                              <Star className="mr-2" size={16} />
                              Membership Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Membership Type */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Membership Type{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={membershipForm.type}
                                  onChange={(e) => {
                                    const type = e.target.value;
                                    const template = membershipTemplates.find(
                                      (m) => m.type === type
                                    );

                                    setMembershipForm({
                                      ...membershipForm,
                                      type,
                                      name: template
                                        ? template.name
                                        : type === "basic"
                                          ? "Basic"
                                          : "Pro",
                                      fee: template
                                        ? template.price
                                        : type === "basic"
                                          ? 3000
                                          : 6000,
                                      consumable: template
                                        ? template.consumable_amount
                                        : type === "basic"
                                          ? 5000
                                          : 10000,
                                      validTo:
                                        template && template.valid_until
                                          ? template.valid_until
                                          : "",
                                      noExpiration: template
                                        ? template.no_expiration === 1
                                        : false,
                                    });
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="basic">
                                    Basic (₱3,000 for 5,000 consumable)
                                  </option>
                                  <option value="pro">
                                    Pro (₱6,000 for 10,000 consumable)
                                  </option>
                                  {membershipTemplates
                                    .filter((m) => m.type === "promo")
                                    .map((m) => (
                                      <option key={m.id} value="promo">
                                        {m.name} (Promo)
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {/* Payment Method */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Payment Method{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={membershipForm.paymentMethod || ""}
                                  onChange={(e) =>
                                    setMembershipForm({
                                      ...membershipForm,
                                      paymentMethod: e.target.value,
                                    })
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  required
                                >
                                  <option value="">Select Method</option>
                                  <option value="Cash">Cash</option>
                                  <option value="GCash">GCash</option>
                                  <option value="Card">Card</option>
                                  <option value="Bank Transfer">
                                    Bank Transfer
                                  </option>
                                </select>
                              </div>

                              {/* Promo fields */}
                              {membershipForm.type === "promo" && (
                                <>
                                  <div>
                                    <label className="block text-sm mb-1">
                                      Price (₱)
                                    </label>
                                    <input
                                      type="number"
                                      value={membershipForm.fee}
                                      onChange={(e) =>
                                        setMembershipForm({
                                          ...membershipForm,
                                          fee: e.target.value,
                                        })
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm mb-1">
                                      Consumable Amount
                                    </label>
                                    <input
                                      type="number"
                                      value={membershipForm.consumable}
                                      onChange={(e) =>
                                        setMembershipForm({
                                          ...membershipForm,
                                          consumable: e.target.value,
                                        })
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  {!membershipForm.noExpiration && (
                                    <div>
                                      <label className="block mb-1 text-sm">
                                        Valid Until
                                      </label>
                                      <input
                                        type="date"
                                        value={membershipForm.validTo}
                                        onChange={(e) =>
                                          setMembershipForm({
                                            ...membershipForm,
                                            validTo: e.target.value,
                                          })
                                        }
                                        className="w-full p-2 border rounded"
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-8 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            setIsNewCustomerModalOpen(false);
                            setShowMembershipSignup(false);
                          }}
                          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                          {showMembershipSignup
                            ? "Register as Member"
                            : "Save Customer"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
