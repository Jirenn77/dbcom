<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include DB config
require_once 'db.php';

try {
    // Connect using PDO
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch promos
    $promoStmt = $pdo->query("SELECT promo_id, type, name, description, valid_from, valid_to, status FROM promos");
    $promos = $promoStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format promo dates
    foreach ($promos as &$promo) {
        $promo['validFrom'] = date("m/d/y", strtotime($promo['valid_from']));
        $promo['validTo'] = date("m/d/y", strtotime($promo['valid_to']));
        unset($promo['valid_from'], $promo['valid_to']);
    }

    // Fetch discounts
    $discountStmt = $pdo->query("SELECT discount_id, name, description, discount_type, value, status FROM discounts");
    $discounts = $discountStmt->fetchAll(PDO::FETCH_ASSOC);

    // Send response
    echo json_encode([
        'promos' => $promos,
        'discounts' => $discounts
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
