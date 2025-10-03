-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2025 at 08:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbcom`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `email`, `password`, `role`) VALUES
(1, 'admin@gmail.com', 'password123', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color_code` varchar(7) DEFAULT '#3B82F6',
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `manager` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `color_code`, `address`, `contact_number`, `manager`) VALUES
(1, 'Pabayo Gomez Street', '#3B82F6', 'Condoy Building Room 201, Pabayo Gomez Street, CDO', NULL, NULL),
(2, 'Gingoog City', '#10B981', 'CV Lugod Street, Gingoog City', NULL, NULL),
(3, 'Patag, CDO', '#F59E0B', 'Zone-1 Crossing Camp Evangelista,\r\nGwen\'s Place 3rd Door Patag, CDO', NULL, NULL),
(4, 'Bukidnon', '#EF4444', 'Ostrea Buildng Door 2, L Binauro Street Tankulan Manolo Fortich Bukidnon', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `service_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `membership_status` varchar(20) DEFAULT 'None',
  `customerId` varchar(20) DEFAULT NULL,
  `birthday` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `contact`, `email`, `address`, `membership_status`, `customerId`, `birthday`) VALUES
(1, 'Victoria', '+639 053 2322', 'victoria_13@gmail.com', '123 Main St, Anytown', 'PRO', '110234', '1997-03-23'),
(2, 'Shane', '+639 053 2324', 'shane@gmail.com', '456 Elm St, Othertown', 'None', '110424', '1990-04-15'),
(3, 'Alice', '+639 034 2324', 'alice@gmail.com', '789 Oak St, Somewhere', 'Basic', '122324', '1985-12-05'),
(4, 'Princess Smith', '0917-456-7890', NULL, '123 Mabini Street, Barangay Malinis, Quezon City, Metro Manila, Philippines', 'None', NULL, NULL),
(5, 'Sofia Mendoza', '09085671234', NULL, '89 Luna Street, Barangay Santa Cruz, Manila City', 'None', NULL, '1987-07-19'),
(6, 'Katrina Ramos', '09123335555', NULL, '102 Aquino Street, Barangay Malinta, Valenzuela City', 'None', NULL, '1997-07-20');

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `discount_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `value` decimal(5,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`discount_id`, `name`, `description`, `discount_type`, `value`, `status`) VALUES
(1, 'Holloween Discount', 'Input customers', '', 0.00, 'inactive'),
(2, 'Holiday Discount', '10% off', 'percentage', 10.00, 'active'),
(3, 'Birthday Discount', 'Special for birthdays', 'percentage', 15.00, 'active'),
(4, 'Loyalty Discount', 'For loyal customers', '', 100.00, 'active'),
(5, 'Discount Test', 'Test', 'percentage', 20.00, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `service` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `contact_details` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `branch_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `service`, `email`, `phone`, `hire_date`, `contact_details`, `status`, `branch_id`, `created_at`, `updated_at`) VALUES
(1, 'Maria Santos', 'Dermatologist', 'maria.santos@lizlyclinic.com', '09171234567', '2020-05-15', '123 Pabayo Gomez Street, Cagayan de Oro', 'Active', 1, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(2, 'Juan Dela Cruz', 'Aesthetician', 'juan.delacruz@lizlyclinic.com', '09172345678', '2021-02-20', '456 CV Lugod Street, Gingoog City', 'Active', 2, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(3, 'Sophia Rodriguez', 'Laser Technician', 'sophia.rodriguez@lizlyclinic.com', '09173456789', '2019-11-10', '789 Patag Road, Cagayan de Oro', 'Active', 3, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(4, 'Miguel Lopez', 'Receptionist', 'miguel.lopez@lizlyclinic.com', '09174567890', '2022-01-05', '321 Tankulan, Manolo Fortich, Bukidnon', 'Active', 4, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(5, 'Andrea Reyes', 'Nurse', 'andrea.reyes@lizlyclinic.com', '09175678901', '2020-08-30', '234 Pabayo Gomez Street, Cagayan de Oro', 'Active', 1, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(6, 'Carlos Lim', 'Accountant', 'carlos.lim@lizlyclinic.com', '09176789012', '2021-06-18', '567 CV Lugod Street, Gingoog City', 'Active', 2, '2025-08-11 12:11:43', '2025-08-11 12:11:43'),
(13, 'Carmen Sy', 'Beauty Therapist', 'carmen.sy@lizlyclinic.com', '09173456789', '2020-10-25', '456 Pabayo Gomez Street, Cagayan de Oro', 'Inactive', 1, '2025-08-11 12:11:43', '2025-08-11 12:11:43');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `quantity_in_hand` int(11) NOT NULL,
  `quantity_to_be_received` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int(11) NOT NULL,
  `invoice_number` varchar(20) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `invoice_date` datetime NOT NULL DEFAULT current_timestamp(),
  `quantity` int(11) DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `invoice_number`, `customer_id`, `service_id`, `invoice_date`, `quantity`, `total_price`, `status`, `notes`) VALUES
(1, '112344', 1, 24, '2025-02-26 00:00:00', 1, 150.00, 'Paid', NULL),
(2, '112344', 1, 2, '2025-02-26 00:00:00', 1, 1299.00, 'Paid', NULL),
(3, '132325', 2, 10, '2025-02-25 00:00:00', 1, 120.00, 'Paid', NULL),
(4, '132325', 2, 11, '2025-02-25 00:00:00', 1, 150.00, 'Paid', NULL),
(5, '122325', 3, 0, '2025-02-20 00:00:00', 1, 1000.00, 'Paid', NULL),
(9, 'INV-20250618-8432', 1, 10, '2025-06-18 00:00:00', 1, 120.00, 'Paid', NULL),
(10, 'INV-20250618-8432', 1, 11, '2025-06-18 00:00:00', 1, 150.00, 'Paid', NULL),
(12, 'INV-20250716-3923', 2, 83, '2025-07-16 00:00:00', 1, 99.00, 'Paid', NULL),
(13, 'INV-20250716-3425', 2, 83, '2025-07-16 00:00:00', 1, 99.00, 'Paid', NULL),
(14, 'INV-20250716-3625', 2, 82, '2025-07-16 00:00:00', 1, 99.00, 'Paid', NULL),
(15, 'INV-20250716-4754', 2, 21, '2025-07-16 00:00:00', 1, 399.00, 'Paid', NULL),
(16, 'INV-20250716-7763', 2, 71, '2025-07-16 00:00:00', 1, 599.00, 'Paid', NULL),
(17, 'INV-20250716-3923', 1, 84, '2025-07-16 00:00:00', 1, 198.00, 'Paid', NULL),
(18, 'INV-20250716-3923', 1, 2, '2025-07-16 00:00:00', 1, 1299.00, 'Paid', NULL),
(19, 'INV-20250723-8280', 1, 35, '2025-07-23 00:00:00', 1, 799.00, 'Paid', NULL),
(20, 'INV-20250723-8280', 1, 4, '2025-07-23 00:00:00', 1, 1499.00, 'Paid', NULL),
(21, 'INV-20250723-8280', 1, 9, '2025-07-23 00:00:00', 1, 4999.00, 'Paid', NULL),
(22, 'INV-20250723-1849', 1, 34, '2025-07-23 00:00:00', 1, 499.00, 'Paid', NULL),
(23, 'INV-20250723-1849', 1, 35, '2025-07-23 00:00:00', 1, 799.00, 'Paid', NULL),
(24, 'INV-20250723-1849', 1, 8, '2025-07-23 00:00:00', 1, 1499.00, 'Paid', NULL),
(25, 'INV-20250723-1849', 1, 81, '2025-07-23 00:00:00', 1, 599.00, 'Paid', NULL),
(26, 'INV-20250723-8378', 1, 83, '2025-07-23 00:00:00', 1, 99.00, 'Paid', NULL),
(27, 'INV-20250723-8378', 1, 84, '2025-07-23 00:00:00', 1, 198.00, 'Paid', NULL),
(28, 'INV-20250725-3786', 1, 18, '2025-07-25 00:00:00', 1, 799.00, 'Paid', NULL),
(29, 'INV-20250725-3786', 1, 17, '2025-07-25 00:00:00', 1, 999.00, 'Paid', NULL),
(30, 'INV-20250730-2391', 3, 81, '2025-07-30 00:00:00', 1, 599.00, 'Paid', NULL),
(31, 'INV-20250807-5043', 3, 85, '2025-08-07 00:00:00', 1, 499.00, 'Paid', NULL),
(60, 'INV-20250809-0158', 3, 82, '2025-08-09 00:00:00', 2, 198.00, 'Paid', NULL),
(61, 'INV-20250809-0158', 3, 83, '2025-08-09 00:00:00', 1, 99.00, 'Paid', NULL),
(62, 'INV-20250809-5687', 3, 87, '2025-08-09 00:00:00', 2, 298.00, 'Paid', NULL),
(63, 'INV-20250824-7261', 6, 8, '2025-08-24 00:00:00', 1, 749.50, 'Paid', NULL),
(64, 'INV-20250824-7261', 6, 7, '2025-08-24 00:00:00', 1, 349.50, 'Paid', NULL),
(65, 'INV-20250824-7261', 6, 1, '2025-08-24 00:00:00', 1, 199.50, 'Paid', NULL),
(66, 'INV-20250824-2744', 4, 8, '2025-08-24 00:00:00', 1, 749.50, 'Paid', NULL),
(67, 'INV-20250824-2744', 4, 7, '2025-08-24 00:00:00', 1, 349.50, 'Paid', NULL),
(68, 'INV-20250824-2744', 4, 1, '2025-08-24 00:00:00', 1, 199.50, 'Paid', NULL),
(69, 'INV-20250824-2744', 4, 3, '2025-08-24 00:00:00', 1, 199.50, 'Paid', NULL),
(70, 'INV-20250825-4156', 5, 8, '2025-08-25 00:00:00', 1, 749.50, 'Paid', NULL),
(71, 'INV-20250825-4156', 5, 2, '2025-08-25 00:00:00', 1, 649.50, 'Paid', NULL),
(72, 'INV-20250825-4156', 5, 7, '2025-08-25 00:00:00', 1, 349.50, 'Paid', NULL),
(73, 'INV-20250825-4156', 5, 1, '2025-08-25 04:29:00', 1, 199.50, 'Paid', NULL),
(74, 'INV-20250902-4514', 6, 8, '2025-09-02 00:00:00', 1, 749.50, 'Paid', NULL),
(75, 'INV-20250902-4514', 6, 7, '2025-09-02 00:00:00', 1, 349.50, 'Paid', NULL),
(76, 'INV-20250902-4514', 6, 1, '2025-09-02 00:00:00', 1, 199.50, 'Paid', NULL),
(77, '112344', 1, 24, '2025-09-02 10:29:55', 1, 150.00, 'Paid', NULL),
(78, 'INV-20250902-5243', 5, 45, '2025-09-02 00:00:00', 1, 199.00, 'Paid', NULL),
(79, 'INV-20250902-5243', 5, 34, '2025-09-02 00:00:00', 1, 499.00, 'Paid', NULL),
(80, 'INV-20250902-0688', 6, 81, '2025-09-02 00:00:00', 1, 599.00, 'Paid', NULL),
(81, 'INV-20250902-2796', 4, 75, '2025-09-02 00:00:00', 1, 499.00, 'Paid', NULL),
(82, 'INV-20250902-2796', 4, 48, '2025-09-02 00:00:00', 1, 99.00, 'Paid', NULL),
(83, 'INV-20250902-3276', 4, 54, '2025-09-02 00:00:00', 1, 149.00, 'Paid', NULL),
(84, 'INV-20250902-3276', 4, 48, '2025-09-02 00:00:00', 1, 99.00, 'Paid', NULL),
(85, 'INV-20250902-4192', 3, 67, '2025-09-02 00:00:00', 1, 99.00, 'Paid', NULL),
(86, 'INV-20250902-4192', 3, 69, '2025-09-02 00:00:00', 1, 199.00, 'Paid', NULL),
(87, 'INV-20250902-2083', 5, 84, '2025-09-02 00:00:00', 1, 198.00, 'Paid', NULL),
(88, 'INV-20250902-2083', 5, 88, '2025-09-02 00:00:00', 1, 149.00, 'Paid', NULL),
(89, 'INV-20250902-8745', 2, 83, '2025-09-02 00:00:00', 1, 99.00, 'Paid', NULL),
(90, 'INV-20250902-8745', 2, 88, '2025-09-02 00:00:00', 1, 149.00, 'Paid', NULL),
(91, 'INV-20250902-8745', 2, 84, '2025-09-02 00:00:00', 1, 198.00, 'Paid', NULL),
(92, 'INV-20250902-9655', 6, 88, '2025-09-02 00:00:00', 1, 149.00, 'Paid', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_service`
--

CREATE TABLE `invoice_service` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_service`
--

INSERT INTO `invoice_service` (`id`, `invoice_id`, `service_id`, `quantity`) VALUES
(1, 2, 3, NULL),
(2, 2, 5, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `stockQty` int(11) NOT NULL,
  `service` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `supplier` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `category`, `type`, `stockQty`, `service`, `description`, `unitPrice`, `supplier`) VALUES
(3, 'Loreal Paris Elvive', 'Hair Product', 'Hair Services', 45, 'Hair Treatment', 'Professional hair care product', 395.00, 'James'),
(4, 'GiGi Honee Wax', 'Skincare Product', 'Underarm Services', 56, 'Waxing Service', 'Professional waxing product', 18.50, 'SkinCare Solutions'),
(5, 'Kerazon Brazilian Hair', 'Hair Product', 'Hair Services', 56, 'Hair Extension', 'High-quality Brazilian hair', 120.00, 'Hair World'),
(6, 'Majestic Hair Botox', 'Hair Product', 'Hair Services', 56, 'Hair Treatment', 'Professional hair botox treatment', 85.00, 'Luxury Hair Care'),
(9, 'Loreal Paris Elvive', 'Hair Product', 'Hair Services', 45, 'Hair Treatment', 'Professional hair care product', 395.00, 'James');

-- --------------------------------------------------------

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `discount` varchar(10) NOT NULL,
  `description` text NOT NULL,
  `duration` int(11) NOT NULL DEFAULT 30,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `type` enum('basic','pro','promo') NOT NULL DEFAULT 'basic',
  `consumable_amount` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `no_expiration` tinyint(1) NOT NULL DEFAULT 1,
  `valid_until` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`id`, `name`, `discount`, `description`, `duration`, `status`, `created_at`, `type`, `consumable_amount`, `price`, `no_expiration`, `valid_until`) VALUES
(1, 'Pro', '50%', 'Priority services and bigger discounts', 12, 'active', '2025-05-30 13:11:54', 'pro', 10000, 6000.00, 1, NULL),
(2, 'Basic', '50%', 'Affordable benefits for loyal clients', 12, 'active', '2025-05-30 13:11:54', 'basic', 5000, 3000.00, 1, NULL),
(3, 'Promo', '50%', 'Membership Promo for 10 exclusive Customers', 30, 'active', '2025-07-26 07:02:42', 'promo', 20000, 6000.00, 0, '2025-07-31');

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `coverage` decimal(10,2) DEFAULT 0.00,
  `remaining_balance` decimal(10,2) DEFAULT 0.00,
  `date_registered` date DEFAULT NULL,
  `expire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`id`, `customer_id`, `type`, `coverage`, `remaining_balance`, `date_registered`, `expire_date`) VALUES
(1, 1, 'PRO', 10000.00, 6969.00, '2025-08-04', NULL),
(2, 3, 'Basic', 5000.00, 4701.00, '2025-08-04', NULL),
(5, 5, 'Basic', 5000.00, 4026.00, '2025-08-18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `membership_logs`
--

CREATE TABLE `membership_logs` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `membership_id` int(11) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `timestamp` datetime NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `performed_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_logs`
--

INSERT INTO `membership_logs` (`id`, `customer_id`, `membership_id`, `action`, `type`, `amount`, `payment_method`, `timestamp`, `branch_id`, `performed_by`) VALUES
(1, 3, 2, 'Availed', 'basic', 5000.00, 'Cash', '2025-08-04 05:53:58', NULL, NULL),
(3, 1, 1, 'renewed', 'pro', 10000.00, 'cash', '2025-08-04 14:15:39', NULL, NULL),
(5, 3, 2, 'renewed', 'basic', 5000.00, 'cash', '2025-08-04 14:25:07', NULL, NULL),
(15, 5, 5, 'Availed', 'basic', 5000.00, 'GCash', '2025-08-18 12:48:42', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `order_date` datetime NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `customer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `branch_id`, `service_id`, `order_date`, `amount`, `customer_id`) VALUES
(1, 1, 1, '2025-05-20 11:39:39', 500.00, NULL),
(2, 1, 1, '2025-05-20 11:39:39', 500.00, NULL),
(3, 2, 2, '2025-05-20 11:39:39', 1000.00, NULL),
(4, 3, 3, '2025-05-20 11:39:39', 800.00, NULL),
(5, 1, 1, '2025-05-19 11:39:39', 500.00, NULL),
(6, 2, 2, '2025-05-13 11:39:39', 1000.00, NULL),
(9, 1, 1, '2025-06-01 00:00:00', 150.00, NULL),
(10, 1, 2, '2025-06-01 00:00:00', 250.00, NULL),
(11, 2, 3, '2025-06-01 00:00:00', 100.00, NULL),
(12, 1, 1, '2025-05-31 00:00:00', 150.00, NULL),
(13, 2, 2, '2025-05-29 00:00:00', 200.00, NULL),
(14, 3, 3, '2025-05-27 00:00:00', 300.00, NULL),
(15, 1, 1, '2025-06-01 00:00:00', 200.00, NULL),
(16, 1, 1, '2025-06-01 00:00:00', 200.00, NULL),
(17, 1, 2, '2025-06-01 00:00:00', 300.00, NULL),
(18, 2, 3, '2025-06-01 00:00:00', 180.00, NULL),
(19, 2, 3, '2025-06-01 00:00:00', 180.00, NULL),
(20, 2, 3, '2025-06-01 00:00:00', 180.00, NULL),
(21, 2, 4, '2025-06-01 00:00:00', 250.00, NULL),
(22, 3, 5, '2025-06-01 00:00:00', 150.00, NULL),
(28, 1, 5, '2025-05-29 00:00:00', 104.59, NULL),
(43, 1, 1, '2025-07-14 13:03:39', 999.99, NULL),
(44, 1, 1, '2025-07-14 13:13:42', 888.88, NULL),
(45, 1, 6, '2025-07-14 13:18:35', 500.00, NULL),
(46, 1, 7, '2025-07-14 13:18:35', 450.00, NULL),
(47, 1, 8, '2025-07-14 13:18:35', 420.00, NULL),
(48, 1, 9, '2025-07-14 13:18:35', 399.00, NULL),
(49, 1, 10, '2025-07-14 13:18:35', 370.00, NULL),
(50, 1, 11, '2025-07-14 13:18:35', 350.00, NULL),
(51, 1, 1, '2025-07-14 20:30:02', 500.00, NULL),
(52, 2, 2, '2025-07-14 20:48:03', 800.00, NULL),
(53, 3, 3, '2025-07-14 20:48:03', 300.00, NULL),
(54, 4, 4, '2025-07-14 20:48:07', 100.00, NULL),
(55, 3, 3, '2025-07-12 20:55:15', 300.00, NULL),
(56, 4, 4, '2025-06-29 20:55:18', 100.00, NULL),
(57, 1, 2, '2025-02-10 10:00:00', 700.00, NULL),
(58, 2, 3, '2025-03-05 14:00:00', 900.00, NULL),
(59, 3, 4, '2025-04-20 12:30:00', 600.00, NULL),
(60, 1, 1, '2025-07-14 21:06:26', 500.00, NULL),
(61, 2, 2, '2025-07-12 21:06:26', 750.00, NULL),
(62, 3, 3, '2025-07-07 21:06:26', 300.00, NULL),
(63, 4, 4, '2025-06-14 21:06:26', 200.00, NULL),
(64, 1, 2, '2025-02-15 13:00:00', 600.00, NULL),
(65, 1, 1, '2025-07-15 11:23:59', 500.00, NULL),
(66, 2, 2, '2025-07-15 11:23:59', 800.00, NULL),
(67, 3, 3, '2025-07-15 11:23:59', 300.00, NULL),
(69, 1, 87, '2025-08-09 15:22:49', 298.00, 3),
(70, 1, 8, '2025-08-24 13:56:21', 749.50, 6),
(71, 1, 7, '2025-08-24 13:56:21', 349.50, 6),
(72, 1, 1, '2025-08-24 13:56:21', 199.50, 6),
(73, 1, 8, '2025-08-24 14:52:44', 749.50, 4),
(74, 1, 7, '2025-08-24 14:52:44', 349.50, 4),
(75, 1, 1, '2025-08-24 14:52:44', 199.50, 4),
(76, 1, 3, '2025-08-24 14:52:44', 199.50, 4),
(77, 1, 8, '2025-08-25 09:29:33', 749.50, 5),
(78, 1, 2, '2025-08-25 09:29:33', 649.50, 5),
(79, 1, 7, '2025-08-25 09:29:33', 349.50, 5),
(80, 1, 1, '2025-08-25 09:29:33', 199.50, 5),
(81, 1, 8, '2025-09-02 04:07:21', 749.50, 6),
(82, 1, 7, '2025-09-02 04:07:21', 349.50, 6),
(83, 1, 1, '2025-09-02 04:07:21', 199.50, 6),
(84, 1, 45, '2025-09-02 04:31:28', 199.00, 5),
(85, 1, 34, '2025-09-02 04:31:28', 499.00, 5),
(86, 1, 81, '2025-09-02 04:43:13', 599.00, 6),
(87, 1, 75, '2025-09-02 04:50:18', 499.00, 4),
(88, 1, 48, '2025-09-02 04:50:18', 99.00, 4),
(89, 1, 54, '2025-09-02 04:57:24', 149.00, 4),
(90, 1, 48, '2025-09-02 04:57:24', 99.00, 4),
(91, 1, 67, '2025-09-02 05:10:47', 99.00, 3),
(92, 1, 69, '2025-09-02 05:10:47', 199.00, 3),
(93, 1, 84, '2025-09-02 05:33:00', 198.00, 5),
(94, 1, 88, '2025-09-02 05:33:00', 149.00, 5),
(95, 1, 83, '2025-09-02 05:44:58', 99.00, 2),
(96, 1, 88, '2025-09-02 05:44:58', 149.00, 2),
(97, 1, 84, '2025-09-02 05:44:58', 198.00, 2),
(98, 1, 88, '2025-09-02 05:47:18', 149.00, 6);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `PaymentID` int(11) NOT NULL,
  `InvoiceID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`PaymentID`, `InvoiceID`, `CustomerID`, `Amount`, `PaymentDate`) VALUES
(1, 3, 1, 840.00, '2024-10-21 12:48:45'),
(2, 7, 1, 19795.00, '2024-10-21 21:26:27'),
(16, 13, 1, 990.00, '2024-10-22 11:38:04'),
(17, 13, 1, 100.00, '2024-10-22 12:21:43'),
(18, 13, 1, 100.00, '2024-10-24 00:12:23');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(255) NOT NULL,
  `Price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`ProductID`, `ProductName`, `Price`) VALUES
(1, 'Gaming Laptop', 50499.00),
(2, 'Mechanical Keyboard', 1500.00),
(3, 'Gaming Mouse', 1000.00),
(4, '27-inch Monitor', 9290.00),
(5, 'External Hard Drive 1TB', 2900.00),
(6, 'Wireless Headset', 2599.00),
(7, 'USB-C Docking Station', 899.00),
(8, 'Graphics Card NVIDIA RTX 3060', 19795.00),
(9, '32GB RAM DDR4', 15094.00),
(10, 'Intel i7 Processor', 16840.00),
(11, 'Gaming Chair', 27990.00),
(12, 'Webcam 1080p', 2500.00),
(13, 'Microphone USB', 1500.00),
(14, 'Office Desk', 5000.00),
(15, 'Laptop Backpack', 1500.00);

-- --------------------------------------------------------

--
-- Table structure for table `promos`
--

CREATE TABLE `promos` (
  `promo_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `discount_type` enum('fixed','percentage') DEFAULT 'fixed',
  `discount_value` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promos`
--

INSERT INTO `promos` (`promo_id`, `type`, `name`, `description`, `valid_from`, `valid_to`, `status`, `discount_type`, `discount_value`) VALUES
(1, 'Membership', 'Facial Spa + Footspa', 'Bundled Promo', '2025-01-10', '2025-01-25', 'inactive', 'fixed', 0.00),
(2, 'Laser Promos', 'Diode Laser ', 'Diode Laser 50% Discounted Price', '2025-08-20', '2025-08-31', 'active', 'percentage', 50.00),
(3, 'Skincare', 'Facial + Diamond Peel', 'Glow-up bundle', '2025-02-01', '2025-02-15', 'active', 'fixed', 0.00),
(4, 'Massage Deals', 'Loyalty Discount', 'For loyal customers', '1970-01-01', '1970-01-01', 'inactive', 'fixed', 0.00),
(6, 'Test Promo', 'Test', 'Testing', '2025-09-04', '2025-09-11', 'active', 'percentage', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `sales_activity`
--

CREATE TABLE `sales_activity` (
  `id` int(11) NOT NULL,
  `type` enum('to_be_packed','to_be_shipped','to_be_delivered','to_be_invoiced') DEFAULT NULL,
  `count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `name`, `price`, `description`, `duration`, `category`) VALUES
(0, 'Full Body Massage', 1000.00, 'Relaxing full-body massage session', 90, 'Body Treatment'),
(1, 'UA Diode Laser', 399.00, 'Permanent hair reduction for small areas like underarms', 30, 'Diode Laser'),
(2, 'Face', 1299.00, 'Full face hair removal using diode laser technology', 45, 'Diode Laser'),
(3, 'Upper Lip', 399.00, 'Precise upper lip hair removal', 15, 'Diode Laser'),
(4, 'Arms', 1499.00, 'Complete arm hair removal treatment', 60, 'Diode Laser'),
(5, 'Lower Lip', 399.00, 'Lower lip and chin area hair removal', 15, 'Diode Laser'),
(6, 'Legs', 1499.00, 'Full leg hair removal treatment', 90, 'Diode Laser'),
(7, 'Mustache', 699.00, 'Mustache area permanent hair reduction', 20, 'Diode Laser'),
(8, 'Brazilian', 1499.00, 'Complete intimate area hair removal', 60, 'Diode Laser'),
(9, 'All Parts Diode Laser', 4999.00, 'Full body diode laser hair removal package', 180, 'Diode Laser'),
(10, 'Classic Manicure', 120.00, 'Basic nail trimming, shaping, and polishing', 30, 'Nails & Foot'),
(11, 'Classic Pedicure', 150.00, 'Basic foot care including nail trimming and callus removal', 45, 'Nails & Foot'),
(12, 'Luxury Manicure Gel Polish', 299.00, 'Premium manicure with long-lasting gel polish', 60, 'Nails & Foot'),
(13, 'Luxury Pedicure Gel Polish', 349.00, 'Deluxe pedicure with gel polish application', 75, 'Nails & Foot'),
(14, 'Classic Foot Spa', 299.00, 'Relaxing foot soak with massage and basic care', 45, 'Nails & Foot'),
(15, 'Premium Foot Spa with Whitening', 499.00, 'Advanced foot treatment with whitening effects', 90, 'Nails & Foot'),
(16, 'Hair Rebond', 999.00, 'Chemical straightening treatment for frizzy hair', 180, 'Hair Treatments'),
(17, 'Hair Botox Treatment', 999.00, 'Deep conditioning treatment that repairs damaged hair', 120, 'Hair Treatments'),
(18, 'Brazilian Blowout', 799.00, 'Smoothing treatment that reduces frizz', 150, 'Hair Treatments'),
(19, 'Hair Detox Treatment', 499.00, 'Removes product buildup and impurities from hair', 60, 'Hair Treatments'),
(21, 'Hair Cellophane', 399.00, 'Semi-permanent color treatment with conditioning', 90, 'Hair Treatments'),
(22, 'Hair Spa', 399.00, 'Relaxing hair and scalp treatment with massage', 60, 'Hair Treatments'),
(23, 'Haircolor', 599.00, 'Professional hair coloring service', 120, 'Basic Hair Services'),
(24, 'Haircut/Style', 150.00, 'Custom haircut and styling', 45, 'Basic Hair Services'),
(25, 'Hair Iron', 200.00, 'Professional straightening/ironing service', 60, 'Basic Hair Services'),
(26, 'Top Highlights', 599.00, 'Partial highlighting for dimension', 90, 'Basic Hair Services'),
(27, 'Classic Balayage', 1499.00, 'Hand-painted highlighting technique', 180, 'Basic Hair Services'),
(28, '3D Balayage', 2499.00, 'Advanced dimensional balayage technique', 210, 'Basic Hair Services'),
(29, 'Hair Bleaching', 599.00, 'Lightening service for dark hair', 120, 'Basic Hair Services'),
(30, 'Hair Protein Straight Bond (Short)', 1999.00, 'Advanced straightening treatment for short hair', 150, 'Hair Treatments'),
(31, 'Eyebag Treatment', 399.00, NULL, 30, 'Special Treatments'),
(32, 'Melasma Treatment PS', 999.00, NULL, 45, 'Special Treatments'),
(33, 'Scar Treatment PS', 999.00, NULL, 45, 'Special Treatments'),
(34, 'Body Massage', 499.00, NULL, 60, 'Body & Relaxing Services'),
(35, 'Moisturizing Body Scrub', 799.00, NULL, 60, 'Body & Relaxing Services'),
(36, 'Body Whitening Mask', 1499.00, NULL, 60, 'Body & Relaxing Services'),
(37, 'Black Doll Carbon Peel Laser', 999.00, NULL, 45, 'Laser Treatment Services'),
(38, 'Pico Laser', 999.00, NULL, 45, 'Laser Treatment Services'),
(39, 'Leg Carbon Peel Laser', 999.00, NULL, 60, 'Laser Treatment Services'),
(40, 'Cauterization Services Warts/Milia/Syringoma Removal', 999.00, NULL, NULL, 'Laser Treatment Services'),
(41, 'Tattoo Removal Price Starts', 499.00, NULL, NULL, 'Laser Treatment Services'),
(42, 'Eyelash Extension Natural Look', 299.00, NULL, 60, 'Lashes & Brows Services'),
(43, 'Eyelash Extension Volume Look', 599.00, NULL, 75, 'Lashes & Brows Services'),
(44, 'Eyelash Extension Cat-Eye Look', 699.00, NULL, 75, 'Lashes & Brows Services'),
(45, 'Eyelash Perming', 199.00, NULL, 30, 'Lashes & Brows Services'),
(46, 'Eyelash Perming With Tint', 299.00, NULL, 45, 'Lashes & Brows Services'),
(47, 'Eyebrow Threading', 99.00, NULL, 15, 'Lashes & Brows Services'),
(48, 'Cystic Pimple Injection', 99.00, NULL, 15, 'Medical Procedure Services'),
(49, 'Sclerotherapy', 1899.00, NULL, 60, 'Medical Procedure Services'),
(50, 'Keloid Removal', 999.00, NULL, 30, 'Medical Procedure Services'),
(51, 'Sweatox', 149.00, NULL, 15, 'Medical Procedure Services'),
(52, 'Barbie Arms Botox', 149.00, NULL, 30, 'Medical Procedure Services'),
(53, 'Jawtox', 149.00, NULL, 30, 'Medical Procedure Services'),
(54, 'Facial Botox', 149.00, NULL, 30, 'Medical Procedure Services'),
(55, 'Traptox', 149.00, NULL, 30, 'Medical Procedure Services'),
(56, 'Glow Drip', 899.00, NULL, 45, 'Glutha Drip & Push Services'),
(57, 'Melasma Drip', 1199.00, NULL, 45, 'Glutha Drip & Push Services'),
(58, 'Sakura Drip', 1299.00, NULL, 45, 'Glutha Drip & Push Services'),
(59, 'Cinderella Drip', 1399.00, NULL, 45, 'Glutha Drip & Push Services'),
(60, 'Hikari Drip', 1799.00, NULL, 45, 'Glutha Drip & Push Services'),
(61, 'Glow Push', 499.00, NULL, 30, 'Glutha Drip & Push Services'),
(62, 'Collagen', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(63, 'Stemcell', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(64, 'B-Complex', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(65, 'Placenta', 499.00, NULL, NULL, 'Glutha Drip & Push Services'),
(66, 'L-Carnitine', 599.00, NULL, NULL, 'Glutha Drip & Push Services'),
(67, 'UA Wax', 99.00, NULL, 15, 'Underarm Services'),
(68, 'UA Whitening', 99.00, NULL, 20, 'Underarm Services'),
(69, 'UA IPL', 199.00, NULL, 20, 'Underarm Services'),
(70, 'UA Carbon Peel Laser', 799.00, NULL, NULL, 'Underarm Services'),
(71, 'Brazilian Wax Women', 599.00, NULL, 45, 'Intimate Area Services'),
(72, 'Brazilian Wax Men', 799.00, NULL, 60, 'Intimate Area Services'),
(73, 'Bikini Whitening', 499.00, NULL, 30, 'Intimate Area Services'),
(74, 'Bikini Carbon Peel Laser', 999.00, NULL, 45, 'Intimate Area Services'),
(75, 'Butt Whitening', 499.00, NULL, 30, 'Intimate Area Services'),
(76, 'Butt Carbon', 1499.00, NULL, 60, 'Intimate Area Services'),
(77, 'Vajacial Women', 699.00, NULL, 45, 'Intimate Area Services'),
(78, 'Vajacial Men', 799.00, NULL, 60, 'Intimate Area Services'),
(79, 'Mustache Wax (Up & Down)', 499.00, NULL, NULL, 'Waxing Services'),
(80, 'Whole Leg Wax', 999.00, NULL, 60, 'Waxing Services'),
(81, 'Half Leg Wax', 599.00, NULL, 30, 'Waxing Services'),
(82, '24k Gold Mask Facial', 99.00, NULL, 30, 'Facial Services'),
(83, 'Diamond Peel', 99.00, NULL, 30, 'Facial Services'),
(84, 'Facial With Diamond Peel', 198.00, NULL, 45, 'Facial Services'),
(85, 'Hydrafacial', 499.00, NULL, 45, 'Facial Services'),
(86, 'Acne/Pimple Microlaser', 499.00, NULL, 30, 'Facial Services'),
(87, 'RF Face Contouring', 149.00, NULL, 30, 'Facial Services'),
(88, 'Lipo Cavitation', 149.00, NULL, 30, 'Facial Services'),
(89, 'Vampire PRP Treatment', 1999.00, NULL, 90, 'Microneedling Services'),
(90, 'Korean BB Glow', 999.00, NULL, 60, 'Microneedling Services'),
(91, 'Korean BB Blush', 599.00, NULL, 60, 'Microneedling Services'),
(92, '7D HIFU Ultralift', 4999.00, NULL, 90, 'Slimming Services'),
(93, 'HIFU V-Max Facelift', 1199.00, NULL, 60, 'Slimming Services'),
(94, 'HIFU Body Maxtite', 1799.00, NULL, 90, 'Slimming Services'),
(95, 'Mesolipo', 999.00, NULL, 45, 'Slimming Services'),
(96, 'EMS Slendertone', 599.00, NULL, 30, 'Slimming Services'),
(97, 'Korean Body Sculpting', 599.00, NULL, 60, 'Slimming Services'),
(98, 'Thermogenic Wrap', 599.00, NULL, 45, 'Slimming Services');

-- --------------------------------------------------------

--
-- Table structure for table `service_groups`
--

CREATE TABLE `service_groups` (
  `group_id` int(11) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `group_type` enum('promo','discount','custom') DEFAULT 'custom'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_groups`
--

INSERT INTO `service_groups` (`group_id`, `group_name`, `description`, `status`, `created_at`, `updated_at`, `group_type`) VALUES
(1, 'Facial Spa + Footspa', 'Bundled Promo', 'Inactive', '2025-08-20 14:07:31', '2025-08-20 14:07:31', 'custom'),
(2, 'Diode Laser ', 'Diode Laser 50% Discounted Price', 'Active', '2025-05-18 14:42:04', '2025-08-24 07:32:31', 'custom'),
(5, 'Hair Treatments', 'Hair treatments and services', 'Active', '2025-05-18 14:43:47', '2025-05-21 07:16:22', 'custom'),
(18, 'Special Treatments', 'Group for special facial and skin treatments', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(19, 'Body & Relaxing Services', 'Massages and body care treatments', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(20, 'Laser Treatment Services', 'Laser-based treatment options', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(21, 'Lashes & Brows Services', 'Eyelash and eyebrow enhancement services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(22, 'Medical Procedure Services', 'Medical-grade skincare and cosmetic procedures', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(23, 'Glutha Drip & Push Services', 'IV drip and push treatments for skin and wellness', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(24, 'Underarm Services', 'Underarm waxing, whitening, and laser services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(25, 'Intimate Area Services', 'Whitening and treatment services for intimate areas', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(26, 'Waxing Services', 'General waxing and hair removal services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(27, 'Facial Services', 'Various facial treatments and enhancements', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(28, 'Microneedling Services', 'Microneedling and skin rejuvenation services', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom'),
(29, 'Slimming Services', 'Body slimming, contouring, and sculpting treatments', 'Active', '2025-06-28 03:34:34', '2025-06-28 03:34:34', 'custom');

-- --------------------------------------------------------

--
-- Table structure for table `service_group_mappings`
--

CREATE TABLE `service_group_mappings` (
  `mapping_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_group_mappings`
--

INSERT INTO `service_group_mappings` (`mapping_id`, `group_id`, `service_id`, `sort_order`, `created_at`) VALUES
(344, 2, 8, 0, '2025-08-25 07:28:29'),
(345, 2, 2, 0, '2025-08-25 07:28:29'),
(346, 2, 7, 0, '2025-08-25 07:28:29'),
(347, 2, 1, 0, '2025-08-25 07:28:29'),
(348, 2, 3, 0, '2025-08-25 07:28:29');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `service_date` date DEFAULT NULL,
  `service_description` varchar(100) DEFAULT NULL,
  `employee_name` varchar(100) DEFAULT NULL,
  `invoice_number` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `customer_id`, `service_date`, `service_description`, `employee_name`, `invoice_number`, `total_amount`) VALUES
(9, 1, '2025-06-18', 'Classic Manicure, Classic Pedicure', 'Admin', 'INV-20250618-8432', 135.00),
(10, 2, '2025-02-25', 'Classic Manicure', 'Admin', '132325', 120.00),
(11, 2, '2025-02-25', 'Classic Pedicure', 'Admin', '132325', 150.00),
(12, 3, '2025-02-20', 'Package Deal', 'Admin', '122325', 1000.00),
(16, 1, '2025-07-16', '24k Gold Mask Facial', 'Admin', 'INV-20250716-5442', 49.50),
(26, 2, '2025-07-16', 'Diamond Peel', 'Admin', 'INV-20250716-3923', 99.00),
(27, 2, '2025-07-16', 'Diamond Peel', 'Admin', 'INV-20250716-3425', 99.00),
(28, 2, '2025-07-16', '24k Gold Mask Facial', 'Admin', 'INV-20250716-3625', 99.00),
(29, 2, '2025-07-16', 'Hair Cellophane', 'Admin', 'INV-20250716-4754', 399.00),
(30, 2, '2025-07-16', 'Brazilian Wax Women', 'Admin', 'INV-20250716-7763', 599.00),
(31, 1, '2025-07-16', 'Facial With Diamond Peel, Face', 'Admin', 'INV-20250716-3923', 748.50),
(32, 1, '2025-07-23', 'Moisturizing Body Scrub, Arms, All Parts Diode Laser', 'Admin', 'INV-20250723-8280', 3648.50),
(33, 1, '2025-07-23', 'Body Massage, Moisturizing Body Scrub, Brazilian, Half Leg Wax', 'Admin', 'INV-20250723-1849', 1698.00),
(34, 1, '2025-07-23', 'Diamond Peel, Facial With Diamond Peel', 'Admin', 'INV-20250723-8378', 148.50),
(35, 1, '2025-07-25', 'Brazilian Blowout, Hair Botox Treatment', 'Admin', 'INV-20250725-3786', 899.00),
(36, 3, '2025-07-30', 'Half Leg Wax', 'Admin', 'INV-20250730-2391', 599.00),
(37, 3, '2025-08-07', 'Hydrafacial', 'Admin', 'INV-20250807-5043', 249.50),
(38, 3, '2025-08-09', 'Diamond Peel', 'Admin', 'INV-20250809-9474', 49.50),
(39, 3, '2025-08-09', 'Diamond Peel', 'Admin', 'INV-20250809-5169', 99.00),
(40, 3, '2025-08-09', 'Diamond Peel', 'Admin', 'INV-20250809-9977', 99.00),
(41, 3, '2025-08-09', 'Diamond Peel', 'Admin', 'INV-20250809-4801', 198.00),
(54, 3, '2025-08-09', '24k Gold Mask Facial, Diamond Peel', 'Admin', 'INV-20250809-0158', 297.00),
(55, 3, '2025-08-09', 'RF Face Contouring', 'Admin', 'INV-20250809-5687', 298.00),
(56, 6, '2025-08-24', 'Brazilian, Mustache, UA Diode Laser', 'Admin', 'INV-20250824-7261', 1298.50),
(57, 4, '2025-08-24', 'Brazilian, Mustache, UA Diode Laser, Upper Lip', 'Admin', 'INV-20250824-2744', 1498.00),
(58, 5, '2025-08-25', 'Brazilian, Face, Mustache, UA Diode Laser', 'Admin', 'INV-20250825-4156', 974.00),
(59, 6, '2025-09-02', 'Brazilian, Mustache, UA Diode Laser', 'Admin', 'INV-20250902-4514', 1298.50),
(60, 5, '2025-09-02', 'Eyelash Perming, Body Massage', 'Admin', 'INV-20250902-5243', 698.00),
(61, 6, '2025-09-02', 'Half Leg Wax', 'Admin', 'INV-20250902-0688', 599.00),
(62, 4, '2025-09-02', 'Butt Whitening, Cystic Pimple Injection', 'Admin', 'INV-20250902-2796', 598.00),
(63, 4, '2025-09-02', 'Facial Botox, Cystic Pimple Injection', 'Admin', 'INV-20250902-3276', 248.00),
(64, 3, '2025-09-02', 'UA Wax, UA IPL', 'Admin', 'INV-20250902-4192', 298.00),
(65, 5, '2025-09-02', 'Facial With Diamond Peel, Lipo Cavitation', 'Admin', 'INV-20250902-2083', 347.00),
(66, 2, '2025-09-02', 'Diamond Peel, Lipo Cavitation, Facial With Diamond Peel', 'Admin', 'INV-20250902-8745', 446.00),
(67, 6, '2025-09-02', 'Lipo Cavitation', 'Admin', 'INV-20250902-9655', 149.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `CustomerID` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `username`, `role`, `email`, `password`, `created_at`, `CustomerID`, `branch_id`) VALUES
(1, 'Odette', 'reception2', 'receptionist', 'user@gmail.com', 'password123', '2024-10-18 18:12:01', 1, 1),
(3, 'Maria', 'reception1', 'receptionist', 'user2@gmail.com', 'user2', '2024-10-22 12:46:06', 2, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customerId` (`customerId`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`discount_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `invoice_service`
--
ALTER TABLE `invoice_service`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `membership_logs`
--
ALTER TABLE `membership_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `membership_id` (`membership_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `fk_orders_customer` (`customer_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`PaymentID`),
  ADD KEY `InvoiceID` (`InvoiceID`),
  ADD KEY `payments_ibfk_2` (`CustomerID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `promos`
--
ALTER TABLE `promos`
  ADD PRIMARY KEY (`promo_id`);

--
-- Indexes for table `sales_activity`
--
ALTER TABLE `sales_activity`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `service_groups`
--
ALTER TABLE `service_groups`
  ADD PRIMARY KEY (`group_id`);

--
-- Indexes for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  ADD PRIMARY KEY (`mapping_id`),
  ADD UNIQUE KEY `unique_group_service` (`group_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_customer_id` (`CustomerID`),
  ADD KEY `fk_branch` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `discount_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `invoice_service`
--
ALTER TABLE `invoice_service`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `membership`
--
ALTER TABLE `membership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `membership_logs`
--
ALTER TABLE `membership_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `promos`
--
ALTER TABLE `promos`
  MODIFY `promo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sales_activity`
--
ALTER TABLE `sales_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_groups`
--
ALTER TABLE `service_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  MODIFY `mapping_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=349;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_service`
--
ALTER TABLE `invoice_service`
  ADD CONSTRAINT `invoice_service_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`);

--
-- Constraints for table `memberships`
--
ALTER TABLE `memberships`
  ADD CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `membership_logs`
--
ALTER TABLE `membership_logs`
  ADD CONSTRAINT `membership_logs_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `membership_logs_ibfk_2` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  ADD CONSTRAINT `service_group_mappings_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `service_groups` (`group_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
