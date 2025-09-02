<?php

// Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
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
    $branchId = $_GET['id'] ?? null;

    switch ($action) {
        case 'user':
            $user = getCurrentUserWithBranch($pdo);
            echo json_encode($user);
            break;

        case 'add':
            handleAddBranch($pdo);
            break;

        case 'update':
            handleUpdateBranch($pdo, $branchId);
            break;

        case 'delete':
            handleDeleteBranch($pdo, $branchId);
            break;

        case 'get':
            handleGetBranch($pdo, $branchId);
            break;

        case 'branches':
        default:
            if ($branchId) {
                handleGetBranch($pdo, $branchId);
            } else {
                $branches = getBranchesData($pdo);
                echo json_encode($branches);
            }
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// Fetch Logged In User + Branch
function getCurrentUserWithBranch($pdo) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        return [
            'error' => 'User not authenticated',
            'session_debug' => $_SESSION,
            'session_id' => session_id()
        ];
    }

    $stmt = $pdo->prepare("
        SELECT 
            u.user_id, u.email, u.branch_id, 
            b.name AS branch_name, b.color_code 
        FROM users u
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.user_id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        return $user;
    } else {
        http_response_code(404);
        return ['error' => 'User not found'];
    }
}

// Fetch All Branches
// Fetch All Branches
function getBranchesData($pdo) {
    $query = "SELECT id, name, color_code as colorCode, address, contact_number as contactNumber, manager FROM branches";
    $stmt = $pdo->query($query);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Only add dummy data if fields are NULL
        $row['address'] = $row['address'] ?? 'Not available';
        $row['contactNumber'] = $row['contactNumber'] ?? 'Not available';
        $row['manager'] = $row['manager'] ?? 'Not assigned';
        $row['users'] = 0;
        $row['employees'] = 0;
        $result[] = $row;
    }

    return $result;
}

// Get Single Branch
// Get Single Branch
function handleGetBranch($pdo, $branchId) {
    if (!$branchId) {
        http_response_code(400);
        echo json_encode(['error' => 'Branch ID is required']);
        return;
    }

    $stmt = $pdo->prepare("
        SELECT 
            id, name, color_code as colorCode, 
            address, contact_number as contactNumber, manager,
            (SELECT COUNT(*) FROM users WHERE branch_id = branches.id) as users,
            (SELECT COUNT(*) FROM employees WHERE branch_id = branches.id) as employees
        FROM branches 
        WHERE id = ?
    ");
    $stmt->execute([$branchId]);
    $branch = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($branch) {
        // Only set defaults if fields are NULL
        $branch['address'] = $branch['address'] ?? 'Not available';
        $branch['contactNumber'] = $branch['contactNumber'] ?? 'Not available';
        $branch['manager'] = $branch['manager'] ?? 'Not assigned';
        echo json_encode($branch);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Branch not found']);
    }
}

// Add New Branch
// Add New Branch
function handleAddBranch($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO branches (name, color_code, address, contact_number, manager)
        VALUES (:name, :colorCode, :address, :contactNumber, :manager)
    ");

    try {
        $stmt->execute([
            ':name' => $data['name'],
            ':colorCode' => $data['colorCode'] ?? '#3B82F6',
            ':address' => $data['address'] ?? null,
            ':contactNumber' => $data['contactNumber'] ?? null,
            ':manager' => $data['manager'] ?? null
        ]);

        $newBranchId = $pdo->lastInsertId();
        // Get the newly created branch with all fields
        $stmt = $pdo->prepare("SELECT id, name, color_code as colorCode, address, contact_number as contactNumber, manager FROM branches WHERE id = ?");
        $stmt->execute([$newBranchId]);
        $newBranch = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Set defaults for NULL values
        $newBranch['address'] = $newBranch['address'] ?? 'Not available';
        $newBranch['contactNumber'] = $newBranch['contactNumber'] ?? 'Not available';
        $newBranch['manager'] = $newBranch['manager'] ?? 'Not assigned';
        $newBranch['users'] = 0;
        $newBranch['employees'] = 0;

        http_response_code(201);
        echo json_encode($newBranch);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add branch: ' . $e->getMessage()]);
    }
}

// Update Branch
function handleUpdateBranch($pdo, $branchId) {
    if (!$branchId) {
        http_response_code(400);
        echo json_encode(['error' => 'Branch ID is required']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($data === null || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input data']);
        return;
    }

    // Prepare the update fields
    $fields = [];
    $params = [':id' => $branchId];
    
    if (isset($data['name'])) {
        $fields[] = 'name = :name';
        $params[':name'] = $data['name'];
    }
    
    if (isset($data['colorCode'])) {
        $fields[] = 'color_code = :colorCode';
        $params[':colorCode'] = $data['colorCode'];
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields provided for update']);
        return;
    }

    $sql = "UPDATE branches SET " . implode(', ', $fields) . " WHERE id = :id";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Branch updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Branch not found or no changes made']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update branch: ' . $e->getMessage()]);
    }
}

// Delete Branch
function handleDeleteBranch($pdo, $branchId) {
    if (!$branchId) {
        http_response_code(400);
        echo json_encode(['error' => 'Branch ID is required']);
        return;
    }

    // Check if branch exists
    $checkStmt = $pdo->prepare("SELECT id FROM branches WHERE id = ?");
    $checkStmt->execute([$branchId]);
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Branch not found']);
        return;
    }

    // Check for associated users or employees
    $usersStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE branch_id = ?");
    $usersStmt->execute([$branchId]);
    $userCount = $usersStmt->fetchColumn();

    $employeesStmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE branch_id = ?");
    $employeesStmt->execute([$branchId]);
    $employeeCount = $employeesStmt->fetchColumn();

    if ($userCount > 0 || $employeeCount > 0) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Cannot delete branch with associated users or employees',
            'userCount' => $userCount,
            'employeeCount' => $employeeCount
        ]);
        return;
    }

    // Delete the branch
    $deleteStmt = $pdo->prepare("DELETE FROM branches WHERE id = ?");
    
    try {
        $deleteStmt->execute([$branchId]);
        
        if ($deleteStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Branch deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Branch not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete branch: ' . $e->getMessage()]);
    }
}