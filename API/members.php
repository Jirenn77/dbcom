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
        
        // If specific customer ID is requested
        if (isset($queryParams['customer_id'])) {
            $customerId = filter_var($queryParams['customer_id'], FILTER_SANITIZE_NUMBER_INT);
            
            $stmt = $pdo->prepare("
                SELECT * FROM memberships 
                WHERE customer_id = :customer_id
                ORDER BY expire_date DESC
            ");
            $stmt->bindParam(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->execute();
            
            $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($memberships);
            exit;
        }
        
        // If expiring filter is set
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
            
            $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($memberships);
            exit;
        }
        
        // Default - get all customer memberships
        $stmt = $pdo->prepare("
    SELECT cm.*, c.name, c.contact, c.email 
    FROM memberships cm
    JOIN customers c ON cm.customer_id = c.id
    ORDER BY cm.expire_date DESC
");

        $stmt->execute();
        
        $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($memberships);
        exit;
    }

    // POST - Create or renew membership
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['customer_id']) || !isset($input['membership_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer ID and Membership ID are required']);
            exit;
        }
        
        $customerId = filter_var($input['customer_id'], FILTER_SANITIZE_NUMBER_INT);
        $membershipId = filter_var($input['membership_id'], FILTER_SANITIZE_NUMBER_INT);
        $action = isset($input['action']) ? $input['action'] : 'create';
        
        // Get membership details
        $stmt = $pdo->prepare("SELECT * FROM memberships WHERE id = :id");
        $stmt->bindParam(':id', $membershipId, PDO::PARAM_INT);
        $stmt->execute();
        $membership = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$membership) {
            http_response_code(404);
            echo json_encode(['error' => 'Membership not found']);
            exit;
        }
        
        if ($action === 'renew') {
            // Renew existing membership
            $currentDate = date('Y-m-d');
            $expireDate = date('Y-m-d', strtotime("+{$membership['duration']} months"));
            
            $stmt = $pdo->prepare("
                UPDATE memberships 
                SET expire_date = :expire_date, 
                    remaining_balance = coverage,
                    date_registered = :current_date
                WHERE customer_id = :customer_id AND id = :membership_id
            ");
            
            $stmt->bindParam(':expire_date', $expireDate);
            $stmt->bindParam(':current_date', $currentDate);
            $stmt->bindParam(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->bindParam(':membership_id', $membershipId, PDO::PARAM_INT);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(['message' => 'Membership renewed successfully']);
            exit;
        } else {
            // Create new membership
            $currentDate = date('Y-m-d');
            $expireDate = date('Y-m-d', strtotime("+{$membership['duration']} months"));
            
            $stmt = $pdo->prepare("
                INSERT INTO memberships 
                (customer_id, type, coverage, remaining_balance, date_registered, expire_date) 
                VALUES 
                (:customer_id, :type, :coverage, :remaining_balance, :date_registered, :expire_date)
            ");
            
            $stmt->bindParam(':customer_id', $customerId, PDO::PARAM_INT);
            $stmt->bindParam(':type', $membership['name']);
            $stmt->bindParam(':coverage', $membership['coverage']);
            $stmt->bindParam(':remaining_balance', $membership['coverage']);
            $stmt->bindParam(':date_registered', $currentDate);
            $stmt->bindParam(':expire_date', $expireDate);
            $stmt->execute();
            
            $newId = $pdo->lastInsertId();
            
            http_response_code(201);
            echo json_encode([
                'message' => 'Membership created successfully',
                'id' => $newId
            ]);
            exit;
        }
    }

    // Method not allowed
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}