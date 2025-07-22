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

        case 'premium_services':
            try {
                $minPrice = isset($_GET['min_price']) ? (float) $_GET['min_price'] : 500.00;
                $membershipType = isset($_GET['membership_type']) ? strtolower(trim($_GET['membership_type'])) : null;

                // Validate membership type if provided
                if ($membershipType && !in_array($membershipType, ['vip', 'standard'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid membership type. Must be "vip" or "standard"']);
                    exit;
                }

                // Validate minimum price
                if ($minPrice < 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Minimum price cannot be negative']);
                    exit;
                }

                $services = getPremiumServices($pdo, $minPrice, $membershipType);
                header('Content-Type: application/json');
                echo json_encode($services);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
            }
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

        case 'get_memberships':
            echo json_encode(getMembershipsWithServices($pdo));
            break;

        case 'save_group':
            $rawInput = file_get_contents('php://input');
            file_put_contents("debug_input.json", $rawInput); // ✅ log input
            $data = json_decode($rawInput, true);

            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Invalid or missing JSON body.', 'raw' => $rawInput]);
                exit;
            }

            echo json_encode(saveGroup($pdo, $data));
            break;

        case 'update_service_mapping':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode(updateServiceMapping($pdo, $data));
            break;

        case 'update_service':
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON format: ' . json_last_error_msg(),
                    'raw' => $rawInput
                ]);
                exit;
            }
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

    $stmt = $pdo->query("SELECT * FROM promos ORDER BY promo_id");
    $promos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($promos as $promo) {
        $groupName = trim($promo['name']);
        $groupId = $promo['promo_id'];

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

        // Determine membership type based on discount value
        $type = ($discount['value'] == 50) ? 'vip' :
            (($discount['value'] == 30) ? 'standard' : 'custom');

        $stmtServices = $pdo->prepare("
            SELECT 
                s.service_id,
                s.name,
                s.category,
                s.price AS originalPrice,
                ROUND(s.price * (1 - (d.value / 100)), 2) AS discountedPrice,
                d.value AS discountPercentage
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
            'type' => $type,  // Added type field
            'value' => $discount['value'],  // Keep original value
            'discountType' => ($discount['value'] == 50 || $discount['value'] == 30) ? 'membership' : 'promotional',
            'status' => $discount['status'],
            'services' => $services
        ];
    }

    return $discounts;
}

function getMembershipsWithServices($pdo)
{
    $memberships = [];

    $stmt = $pdo->query("SELECT * FROM membership ORDER BY id");
    $membershipRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($membershipRows as $membership) {

        $discountValue = (float) str_replace('%', '', $membership['discount']);

        $stmtServices = $pdo->prepare("
            SELECT 
                service_id,
                name,
                category,
                price AS originalPrice,
                ROUND(price * (? / 100), 2) AS discountAmount,
                ROUND(price * (1 - (? / 100)), 2) AS discountedPrice,
                ? AS discountPercentage
            FROM services
            WHERE price >= 500
            ORDER BY name
        ");
        $stmtServices->execute([$discountValue, $discountValue, $discountValue]);
        $services = $stmtServices->fetchAll(PDO::FETCH_ASSOC);

        $memberships[] = [
            'id' => $membership['id'],
            'name' => $membership['name'],
            'description' => $membership['description'],
            'type' => strtolower($membership['name']),
            'discount' => $discountValue,
            'duration' => (int) $membership['duration'],
            'status' => $membership['status'],
            'services' => $services
        ];
    }

    return $memberships;
}

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

function getPremiumServices($pdo, $minPrice = 500.00, $membershipType = null)
{
    $query = "
        SELECT 
            service_id, 
            name, 
            category, 
            CAST(price AS DECIMAL(10,2)) AS originalPrice,
            description,
            duration
        FROM services
        WHERE price >= :minPrice
        ORDER BY price DESC, name
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':minPrice', $minPrice, PDO::PARAM_STR);
    $stmt->execute();
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($membershipType) {
        // Define discounts
        $discounts = [
            'vip' => 0.5,      // 50% for VIP
            'standard' => 0.3   // 30% for Standard
        ];
        $discount = $discounts[$membershipType];

        foreach ($services as &$service) {
            // Ensure originalPrice is treated as float
            $originalPrice = (float) $service['originalPrice'];

            // Calculate discounted price (rounded to 2 decimal places)
            $discountedPrice = round($originalPrice * (1 - $discount), 2);

            $service['originalPrice'] = number_format($originalPrice, 2, '.', '');
            $service['discountedPrice'] = number_format($discountedPrice, 2, '.', '');
            $service['discountPercentage'] = ($discount * 100) . '%';
            $service['membershipType'] = $membershipType;
        }
    }

    return $services;
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