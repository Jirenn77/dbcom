-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 26, 2025 at 03:36 AM
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
  `color_code` varchar(7) DEFAULT '#3B82F6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `color_code`) VALUES
(1, 'Pabayo', '#3B82F6'),
(2, 'Gingoog City', '#10B981'),
(3, 'Patag', '#F59E0B'),
(4, 'Bukidnon', '#EF4444');

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
(1, 'Mrs. Jefferson', '+639 053 2322', 'Jeff_23@yahoo.com', '123 Main St, Anytown', 'VIP', '110234', '1997-03-23'),
(2, 'Mrs. Shane', '+639 053 2324', 'shane@gmail.com', '456 Elm St, Othertown', 'None', '110424', '1990-04-15'),
(3, 'Mrs. Cee', '+639 034 2324', 'cee@gmail.com', '789 Oak St, Somewhere', 'None', '122324', '1985-12-05');

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
(1, 'Holloween Discount', 'Input customers', 'percentage', 0.00, 'active'),
(2, 'Holiday Discount', '10% off', 'percentage', 10.00, 'active'),
(3, 'Birthday Discount', 'Special for birthdays', 'percentage', 15.00, 'active'),
(4, 'Loyalty Discount', 'For loyal customers', 'fixed', 100.00, 'inactive');

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
  `invoice_date` date NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `invoice_number`, `customer_id`, `service_id`, `invoice_date`, `quantity`, `total_price`, `status`, `notes`) VALUES
(1, '112344', 1, 24, '2025-02-26', 1, 150.00, 'Paid', NULL),
(2, '112344', 1, 2, '2025-02-26', 1, 1299.00, 'Paid', NULL),
(3, '132325', 2, 10, '2025-02-25', 1, 120.00, 'Pending', NULL),
(4, '132325', 2, 11, '2025-02-25', 1, 150.00, 'Pending', NULL),
(5, '122325', 3, 0, '2025-02-20', 1, 1000.00, 'Pending', NULL),
(9, 'INV-20250618-8432', 1, 10, '2025-06-18', 1, 120.00, 'Pending', NULL),
(10, 'INV-20250618-8432', 1, 11, '2025-06-18', 1, 150.00, 'Pending', NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`id`, `name`, `discount`, `description`, `duration`, `status`, `created_at`) VALUES
(1, 'VIP', '50%', 'Priority services and bigger discounts', 12, 'active', '2025-05-30 13:11:54'),
(2, 'Standard', '30%', 'Affordable benefits for loyal clients', 12, 'active', '2025-05-30 13:11:54');

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `coverage` varchar(20) DEFAULT NULL,
  `remaining_balance` varchar(20) DEFAULT NULL,
  `date_registered` date DEFAULT NULL,
  `expire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`id`, `customer_id`, `type`, `coverage`, `remaining_balance`, `date_registered`, `expire_date`) VALUES
(1, 1, 'VIP', '10,000', '10,000', '2025-06-05', '2025-07-07');

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
(28, 1, 5, '2025-05-29 00:00:00', 104.59, NULL);

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
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promos`
--

INSERT INTO `promos` (`promo_id`, `type`, `name`, `description`, `valid_from`, `valid_to`, `status`) VALUES
(1, 'Membership', 'Facial Spa + Footspa', 'Bundled Promo', '2025-01-10', '2025-01-25', 'active'),
(2, 'Beauty Deals', 'Hair Rebond + Haircut', 'Bundled Promo for 1000 only', '2025-01-10', '2025-01-25', 'active'),
(3, 'Skincare', 'Facial + Diamond Peel', 'Glow-up bundle', '2025-02-01', '2025-02-15', 'active'),
(4, 'Massage Deals', 'Swedish + Hot Stone', 'Relaxation promo', '2025-03-01', '2025-03-31', 'inactive');

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
(20, 'Hair Mask', 499.00, 'Intensive conditioning treatment for damaged hair', 45, 'Hair Treatments'),
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
(31, 'EYEBAG TREATMENT', 399.00, NULL, NULL, 'SPECIAL TREATMENTS'),
(32, 'MELASMA TREATMENT PS', 999.00, NULL, NULL, 'SPECIAL TREATMENTS'),
(33, 'SCAR TREATMENT PS', 999.00, NULL, NULL, 'SPECIAL TREATMENTS'),
(34, 'BODY MASSAGE', 499.00, NULL, NULL, 'BODY & RELAXING SERVICES'),
(35, 'MOISTURIZING BODY SCRUB', 799.00, NULL, NULL, 'BODY & RELAXING SERVICES'),
(36, 'BODY WHITENING MASK', 1499.00, NULL, NULL, 'BODY & RELAXING SERVICES'),
(37, 'BLACK DOLL CARBON PEEL LASER', 999.00, NULL, NULL, 'LASER TREATMENT SERVICES'),
(38, 'PICO LASER', 999.00, NULL, NULL, 'LASER TREATMENT SERVICES'),
(39, 'LEG CARBON PEEL LASER', 999.00, NULL, NULL, 'LASER TREATMENT SERVICES'),
(40, 'CAUTERIZATION SERVICES WARTS/MILIA/SYRINGOMA REMOVAL', 999.00, NULL, NULL, 'LASER TREATMENT SERVICES'),
(41, 'TATTOO REMOVAL PRICE STARTS', 499.00, NULL, NULL, 'LASER TREATMENT SERVICES'),
(42, 'EYELASH EXTENSION NATURAL LOOK', 299.00, NULL, NULL, 'LASHES & BROWS SERVICES'),
(43, 'EYELASH EXTENSION VOLUME LOOK', 599.00, NULL, NULL, 'LASHES & BROWS SERVICES'),
(44, 'EYELASH EXTENSION CAT-EYE LOOK', 699.00, NULL, NULL, 'LASHES & BROWS SERVICES'),
(45, 'EYELASH PERMING', 199.00, NULL, NULL, 'LASHES & BROWS SERVICES'),
(46, 'EYELASH PERMING WITH TINT', 299.00, NULL, NULL, 'LASHES & BROWS SERVICES'),
(47, 'EYEBROW THREADING', 99.00, NULL, NULL, 'LASHES & BROWS SERVICES'),
(48, 'CYSTIC PIMPLE INJECTION', 99.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(49, 'SCLEROTHERAPY', 1899.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(50, 'KELOID REMOVAL', 999.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(51, 'SWEATOX', 149.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(52, 'BARBIE ARMS BOTOX', 149.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(53, 'JAWTOX', 149.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(54, 'FACIAL BOTOX', 149.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(55, 'TRAPTOX', 149.00, NULL, NULL, 'MEDICAL PROCEDURE SERVICES'),
(56, 'GLOW DRIP', 899.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(57, 'MELASMA DRIP', 1199.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(58, 'SAKURA DRIP', 1299.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(59, 'CINDERELLA DRIP', 1399.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(60, 'HIKARI DRIP', 1799.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(61, 'GLOW PUSH', 499.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(62, 'COLLAGEN', 499.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(63, 'STEMCELL', 499.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(64, 'B-COMPLEX', 499.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(65, 'PLACENTA', 499.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(66, 'L-CARNITINE', 599.00, NULL, NULL, 'GLUTHA DRIP & PUSH SERVICES'),
(67, 'UA WAX', 99.00, NULL, NULL, 'UNDERARM SERVICES'),
(68, 'UA WHITENING', 99.00, NULL, NULL, 'UNDERARM SERVICES'),
(69, 'UA IPL', 199.00, NULL, NULL, 'UNDERARM SERVICES'),
(70, 'UA CARBON PEEL LASER', 799.00, NULL, NULL, 'UNDERARM SERVICES'),
(71, 'BRAZILIAN WAX WOMEN', 599.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(72, 'BRAZILIAN WAX MEN', 799.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(73, 'BIKINI WHITENING', 499.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(74, 'BIKINI CARBON PEEL LASER', 999.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(75, 'BUTT WHITENING', 499.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(76, 'BUTT CARBON', 1499.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(77, 'VAJACIAL WOMEN', 699.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(78, 'VAJACIAL MEN', 799.00, NULL, NULL, 'INTIMATE AREA SERVICES'),
(79, 'MUSTACHE WAX (UP & DOWN)', 499.00, NULL, NULL, 'WAXING SERVICES'),
(80, 'WHOLE LEG WAX', 999.00, NULL, NULL, 'WAXING SERVICES'),
(81, 'HALF LEG WAX', 599.00, NULL, NULL, 'WAXING SERVICES'),
(82, '24K GOLD MASK FACIAL', 99.00, NULL, NULL, 'FACIAL SERVICES'),
(83, 'DIAMOND PEEL', 99.00, NULL, NULL, 'FACIAL SERVICES'),
(84, 'FACIAL WITH DIAMOND PEEL', 198.00, NULL, NULL, 'FACIAL SERVICES'),
(85, 'HYDRAFACIAL', 499.00, NULL, NULL, 'FACIAL SERVICES'),
(86, 'ACNE/PIMPLE MICROLASER', 499.00, NULL, NULL, 'FACIAL SERVICES'),
(87, 'RF FACE CONTOURING', 149.00, NULL, NULL, 'FACIAL SERVICES'),
(88, 'LIPO CAVITATION', 149.00, NULL, NULL, 'FACIAL SERVICES'),
(89, 'VAMPIRE PRP TREATMENT', 1999.00, NULL, NULL, 'MICRONEEDLING SERVICES'),
(90, 'KOREAN BB GLOW', 999.00, NULL, NULL, 'MICRONEEDLING SERVICES'),
(91, 'KOREAN BB BLUSH', 599.00, NULL, NULL, 'MICRONEEDLING SERVICES'),
(92, '7D HIFU ULTRALIFT', 4999.00, NULL, NULL, 'SLIMMING SERVICES'),
(93, 'HIFU V-MAX FACELIFT', 1199.00, NULL, NULL, 'SLIMMING SERVICES'),
(94, 'HIFU BODY MAXTITE', 1799.00, NULL, NULL, 'SLIMMING SERVICES'),
(95, 'MESOLIPO', 999.00, NULL, NULL, 'SLIMMING SERVICES'),
(96, 'EMS SLENDERTONE', 599.00, NULL, NULL, 'SLIMMING SERVICES'),
(97, 'KOREAN BODY SCULPTING', 599.00, NULL, NULL, 'SLIMMING SERVICES'),
(98, 'THERMOGENIC WRAP', 599.00, NULL, NULL, 'SLIMMING SERVICES');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_groups`
--

INSERT INTO `service_groups` (`group_id`, `group_name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Basic Hair Services', 'Regular hair maintenance services', 'Active', '2025-05-18 14:42:04', '2025-05-21 07:34:04'),
(3, 'Diode Laser', 'Laser hair removal services', 'Active', '2025-05-18 14:43:47', '2025-05-18 14:43:47'),
(4, 'Nails & Foot', 'Nail and foot care services', 'Active', '2025-05-18 14:43:47', '2025-05-18 14:43:47'),
(5, 'Hair Treatments', 'Hair treatments and services', 'Active', '2025-05-18 14:43:47', '2025-05-21 07:16:22'),
(6, 'SPECIAL TREATMENTS', 'Group for special facial and skin treatments', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(7, 'BODY & RELAXING SERVICES', 'Massages and body care treatments', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(8, 'LASER TREATMENT SERVICES', 'Laser-based treatment options', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(9, 'LASHES & BROWS SERVICES', 'Services related to eyelash and eyebrow enhancement', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(10, 'MEDICAL PROCEDURE SERVICES', 'Medical-grade skincare and cosmetic procedures', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(11, 'GLUTHA DRIP & PUSH SERVICES', 'IV Drip and push treatments for skin and wellness', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(12, 'UNDERARM SERVICES', 'Care and whitening services for underarms', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(13, 'INTIMATE AREA SERVICES', 'Services for bikini and intimate areas', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(14, 'WAXING SERVICES', 'Hair removal waxing services', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(15, 'FACIAL SERVICES', 'General facial treatments and enhancements', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(16, 'MICRONEEDLING SERVICES', 'Microneedling and PRP procedures', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31'),
(17, 'SLIMMING SERVICES', 'Body sculpting and slimming treatments', 'Active', '2025-06-25 11:02:31', '2025-06-25 11:02:31');

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
(7, 2, 7, 0, '2025-05-18 14:42:19'),
(8, 2, 8, 0, '2025-05-18 14:42:19'),
(9, 2, 9, 0, '2025-05-18 14:42:19');

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
(1, 1, '2025-02-26', 'Haircut & Styling', 'Sarah', 'INV-1001', 50.00),
(2, 1, '2025-01-15', 'Facial Treatment', 'Maria', 'INV-0954', 70.00),
(3, 1, '2024-12-10', 'Manicure', 'Jessica', 'INV-0890', 25.00),
(9, 1, '2025-06-18', 'Classic Manicure, Classic Pedicure', 'Admin', 'INV-20250618-8432', 135.00),
(10, 2, '2025-02-25', 'Classic Manicure', 'Admin', '132325', 120.00),
(11, 2, '2025-02-25', 'Classic Pedicure', 'Admin', '132325', 150.00),
(12, 3, '2025-02-20', 'Package Deal', 'Admin', '122325', 1000.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('staff','customer') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `CustomerID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password`, `role`, `created_at`, `CustomerID`) VALUES
(1, 'user@gmail.com', 'password123', 'customer', '2024-10-18 18:12:01', 1),
(3, 'user2@gmail.com', 'user2', 'customer', '2024-10-22 12:46:06', 2);

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
  ADD KEY `fk_customer_id` (`CustomerID`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `discount_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

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
  MODIFY `promo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sales_activity`
--
ALTER TABLE `sales_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_groups`
--
ALTER TABLE `service_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `service_group_mappings`
--
ALTER TABLE `service_group_mappings`
  MODIFY `mapping_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `invoice_service_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`),
  ADD CONSTRAINT `invoice_service_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`);

--
-- Constraints for table `memberships`
--
ALTER TABLE `memberships`
  ADD CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `service_group_mappings_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `service_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_group_mappings_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
