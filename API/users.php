<?php


$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:3000', // frontend dev
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Start session
session_start();

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_GET['action'] ?? '';
    $userId = $_GET['id'] ?? null;

    switch ($action) {
        case 'login':
            handleLogin($pdo);
            break;
        case 'add':
            handleAddUser($pdo);
            break;
        case 'update':
            handleUpdateUser($pdo, $userId);
            break;
        case 'delete':
            handleDeleteUser($pdo, $userId);
            break;
        case 'get':
            handleGetUser($pdo, $userId);
            break;
        case 'users':
        default:
            if ($userId) {
                handleGetUser($pdo, $userId);
            } else {
                $users = getUsersData($pdo);
                echo json_encode($users);
            }
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// ===== LOGIN FUNCTION =====
function handleLogin($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['email']) || empty($data['password'])) {
        echo json_encode(['error' => 'Missing parameters']);
        return;
    }

    $email = trim($data['email']);
    $password = trim($data['password']);

    // Check Users table for receptionist login
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Since passwords are stored in plain text, use direct comparison
    if ($user && $password === $user['password']) {
        $_SESSION['user_id'] = $user['user_id'];

        unset($user['password']); // Never send the password back
        echo json_encode([
            'success' => true,
            'role' => $user['role'], // Keep actual role from DB
            'redirect' => '/home2',
            'user' => $user
        ]);
        return;
    }

    echo json_encode(['error' => 'Invalid email or password']);
}


// Fetch All Users
function getUsersData($pdo) {
    $query = "SELECT 
                u.user_id AS id,
                u.name,
                u.username,
                u.role,
                u.email,
                u.created_at,
                b.name AS branchName
              FROM users u
              LEFT JOIN branches b ON u.branch_id = b.id";
    $stmt = $pdo->query($query);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Fake status until you add it in DB
        $row['status'] = "Active";
        $result[] = $row;
    }

    return $result;
}


// Get Single User
function handleGetUser($pdo, $userId) {
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }

    $stmt = $pdo->prepare("
        SELECT 
            u.user_id as id,
            u.name,
            u.username,
            u.email,
            b.name as branchName,
            u.created_at,
            b.id as branchId
        FROM users u
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.user_id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Role and Status
        $user['role'] = $user['branchName'] ?? 'No role assigned';
        $user['status'] = "Active"; // Static for now until DB column exists
        echo json_encode($user);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
}

// Add New User
function handleAddUser($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['name']) || !isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, username and password are required']);
        return;
    }

    if ($data['password'] !== $data['confirmPassword']) {
        http_response_code(400);
        echo json_encode(['error' => 'Passwords do not match']);
        return;
    }

    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users 
            (email, password, branch_id) 
        VALUES 
            (:email, :password, :branchId)
    ");

    try {
        $branchId = null;
        if (isset($data['role'])) {
            $branchStmt = $pdo->prepare("SELECT id FROM branches WHERE name = ?");
            $branchStmt->execute([$data['role']]);
            $branch = $branchStmt->fetch(PDO::FETCH_ASSOC);
            $branchId = $branch['id'] ?? null;
        }

        $stmt->execute([
            ':email' => $data['username'] . '@lizlyclinic.com',
            ':password' => $hashedPassword,
            ':branchId' => $branchId
        ]);

        $newUserId = $pdo->lastInsertId();
        
        $stmt = $pdo->prepare("
            SELECT 
                u.user_id as id,
                u.email,
                b.name as branchName,
                u.created_at
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.user_id = ?
        ");
        $stmt->execute([$newUserId]);
        $newUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $newUser['name'] = $data['name'];
        $newUser['username'] = $data['username'];
        $newUser['role'] = $newUser['branchName'] ?? 'No role assigned';

        http_response_code(201);
        echo json_encode($newUser);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add user: ' . $e->getMessage()]);
    }
}

// Update User
function handleUpdateUser($pdo, $userId) {
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($data === null || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input data']);
        return;
    }

    $fields = [];
    $params = [':id' => $userId];
    
    if (isset($data['email'])) {
        $fields[] = 'email = :email';
        $params[':email'] = $data['email'];
    }
    
    if (isset($data['role'])) {
        $branchStmt = $pdo->prepare("SELECT id FROM branches WHERE name = ?");
        $branchStmt->execute([$data['role']]);
        $branch = $branchStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($branch) {
            $fields[] = 'branch_id = :branchId';
            $params[':branchId'] = $branch['id'];
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields provided for update']);
        return;
    }

    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE user_id = :id";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            $stmt = $pdo->prepare("
                SELECT 
                    u.user_id as id,
                    u.email,
                    b.name as branchName,
                    u.created_at
                FROM users u
                LEFT JOIN branches b ON u.branch_id = b.id
                WHERE u.user_id = ?
            ");
            $stmt->execute([$userId]);
            $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $updatedUser['name'] = $data['name'] ?? 'User ' . $updatedUser['id'];
            $updatedUser['username'] = $data['username'] ?? 'user' . $updatedUser['id'];
            $updatedUser['role'] = $updatedUser['branchName'] ?? 'No role assigned';
            
            echo json_encode([
                'success' => true, 
                'message' => 'User updated successfully',
                'user' => $updatedUser
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found or no changes made']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update user: ' . $e->getMessage()]);
    }
}

// Delete User
function handleDeleteUser($pdo, $userId) {
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }

    $checkStmt = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ?");
    $checkStmt->execute([$userId]);
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }

    $deleteStmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
    
    try {
        $deleteStmt->execute([$userId]);
        
        if ($deleteStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete user: ' . $e->getMessage()]);
    }
}
