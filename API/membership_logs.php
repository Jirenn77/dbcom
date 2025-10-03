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

    // ==============================
// GET - Fetch membership logs
// ==============================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $filter = $_GET['filter'] ?? 'all';

    $sql = "
        SELECT ml.*, 
               c.name AS name, 
               b.name AS branch_name, 
               u.name AS performed_by_name
        FROM membership_logs ml
        LEFT JOIN customers c ON ml.customer_id = c.id
        LEFT JOIN branches b ON ml.branch_id = b.id
        LEFT JOIN users u ON ml.performed_by = u.user_id
    ";

    $conditions = [];

    if (isset($_GET['customer_id'])) {
        $conditions[] = "ml.customer_id = :customer_id";
    }

    // ✅ Apply filter mapping
    if ($filter === 'new') {
        $conditions[] = "ml.action = 'New member'";
    } elseif ($filter === 'renewal') {
        $conditions[] = "ml.action = 'renewed'";
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY ml.timestamp DESC";

    $stmt = $pdo->prepare($sql);

    if (isset($_GET['customer_id'])) {
        $stmt->bindValue(':customer_id', (int) $_GET['customer_id'], PDO::PARAM_INT);
    }

    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}


    // ==============================
// POST - Insert membership log
// ==============================
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $required = ['customer_id', 'action', 'type', 'amount', 'payment_method', 'branch_id', 'performed_by'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing required field: $field"]);
                exit;
            }
        }

        $customerId = (int) $input['customer_id'];
        $membershipId = isset($input['membership_id']) ? (int) $input['membership_id'] : null;
        $action = strtolower(trim($input['action'])); // normalize to lowercase
        $type = $input['type'];
        $amount = (float) $input['amount'];
        $paymentMethod = $input['payment_method'];
        $branchId = (int) $input['branch_id'];
        $performedBy = (int) $input['performed_by'];
        $timestamp = date('Y-m-d H:i:s');

        // ✅ Normalize action values
        if ($action === 'create') {
            $action = 'new member';
        } elseif ($action === 'renew') {
            $action = 'renewed';
        }

        // Skip logging if amount is zero and not a new membership creation
        if ($amount == 0 && $action !== 'new member') {
            echo json_encode(['skipped' => true, 'message' => 'Log skipped: zero amount for non-new action']);
            exit;
        }

        // Duplicate check
        $check = $pdo->prepare("
        SELECT COUNT(*) FROM membership_logs
        WHERE customer_id = :customer_id
          AND membership_id <=> :membership_id
          AND action = :action
          AND type = :type
          AND amount = :amount
          AND payment_method = :payment_method
          AND branch_id = :branch_id
          AND performed_by = :performed_by
          AND DATE(timestamp) = CURDATE()
    ");
        $check->execute([
            ':customer_id' => $customerId,
            ':membership_id' => $membershipId,
            ':action' => $action,
            ':type' => $type,
            ':amount' => $amount,
            ':payment_method' => $paymentMethod,
            ':branch_id' => $branchId,
            ':performed_by' => $performedBy
        ]);

        if ($check->fetchColumn() > 0) {
            echo json_encode(['error' => 'Duplicate membership log detected. Log not inserted.']);
            exit;
        }

        // Insert log
        $stmt = $pdo->prepare("
        INSERT INTO membership_logs 
        (customer_id, membership_id, action, type, amount, payment_method, branch_id, performed_by, timestamp)
        VALUES 
        (:customer_id, :membership_id, :action, :type, :amount, :payment_method, :branch_id, :performed_by, :timestamp)
    ");
        $stmt->execute([
            ':customer_id' => $customerId,
            ':membership_id' => $membershipId,
            ':action' => $action,
            ':type' => $type,
            ':amount' => $amount,
            ':payment_method' => $paymentMethod,
            ':branch_id' => $branchId,
            ':performed_by' => $performedBy,
            ':timestamp' => $timestamp
        ]);

        echo json_encode(['success' => true, 'message' => 'Membership log saved']);
        exit;
    }


    // Method not allowed
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
