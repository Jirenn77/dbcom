<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include 'db.php';  // Ensure you have your database connection established in this file

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'get_product_details') {
    try {
        // Prepare and execute the query for product details
        $stmt = $conn->prepare("SELECT product_name, low_stock_count, all_items_count FROM product_details");
        $stmt->execute();

        // Fetch the results
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Initialize the response
        $response = [
            'low_stock_items' => 0,
            'all_items_groups' => 0,
            'all_items' => 0,
        ];

        foreach ($products as $product) {
            $response['low_stock_items'] += $product['low_stock_count'];
            $response['all_items_groups'] += 1; // Counting how many groups exist
            $response['all_items'] += $product['all_items_count'];
        }

        // Return the response as JSON
        echo json_encode($response);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}
?>
