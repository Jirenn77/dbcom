<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

    // Fetch invoices with service details
    $stmt = $pdo->prepare("
        SELECT 
            i.invoice_id,
            i.invoice_date,
            i.total_price,
            i.status AS payment_status,
            c.name AS customer_name,
            s.name AS service_name,
            s.price AS service_price
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        JOIN services s ON i.service_id = s.service_id
        ORDER BY i.invoice_date DESC
    ");
    $stmt->execute();

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $invoices = [];

    foreach ($result as $row) {
        $id = $row['invoice_id'];

        if (!isset($invoices[$id])) {
            $invoices[$id] = [
                'id' => $id,
                'name' => $row['customer_name'],
                'invoiceNumber' => str_pad($id, 6, '0', STR_PAD_LEFT),
                'dateIssued' => date("M d, Y", strtotime($row['invoice_date'])),
                'totalAmount' => "₱" . number_format($row['total_price'], 2),
                'paymentStatus' => $row['payment_status'],
                'services' => []
            ];
        }

        $invoices[$id]['services'][] = [
            'name' => $row['service_name'],
            'price' => "₱" . number_format($row['service_price'], 2)
        ];
    }

    echo json_encode(array_values($invoices));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
