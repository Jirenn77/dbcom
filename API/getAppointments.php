<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
include 'db.php';

$host = "localhost"; 
$dbname = "dbcom"; 
$username = "root"; 
$password = ""; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

if (isset($_GET['action']) && $_GET['action'] === 'get_appointments') {
    try {
        $stmt = $conn->prepare("SELECT id, name, date FROM appointments ORDER BY date ASC");
        $stmt->execute();
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "appointments" => $appointments ?: [], // Always return an array
            "totalAppointments" => count($appointments)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage(), "appointments" => []]);
    }
}

function getAppointments($pdo) {
    try {
        $stmt = $pdo->query("SELECT id, patient_name, doctor_name, date, time, status FROM appointments ORDER BY date ASC");
        $appointments = $stmt->fetchAll();
        
        $totalAppointments = count($appointments);
        
        echo json_encode([
            "appointments" => $appointments,
            "totalAppointments" => $totalAppointments
        ]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error fetching appointments: " . $e->getMessage()]);
    }
}
?>
