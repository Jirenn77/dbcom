<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include 'db.php'; // Ensure the PDO connection is included

// Handle preflight requests for CORS
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Fetch inventory summary
if (isset($_GET['action']) && $_GET['action'] === 'get_inventory_summary') {
    try {
        $stmt = $conn->prepare("SELECT quantity_in_hand, quantity_to_be_received FROM inventory LIMIT 1");
        $stmt->execute();
        $inventory = $stmt->fetch(PDO::FETCH_ASSOC);

        // Debugging log (check Apache/PHP logs)
        error_log("Fetched Inventory Data: " . json_encode($inventory));

        if ($inventory) {
            echo json_encode($inventory);
        } else {
            echo json_encode(['quantity_in_hand' => 0, 'quantity_to_be_received' => 0]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        error_log("Database Error: " . $e->getMessage());
    }
}

// Fetch all products (items)
if (isset($_GET['action']) && $_GET['action'] === 'get_products') {
    try {
        // Fetch all items from the database
        $stmt = $conn->prepare("SELECT * FROM items");
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Debugging log (check Apache/PHP logs)
        error_log("Fetched Products Data: " . json_encode($products));

        if ($products) {
            echo json_encode($products);
        } else {
            echo json_encode([]); // Return an empty array if no products are found
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        error_log("Database Error: " . $e->getMessage());
    }
}
?>