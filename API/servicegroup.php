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
        case 'all_services':
            echo json_encode(getAllServices($pdo));
            break;

        case 'get_groups':
            echo json_encode(getAllGroups($pdo));
            break;

        case 'get_groups_with_services':
            echo json_encode(getGroupsWithServices($pdo));
            break;

        case 'get_available_services':
            $groupId = (int) $_GET['group_id'];
            echo json_encode(getAvailableServices($pdo, $groupId));
            break;

        case 'get_deals_with_services':
            echo json_encode(getDealsWithServices($pdo));
            break;

        case 'get_discounts_with_services':
            echo json_encode(getDiscountsWithServices($pdo));
            break;

        case 'save_group':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(saveGroup($pdo, $data));
            break;

        case 'update_service_mapping':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(updateServiceMapping($pdo, $data));
            break;

        case 'update_service':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(updateService($pdo, $data));
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

function getAllServices($pdo)
{
    $stmt = $pdo->query("
        SELECT 
            service_id, 
            name, 
            category, 
            price AS originalPrice,
            ROUND(price * 0.9, 2) AS discountedPrice
        FROM services
        ORDER BY name
    ");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getDealsWithServices($pdo)
{
    $deals = [];

    // 1. Fetch promos
    $stmt = $pdo->query("SELECT * FROM promos ORDER BY promo_id");
    $promos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($promos as $promo) {
        $groupName = trim($promo['name']);
        $groupId = $promo['promo_id']; // use promo_id instead of group_id

        // 2. Fetch services mapped to this promo_id (assumes promo_id = group_id)
        $stmtServices = $pdo->prepare("
            SELECT 
                s.service_id,
                s.name,
                s.category,
                s.price AS originalPrice,
                ROUND(s.price * 0.9, 2) AS discountedPrice
            FROM 
                service_group_mappings gm
            JOIN 
                services s ON s.service_id = gm.service_id
            WHERE 
                gm.group_id = ?
            ORDER BY s.name
        ");
        $stmtServices->execute([$groupId]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        // 3. Join service names
        $serviceNames = array_column($services, 'name');
        $joinedNames = implode(' + ', $serviceNames);

        $deals[] = [
            'id' => $groupId,
            'name' => $groupName,
            'description' => $joinedNames,
            'details' => $promo['description'],
            'type' => 'promo',
            'validFrom' => $promo['valid_from'],
            'validTo' => $promo['valid_to'],
            'status' => $promo['status'],
            'services' => $services
        ];
    }

    return $deals;
}

function getDiscountsWithServices($pdo)
{
    $discounts = [];

    $stmt = $pdo->query("SELECT * FROM discounts ORDER BY discount_id");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $discount) {
        $discountId = $discount['discount_id'];

        $stmtServices = $pdo->prepare("
            SELECT 
                s.service_id,
                s.name,
                s.category,
                s.price AS originalPrice,
                ROUND(s.price * (1 - (d.value / 100)), 2) AS discountedPrice
            FROM 
                service_group_mappings gm
            JOIN 
                services s ON s.service_id = gm.service_id
            JOIN 
                discounts d ON d.discount_id = gm.group_id
            WHERE 
                gm.group_id = ?
        ");
        $stmtServices->execute([$discountId]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        $discounts[] = [
            'id' => $discountId,
            'name' => $discount['name'],
            'description' => $discount['description'],
            'type' => 'discount',
            'status' => $discount['status'],
            'services' => $services
        ];
    }

    return $discounts;
}

// Service Group functions
function getAllGroups($pdo)
{
    $stmt = $pdo->query("SELECT * FROM service_groups ORDER BY group_name");
    return $stmt->fetchAll();
}

function getGroupsWithServices($pdo)
{
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


function getAvailableServices($pdo, $groupId)
{
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

function saveGroup($pdo, $data)
{
    $pdo->beginTransaction();

    try {
        // Default type is 'custom' if not provided
        $groupType = $data['group_type'] ?? 'custom';

        if (empty($data['group_id'])) {
            // Create new group
            $stmt = $pdo->prepare("
                INSERT INTO service_groups (group_name, description, status, group_type) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['group_name'],
                $data['description'] ?? null,
                $data['status'] ?? 'Active',
                $groupType
            ]);
            $groupId = $pdo->lastInsertId();
        } else {
            // Check if group exists
            $stmt = $pdo->prepare("SELECT * FROM service_groups WHERE group_id = ?");
            $stmt->execute([$data['group_id']]);

            if ($stmt->rowCount() === 0) {
                // Insert new row if not found
                $stmtInsert = $pdo->prepare("
                    INSERT INTO service_groups (group_id, group_name, description, status, group_type) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmtInsert->execute([
                    $data['group_id'],
                    $data['group_name'],
                    $data['description'] ?? null,
                    $data['status'] ?? 'Active',
                    $groupType
                ]);
            } else {
                // Update existing group
                $stmtUpdate = $pdo->prepare("
                    UPDATE service_groups 
                    SET group_name = ?, description = ?, status = ?, group_type = ?
                    WHERE group_id = ?
                ");
                $stmtUpdate->execute([
                    $data['group_name'],
                    $data['description'] ?? null,
                    $data['status'] ?? 'Active',
                    $groupType,
                    $data['group_id']
                ]);
            }

            $groupId = $data['group_id'];
        }

        // Replace services
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


function updateServiceMapping($pdo, $data)
{
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

function updateService($pdo, $data)
{
    // Validate required fields
    if (!isset($data['id'], $data['name'], $data['price'], $data['duration'])) {
        return [
            'success' => false,
            'message' => 'Missing required fields: id, name, price, or duration'
        ];
    }

    try {
        // Prepare and execute the update query
        $stmt = $pdo->prepare("UPDATE services SET name = ?, price = ?, duration = ? WHERE service_id = ?");
        $success = $stmt->execute([
            $data['name'],
            $data['price'],
            $data['duration'],
            $data['id']
        ]);

        // Check if any row was actually updated
        if ($stmt->rowCount() === 0) {
            return [
                'success' => false,
                'message' => 'No changes made or service not found'
            ];
        }

        return ['success' => true];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ];
    }
}


?>