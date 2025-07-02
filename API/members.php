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

    // Handle CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // GET - Fetch customer memberships
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $queryParams = $_GET;

        if (isset($queryParams['customer_id'])) {
            $customerId = filter_var($queryParams['customer_id'], FILTER_SANITIZE_NUMBER_INT);
            $stmt = $pdo->prepare("SELECT * FROM memberships WHERE customer_id = :customer_id ORDER BY expire_date DESC");
            $stmt->bindParam(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        if (isset($queryParams['expiring'])) {
            $daysThreshold = filter_var($queryParams['expiring'], FILTER_SANITIZE_NUMBER_INT);
            $currentDate = date('Y-m-d');
            $futureDate = date('Y-m-d', strtotime("+$daysThreshold days"));

            $stmt = $pdo->prepare("
                SELECT cm.*, c.first_name, c.last_name, c.email, c.phone 
                FROM memberships cm
                JOIN customers c ON cm.customer_id = c.id
                WHERE cm.expire_date BETWEEN :current_date AND :future_date
                ORDER BY cm.expire_date ASC
            ");
            $stmt->bindParam(':current_date', $currentDate);
            $stmt->bindParam(':future_date', $futureDate);
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT cm.*, c.name, c.contact, c.email 
            FROM memberships cm
            JOIN customers c ON cm.customer_id = c.id
            ORDER BY cm.expire_date DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // POST - Create or Renew Membership
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['customer_id']) || !isset($input['membership_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer ID and Membership ID are required']);
            exit;
        }

        $customerId = (int)$input['customer_id'];
        $membershipId = (int)$input['membership_id'];
        $action = $input['action'] ?? 'create';
        $type = $input['type'] ?? 'standard';
        $coverage = (int)($input['coverage'] ?? 5000);
        $duration = (int)($input['duration'] ?? 1);
        $paymentMethod = $input['payment_method'] ?? 'cash';

        // Get base membership record (used for existing info like type/duration)
        $stmt = $pdo->prepare("SELECT * FROM memberships WHERE id = :id");
        $stmt->bindParam(':id', $membershipId, PDO::PARAM_INT);
        $stmt->execute();
        $membership = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$membership) {
            http_response_code(404);
            echo json_encode(['error' => 'Membership not found']);
            exit;
        }

        $currentDate = date('Y-m-d');
        $expireDate = date('Y-m-d', strtotime("+$duration months"));

        if ($action === 'renew') {
            // Renew existing membership
            $stmt = $pdo->prepare("
                UPDATE memberships 
                SET 
                    expire_date = :expire_date,
                    date_registered = :current_date,
                    remaining_balance = :coverage,
                    type = :type,
                    coverage = :coverage
                WHERE customer_id = :customer_id AND id = :membership_id
            ");
            $stmt->bindParam(':expire_date', $expireDate);
            $stmt->bindParam(':current_date', $currentDate);
            $stmt->bindParam(':coverage', $coverage);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->bindParam(':membership_id', $membershipId, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            // Create new membership
            $stmt = $pdo->prepare("
                INSERT INTO memberships 
                (customer_id, type, coverage, remaining_balance, date_registered, expire_date, payment_method)
                VALUES 
                (:customer_id, :type, :coverage, :remaining_balance, :date_registered, :expire_date, :payment_method)
            ");
            $stmt->bindParam(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':coverage', $coverage);
            $stmt->bindParam(':remaining_balance', $coverage);
            $stmt->bindParam(':date_registered', $currentDate);
            $stmt->bindParam(':expire_date', $expireDate);
            $stmt->bindParam(':payment_method', $paymentMethod);
            $stmt->execute();
        }

        // Return updated membership data
        $stmt = $pdo->prepare("SELECT * FROM memberships WHERE id = :id");
        $stmt->bindParam(':id', $membershipId, PDO::PARAM_INT);
        $stmt->execute();
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($updated);
        exit;
    }

    // Method not allowed
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
