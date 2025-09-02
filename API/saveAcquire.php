<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Handle CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // POST - Save transaction and invoices
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (
            !isset($input['customer_id']) ||
            !isset($input['services']) ||
            !is_array($input['services'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing or invalid required fields']);
            exit;
        }

        $customerId = filter_var($input['customer_id'], FILTER_SANITIZE_NUMBER_INT);
        $employeeName = isset($input['employee_name']) ? $input['employee_name'] : 'N/A';
        $services = $input['services'];

        // Recalculate subtotal from services to ensure accuracy
        $subtotal = 0;
        foreach ($services as $service) {
            if (!isset($service['price']) || !isset($service['quantity']) || !isset($service['service_id'])) {
                throw new Exception('Invalid service data: missing price, quantity, or service_id');
            }
            $subtotal += floatval($service['price']) * intval($service['quantity']);
        }

        // Get reductions from input
        $promoReduction = isset($input['promoReduction']) ? floatval($input['promoReduction']) : 0;
        $discountReduction = isset($input['discountReduction']) ? floatval($input['discountReduction']) : 0;
        $membershipReduction = isset($input['membershipReduction']) ? floatval($input['membershipReduction']) : 0;

        // Final total matches frontend logic
        $finalAmount = $subtotal - $promoReduction - $discountReduction - $membershipReduction;
        if ($finalAmount < 0) {
            $finalAmount = 0; // Prevent negative totals
        }

        $serviceDate = date("Y-m-d");
        $updateMembershipBalance = isset($input['new_membership_balance']) ? floatval($input['new_membership_balance']) : null;

        try {
            $pdo->beginTransaction();

            // Generate invoice number
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Combine service names into description
            $serviceDescription = implode(', ', array_map(function ($s) {
                return $s['name'] ?? 'Unknown Service';
            }, $services));

            // Insert into transactions table
            $stmt = $pdo->prepare("
                INSERT INTO transactions 
                (customer_id, service_date, service_description, employee_name, invoice_number, total_amount)
                VALUES (:customer_id, :service_date, :description, :employee, :invoice_number, :total)
            ");
            $stmt->execute([
                ':customer_id' => $customerId,
                ':service_date' => $serviceDate,
                ':description' => $serviceDescription,
                ':employee' => $employeeName,
                ':invoice_number' => $invoiceNumber,
                ':total' => $finalAmount
            ]);

            // Insert each service into invoices
            foreach ($services as $service) {
                $stmt = $pdo->prepare("
                    INSERT INTO invoices 
                    (invoice_number, customer_id, service_id, invoice_date, quantity, total_price, status)
                    VALUES (:invoice_number, :customer_id, :service_id, :invoice_date, :quantity, :total_price, :status)
                ");
                $stmt->execute([
                    ':invoice_number' => $invoiceNumber,
                    ':customer_id' => $customerId,
                    ':service_id' => $service['service_id'],
                    ':invoice_date' => $serviceDate,
                    ':quantity' => intval($service['quantity']),
                    ':total_price' => floatval($service['price']) * intval($service['quantity']),
                    ':status' => 'Paid'
                ]);
            }

            // Insert into orders table for dashboard stats
            // Using a dummy branch_id = 1 temporarily
            $dummyBranchId = 1;
            foreach ($services as $service) {
                $stmtOrders = $pdo->prepare("
                    INSERT INTO orders
                    (branch_id, service_id, order_date, amount, customer_id)
                    VALUES (:branch_id, :service_id, :order_date, :amount, :customer_id)
                ");
                $stmtOrders->execute([
                    ':branch_id' => $dummyBranchId,
                    ':service_id' => $service['service_id'],
                    ':order_date' => $serviceDate . ' ' . date('H:i:s'),
                    ':amount' => floatval($service['price']) * intval($service['quantity']),
                    ':customer_id' => $customerId,
                ]);
            }

            // Update membership balance if applicable
            if (!is_null($updateMembershipBalance)) {
                $updateStmt = $pdo->prepare("UPDATE memberships SET remaining_balance = :balance WHERE customer_id = :customer_id");
                $updateStmt->execute([
                    ':balance' => $updateMembershipBalance,
                    ':customer_id' => $customerId
                ]);
            }

            $pdo->commit();

            http_response_code(201);
            echo json_encode([
                'message' => 'Order saved successfully',
                'invoice_number' => $invoiceNumber,
                'calculated_total' => $finalAmount
            ]);
            exit;

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
            exit;
        }
    }

    // Method not allowed
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}
