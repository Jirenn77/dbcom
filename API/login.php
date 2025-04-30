<?php

// Include your database connection file
include 'dp.php'; // Ensure dp.php exists and has a valid PDO connection

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

error_log("Raw JSON input: " . file_get_contents("php://input"));

$data = json_decode(file_get_contents("php://input"), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Invalid JSON input', 'json_error' => json_last_error_msg()]);
    exit;
}

error_log("Decoded JSON: " . print_r($data, true));

if (!isset($data['email'], $data['password'])) {
    echo json_encode(['error' => 'Missing parameters', 'received' => $data]);
    exit;
}

// Login function
function login($pdo, $data) {
    if (isset($data['email'], $data['password'])) {
        $email = $data['email'];
        $password = $data['password'];

        // Check in the users table
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            if ($user['password'] === $password) {
                unset($user['password']);
                $user['role'] = 'customer'; // Assume role is customer
                echo json_encode($user);
                return;
            } else {
                echo json_encode(['error' => 'Invalid email or password']);
            }
        } else {
            echo json_encode(['error' => 'User not found']);
        }

        // Check in the admin table
        $adminStmt = $pdo->prepare("SELECT * FROM admin WHERE email = ?");
        $adminStmt->execute([$email]);
        $admin = $adminStmt->fetch();

        if ($admin) {
            if ($admin['password'] === $password) {
                unset($admin['password']);
                echo json_encode($admin);
                return;
            } else {
                echo json_encode(['error' => 'Invalid email or password']);
            }
        } else {
            echo json_encode(['error' => 'Admin not found']);
        }
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
}

// Register function
function register($pdo, $data) {
    if (!isset($data['email'], $data['password'], $data['role'])) {
        echo json_encode(['error' => 'Missing parameters']);
        return;
    }

    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    $role = $data['role'];

    try {
        if ($role === 'customer') {
            $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->execute([$email, $password]);
            echo json_encode(['success' => 'Customer registered successfully']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO admin (email, password, role) VALUES (?, ?, ?)");
            $stmt->execute([$email, $password, $role]);
            echo json_encode(['success' => ucfirst($role) . ' registered successfully']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

if (isset($_GET['action'])) {
    $action = $_GET['action'] ?? null;

    if ($action == 'login') {
        login($pdo, $data);
    } elseif ($action == 'register') {
        register($pdo, $data);
    }
}
?>
