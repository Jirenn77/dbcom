<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
require_once 'db.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=dbcom", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get action and period from query parameters
    $action = isset($_GET['action']) ? $_GET['action'] : 'dashboard';
    $period = isset($_GET['period']) ? $_GET['period'] : 'day';
    $date = isset($_GET['date']) ? $_GET['date'] : null;

    // Handle different endpoints
    switch ($action) {
    case 'dashboard':
        echo json_encode(getDashboardData($pdo, $period, $date));
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

function getDashboardData($pdo, $period, $date = null) {
    return [
        'top_services' => getTopServicesData($pdo, $period, $date),
        'revenue_by_service' => getRevenueByServiceData($pdo, $period, $date),
        'branches' => getBranchesData($pdo),
        'revenue_distribution' => getRevenueDistributionData($pdo, $period, $date)
    ];
}


// Get top 5 ordered services (UPDATED)
function getTopServicesData($pdo, $period, $date = null) {
    $dateCondition = getDateCondition($period, 'o', $date);
    
    $query = "SELECT 
                s.name, 
                COUNT(o.order_id) as count
              FROM orders o
              JOIN services s ON o.service_id = s.service_id
              WHERE $dateCondition
              GROUP BY s.name
              ORDER BY count DESC
              LIMIT 5";
    
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $result = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $result[] = [
                'name' => $row['name'],
                'count' => (int)$row['count']
            ];
        }
        
        // Fallback sample data if no results
        if (empty($result)) {
            return [
                ['name' => 'Haircut/Style', 'count' => 15],
                ['name' => 'Facial Spa', 'count' => 12],
                ['name' => 'Classic Pedicure', 'count' => 10],
                ['name' => 'UA Diode Laser', 'count' => 8],
                ['name' => 'Hair Spa', 'count' => 7]
            ];
        }
        
        return $result;
        
    } catch (PDOException $e) {
        error_log("Top Services Error: " . $e->getMessage());
        return [
            ['name' => 'Haircut/Style', 'count' => 0],
            ['name' => 'Facial Spa', 'count' => 0],
            ['name' => 'Classic Pedicure', 'count' => 0],
            ['name' => 'UA Diode Laser', 'count' => 0],
            ['name' => 'Hair Spa', 'count' => 0]
        ];
    }
}

// Get top 5 revenue generating services (UPDATED)
function getRevenueByServiceData($pdo, $period) {
    $dateCondition = getDateCondition($period, 'o');
    
    $query = "SELECT 
                s.name, 
                SUM(o.amount) as revenue
              FROM orders o
              JOIN services s ON o.service_id = s.service_id
              WHERE $dateCondition
              GROUP BY s.name
              ORDER BY revenue DESC
              LIMIT 5";
    
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $result = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $result[] = [
                'name' => $row['name'],
                'revenue' => (float)$row['revenue']
            ];
        }
        
        // Fallback sample data if no results
        if (empty($result)) {
            return [
                ['name' => 'All Parts Diode Laser', 'revenue' => 5000],
                ['name' => '3D Balayage', 'revenue' => 2500],
                ['name' => 'Brazilian', 'revenue' => 1500],
                ['name' => 'Classic Balayage', 'revenue' => 1500],
                ['name' => 'Face', 'revenue' => 1300]
            ];
        }
        
        return $result;
        
    } catch (PDOException $e) {
        error_log("Revenue by Service Error: " . $e->getMessage());
        return [
            ['name' => 'All Parts Diode Laser', 'revenue' => 0],
            ['name' => '3D Balayage', 'revenue' => 0],
            ['name' => 'Brazilian', 'revenue' => 0],
            ['name' => 'Classic Balayage', 'revenue' => 0],
            ['name' => 'Face', 'revenue' => 0]
        ];
    }
}

function getBranchesData($pdo) {
    $query = "SELECT id, name, color_code FROM branches";
    $stmt = $pdo->query($query);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $result[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'color_code' => $row['color_code']
        ];
    }

    return $result;
}
function getRevenueDistributionData($pdo, $period) {
    try {
        // 1. Get branches
        $branches = $pdo->query("SELECT id, name, color_code FROM branches")->fetchAll(PDO::FETCH_ASSOC);
        if (empty($branches)) return [];

        // 2. Get date condition
        $dateCondition = getDateCondition($period, 'orders');
        
        // 3. Calculate totals
        $totalStmt = $pdo->prepare("SELECT SUM(amount) FROM orders WHERE $dateCondition");
        $totalStmt->execute();
        $totalRevenue = (float)$totalStmt->fetchColumn();
        
        // 4. Process branches
        $result = [];
        $branchStmt = $pdo->prepare("
            SELECT SUM(amount) 
            FROM orders 
            WHERE branch_id = :branch_id AND $dateCondition
        ");
        
        foreach ($branches as $branch) {
            $branchStmt->execute([':branch_id' => $branch['id']]);
            $revenue = (float)$branchStmt->fetchColumn() ?: 0;
            
            $result[] = [
                'branch_id' => $branch['id'],
                'branch_name' => $branch['name'],
                'color_code' => $branch['color_code'],
                'revenue' => $revenue,
                'percentage' => $totalRevenue > 0 ? round(($revenue/$totalRevenue)*100, 2) : 0
            ];
        }
        
        // 5. Sort by revenue
        usort($result, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        
        return $result;
        
    } catch (PDOException $e) {
        error_log("Revenue Distribution Error: " . $e->getMessage());
        return [];
    }
}

function getDateCondition($period, $tableAlias, $date = null) {
    $column = "$tableAlias.created_at";

    switch ($period) {
        case 'day':
            return "$column >= CURDATE()";
        case 'week':
            return "$column >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        case 'month':
            return "$column >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
        case 'year':
            return "$column >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
        case 'custom':
            if ($date) {
                return "$column BETWEEN '{$date} 00:00:00' AND '{$date} 23:59:59'";
            } else {
                return "1=1"; // fallback to no filter
            }
        default:
            return "$column >= CURDATE()";
    }
}

?>
