<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
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

    // Handle update promo
    if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'update_deal') {
        $input = json_decode(file_get_contents("php://input"), true);

        $promo_id = $input['id'] ?? null;
        $name = $input['name'] ?? '';
        $description = $input['description'] ?? '';
        $validFrom = $input['validFrom'] ?? '';
        $validTo = $input['validTo'] ?? '';
        $status = $input['status'] ?? '';

        if (!$promo_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing promo ID.']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE promos
            SET name = ?, description = ?, valid_from = ?, valid_to = ?, status = ?
            WHERE promo_id = ?
        ");

        $stmt->execute([
            $name,
            $description,
            date('Y-m-d', strtotime($validFrom)),
            date('Y-m-d', strtotime($validTo)),
            $status,
            $promo_id
        ]);

                // Accept service IDs (optional if no services selected)
        $serviceIds = $input['serviceIds'] ?? [];

        // Start transaction
        $pdo->beginTransaction();

        // 1. Update the promo
        $stmt = $pdo->prepare("
            UPDATE promos
            SET name = ?, description = ?, valid_from = ?, valid_to = ?, status = ?
            WHERE promo_id = ?
        ");
        $stmt->execute([
            $name,
            $description,
            date('Y-m-d', strtotime($validFrom)),
            date('Y-m-d', strtotime($validTo)),
            $status,
            $promo_id
        ]);

        // 2. Update mappings (in service_group_mappings table)
        // Delete previous mappings
        $deleteStmt = $pdo->prepare("DELETE FROM service_group_mappings WHERE group_id = ?");
        $deleteStmt->execute([$promo_id]);

        // Insert new mappings if provided
        if (!empty($serviceIds) && is_array($serviceIds)) {
            $insertStmt = $pdo->prepare("INSERT INTO service_group_mappings (group_id, service_id) VALUES (?, ?)");
            foreach ($serviceIds as $serviceId) {
                $insertStmt->execute([$promo_id, $serviceId]);
            }
        }

        // Commit the transaction
        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Promo and services updated.']);
        exit;

    }

    // Fetch promos and discounts
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch promos
        $promoStmt = $pdo->query("SELECT promo_id, type, name, description, valid_from, valid_to, status FROM promos");
        $promos = $promoStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($promos as &$promo) {
            $promo['id'] = $promo['promo_id']; // required by frontend
            $promo['validFrom'] = date("Y-m-d", strtotime($promo['valid_from']));
            $promo['validTo'] = date("Y-m-d", strtotime($promo['valid_to']));
            unset($promo['valid_from'], $promo['valid_to'], $promo['promo_id']);
        }

        // Fetch discounts
        $discountStmt = $pdo->query("SELECT discount_id, name, description, discount_type, value, status FROM discounts");
        $discounts = $discountStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($discounts as &$discount) {
            $discount['id'] = $discount['discount_id'];
            unset($discount['discount_id']);
        }

        echo json_encode([
            'promos' => $promos,
            'discounts' => $discounts
        ]);
        exit;
    }

    // Fallback
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
