<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get action and period from query parameters
    $action = isset($_GET['action']) ? $_GET['action'] : 'dashboard';
    $period = isset($_GET['period']) ? $_GET['period'] : 'day';

    // Handle different endpoints
    switch ($action) {         
        case 'get_groups':
            echo json_encode(getAllGroups($pdo));
            break;
            
        case 'get_groups_with_services':
            echo json_encode(getGroupsWithServices($pdo));
            break;
            
        case 'get_available_services':
            $groupId = (int)$_GET['group_id'];
            echo json_encode(getAvailableServices($pdo, $groupId));
            break;
            
        case 'save_group':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(saveGroup($pdo, $data));
            break;
            
        case 'update_service_mapping':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(updateServiceMapping($pdo, $data));
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}


// Service Group functions
function getAllGroups($pdo) {
    $stmt = $pdo->query("SELECT * FROM service_groups ORDER BY group_name");
    return $stmt->fetchAll();
}

function getGroupsWithServices($pdo) {
    $stmt = $pdo->query("SELECT * FROM service_groups ORDER BY group_name");
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($groups as &$group) {
        $groupName = trim($group['group_name']);

        // Fetch services mapped by group name
        $stmtServices = $pdo->prepare("
            SELECT s.service_id, s.name, s.price, s.description, s.duration
            FROM services s
            WHERE TRIM(s.category) = ?
            ORDER BY s.name
        ");
        $stmtServices->execute([$groupName]);

        $group['services'] = $stmtServices->fetchAll(PDO::FETCH_ASSOC);
    }

    return $groups;
}


function getAvailableServices($pdo, $groupId) {
    $stmt = $pdo->prepare("
        SELECT s.service_id, s.name, s.price, s.description, s.duration
        FROM services s
        WHERE s.service_id NOT IN (
            SELECT service_id FROM service_group_mappings WHERE group_id = ?
        )
        ORDER BY s.name
    ");
    $stmt->execute([$groupId]);
    return $stmt->fetchAll();
}

function saveGroup($pdo, $data) {
    $pdo->beginTransaction();
    
    try {
        if (empty($data['group_id'])) {
            // Create new group
            $stmt = $pdo->prepare("
                INSERT INTO service_groups (group_name, description, status) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $data['group_name'],
                $data['description'] ?? null,
                $data['status'] ?? 'Active'
            ]);
            $groupId = $pdo->lastInsertId();
        } else {
            // Update existing group
            $stmt = $pdo->prepare("
                UPDATE service_groups 
                SET group_name = ?, description = ?, status = ?
                WHERE group_id = ?
            ");
            $stmt->execute([
                $data['group_name'],
                $data['description'] ?? null,
                $data['status'] ?? 'Active',
                $data['group_id']
            ]);
            $groupId = $data['group_id'];
        }
        
        // Update service mappings
        $stmt = $pdo->prepare("DELETE FROM service_group_mappings WHERE group_id = ?");
        $stmt->execute([$groupId]);
        
        if (!empty($data['services'])) {
            $stmt = $pdo->prepare("
                INSERT INTO service_group_mappings (group_id, service_id) 
                VALUES (?, ?)
            ");
            foreach ($data['services'] as $serviceId) {
                $stmt->execute([$groupId, $serviceId]);
            }
        }
        
        $pdo->commit();
        return ['success' => true, 'group_id' => $groupId];
    } catch (PDOException $e) {
        $pdo->rollBack();
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function updateServiceMapping($pdo, $data) {
    try {
        if ($data['action'] === 'add') {
            $stmt = $pdo->prepare("
                INSERT INTO service_group_mappings (group_id, service_id)
                VALUES (?, ?)
            ");
            $success = $stmt->execute([$data['group_id'], $data['service_id']]);
        } else {
            $stmt = $pdo->prepare("
                DELETE FROM service_group_mappings
                WHERE group_id = ? AND service_id = ?
            ");
            $success = $stmt->execute([$data['group_id'], $data['service_id']]);
        }
        
        return ['success' => $success];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}


?>