<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (empty($data['name']) || empty($data['type']) || empty($data['description'])) {
            http_response_code(400);
            echo json_encode(["error" => "Name, type, and description are required"]);
            exit;
        }

        // Set values based on membership type
        if ($data['type'] === 'basic') {
            $consumable = 5000;
            $price = 3000;
            $no_expiration = 1;
            $valid_until = null;
        } elseif ($data['type'] === 'pro') {
            $consumable = 10000;
            $price = 6000;
            $no_expiration = 1;
            $valid_until = null;
        } elseif ($data['type'] === 'promo') {
            // Validate required fields for promo
            if (!isset($data['price']) || !isset($data['consumable_amount'])) {
                http_response_code(400);
                echo json_encode(["error" => "Price and consumable amount are required for promo memberships"]);
                exit;
            }
            
            $consumable = (int)$data['consumable_amount'];
            $price = (float)$data['price'];
            $no_expiration = isset($data['no_expiration']) && $data['no_expiration'] ? 1 : 0;
            $valid_until = $no_expiration ? null : ($data['valid_until'] ?? null);
            
            // Additional validation for promo memberships
            if ($price <= 0 || $consumable <= 0) {
                http_response_code(400);
                echo json_encode(["error" => "Price and consumable amount must be positive values"]);
                exit;
            }
            
            if (!$no_expiration && empty($valid_until)) {
                http_response_code(400);
                echo json_encode(["error" => "Valid until date is required for expiring promos"]);
                exit;
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid membership type"]);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO membership 
            (name, type, discount, description, consumable_amount, price, no_expiration, valid_until, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ");
        
        $stmt->execute([
            $data['name'],
            $data['type'],
            '50%', // Fixed 50% discount
            $data['description'],
            $consumable,
            $price,
            $no_expiration,
            $valid_until
        ]);

        $id = $pdo->lastInsertId();
        $membership = $pdo->query("SELECT * FROM membership WHERE id = $id")->fetch(PDO::FETCH_ASSOC);
        echo json_encode($membership);
        exit;
    }

    // Handle GET requests
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare("
            SELECT 
                id, 
                name,
                type,
                discount, 
                description, 
                consumable_amount,
                price,
                no_expiration,
                valid_until,
                status,
                CASE 
                    WHEN no_expiration = 1 THEN 'No expiration'
                    WHEN valid_until IS NULL THEN 'No expiration'
                    WHEN valid_until < CURDATE() THEN 'Expired'
                    ELSE CONCAT('Valid until ', DATE_FORMAT(valid_until, '%M %d, %Y'))
                END AS expiration_status
            FROM membership 
            ORDER BY 
                CASE type
                    WHEN 'basic' THEN 1
                    WHEN 'pro' THEN 2
                    WHEN 'promo' THEN 3
                    ELSE 4
                END,
                id ASC
        ");
        $stmt->execute();
        $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($memberships);
        exit;
    }

    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}