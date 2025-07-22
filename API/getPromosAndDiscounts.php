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
        $discountedPrice = isset($input['discounted_price']) ? (float) $input['discounted_price'] : null;
        $serviceIds = $input['serviceIds'] ?? [];

        if (!$promo_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing promo ID.']);
            exit;
        }

        // Start transaction
        $pdo->beginTransaction();

        // Update the promo including discounted_price
        $stmt = $pdo->prepare("
        UPDATE promos
        SET name = ?, description = ?, valid_from = ?, valid_to = ?, status = ?, discounted_price = ?
        WHERE promo_id = ?
    ");
        $stmt->execute([
            $name,
            $description,
            date('Y-m-d', strtotime($validFrom)),
            date('Y-m-d', strtotime($validTo)),
            $status,
            $discountedPrice,
            $promo_id
        ]);

        // Update mappings
        $deleteStmt = $pdo->prepare("DELETE FROM service_group_mappings WHERE group_id = ?");
        $deleteStmt->execute([$promo_id]);

        if (!empty($serviceIds) && is_array($serviceIds)) {
            $insertStmt = $pdo->prepare("INSERT INTO service_group_mappings (group_id, service_id) VALUES (?, ?)");
            foreach ($serviceIds as $serviceId) {
                $insertStmt->execute([$promo_id, $serviceId]);
            }
        }

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Promo and services updated.']);
        exit;
    }

    // Handle save/edit discount
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'save_group') {
        $input = json_decode(file_get_contents("php://input"), true);

        $discount_id = $input['group_id'] ?? null;
        $name = $input['group_name'] ?? '';
        $description = $input['description'] ?? '';
        $status = $input['status'] ?? '';
        $discount_type = $input['discount_type'] ?? '';
        $value = isset($input['value']) ? floatval($input['value']) : null;
        $serviceIds = $input['services'] ?? [];

        if (!$discount_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing discount ID.']);
            exit;
        }

        $pdo->beginTransaction();

        // Update the discount
        $stmt = $pdo->prepare("
        UPDATE discounts
        SET name = ?, description = ?, status = ?, discount_type = ?, value = ?
        WHERE discount_id = ?
    ");
        $stmt->execute([$name, $description, $status, $discount_type, $value, $discount_id]);

        // Update service mappings
        $deleteStmt = $pdo->prepare("DELETE FROM service_group_mappings WHERE group_id = ?");
        $deleteStmt->execute([$discount_id]);

        if (!empty($serviceIds) && is_array($serviceIds)) {
            $insertStmt = $pdo->prepare("INSERT INTO service_group_mappings (group_id, service_id) VALUES (?, ?)");
            foreach ($serviceIds as $serviceId) {
                $insertStmt->execute([$discount_id, $serviceId]);
            }
        }

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Discount updated successfully.']);
        exit;
    }


    // Fetch promos and discounts
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch promos
        $promoStmt = $pdo->query("SELECT promo_id, type, name, description, valid_from, valid_to, status, discounted_price FROM promos");
        $promos = $promoStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($promos as &$promo) {
            $promo['id'] = $promo['promo_id'];
            $promo['validFrom'] = date("Y-m-d", strtotime($promo['valid_from']));
            $promo['validTo'] = date("Y-m-d", strtotime($promo['valid_to']));
            $promo['discountedPrice'] = $promo['discounted_price']; // 💰
            unset($promo['valid_from'], $promo['valid_to'], $promo['promo_id'], $promo['discounted_price']);
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




