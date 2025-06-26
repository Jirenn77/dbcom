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
            !isset($input['subtotal'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $customerId = filter_var($input['customer_id'], FILTER_SANITIZE_NUMBER_INT);
        $employeeName = isset($input['employee_name']) ? $input['employee_name'] : 'N/A';
        $services = $input['services']; // array of { id, name, price }
        $subtotal = floatval($input['subtotal']);
        $membershipReduction = isset($input['membershipReduction']) ? floatval($input['membershipReduction']) : 0;
        $finalAmount = $subtotal - $membershipReduction;
        $serviceDate = date("Y-m-d");

        try {
            $pdo->beginTransaction();

            // Generate invoice number
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Combine service names into description
            $serviceDescription = implode(', ', array_map(function($s) {
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
    if (!isset($service['service_id']) || !isset($service['price'])) {
        throw new Exception('Invalid service data');
    }

    $stmt = $pdo->prepare("
        INSERT INTO invoices 
        (invoice_number, customer_id, service_id, invoice_date, quantity, total_price)
        VALUES (:invoice_number, :customer_id, :service_id, :invoice_date, 1, :total_price)
    ");
    $stmt->execute([
        ':invoice_number' => $invoiceNumber,
        ':customer_id' => $customerId,
        ':service_id' => $service['service_id'],
        ':invoice_date' => $serviceDate,
        ':total_price' => $service['price']
    ]);
}

            $pdo->commit();

            http_response_code(201);
            echo json_encode([
                'message' => 'Order saved successfully',
                'invoice_number' => $invoiceNumber
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
