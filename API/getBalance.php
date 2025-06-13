<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = 'localhost';
$db = 'dbcom';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

function login($pdo) {
    error_log(print_r($_POST, true));

    if (isset($_POST['email'], $_POST['password'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Check in the users table
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            error_log('User found: ' . json_encode($user));
            if ($user['password'] === $password) {
                unset($user['password']);
                $user['role'] = 'customer';
                echo json_encode($user);
                return;
            } else {
                error_log('User password mismatch');
            }
        } else {
            error_log('User not found in users table');
        }

        // Check in the admin table
        $adminStmt = $pdo->prepare("SELECT * FROM admin WHERE email = ?");
        $adminStmt->execute([$email]);
        $admin = $adminStmt->fetch();

        if ($admin) {
            error_log('Admin found: ' . json_encode($admin));
            if ($admin['password'] === $password) {
                unset($admin['password']);
                echo json_encode($admin);
                return;
            } else {
                error_log('Admin password mismatch');
            }
        } else {
            error_log('Admin not found in admin table');
        }

        echo json_encode(['error' => 'Invalid email or password']);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
}

function register() {
    $rawData = file_get_contents('php://input');
    error_log("Raw request data: " . $rawData);

    $data = json_decode($rawData, true);

    error_log("Decoded data: " . print_r($data, true));

    if (!isset($data['email'], $data['password'], $data['role'], $data['captchaToken'])) {
        echo json_encode(['error' => 'Missing parameters']);
        return;
    }

    // Validate ReCAPTCHA
    $captchaToken = $data['captchaToken'];
    $secretKey = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    $url = "https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$captchaToken";
    $response = file_get_contents($url);
    $responseKeys = json_decode($response, true);

    if (intval($responseKeys["success"])) {
        // ReCAPTCHA validation passed
    } else {
        echo json_encode(['error' => 'Invalid CAPTCHA']);
        return;
    }

    // Sanitize inputs
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    $role = $data['role'];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // Validate password
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $password)) {
        echo json_encode(['error' => 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.']);
        return;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert into database
    try {
        $host = 'localhost';
        $db = 'dbcom';
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, $user, $pass, $options);

        if ($role === 'customer') {
            $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->execute([$email, $hashedPassword]);
            echo json_encode(['success' => 'Customer registered successfully']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO admin (email, password, role) VALUES (?, ?, ?)");
            $stmt->execute([$email, $hashedPassword, $role]);
            echo json_encode(['success' => ucfirst($role) . ' registered successfully']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// Main logic to handle different API actions
if (isset($_GET['action'])) {
    $action = $_GET['action'] ?? null;

    if ($action == 'login') {
        login($pdo);
    } elseif ($action == 'register') {
        register();
    } else {
        error_log('Invalid action specified');
        echo json_encode(['success' => false, 'error' => 'Invalid action specified.']);
    }
} else {
    echo json_encode(['error' => 'No action specified']);
}