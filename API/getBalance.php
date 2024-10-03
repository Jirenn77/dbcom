<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = 'localhost';
$db = 'dbcom';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

function connectDatabase($host, $db, $user, $pass, $charset)
{
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

$pdo = connectDatabase($host, $db, $user, $pass, $charset);

function updateBalance($pdo, $customerID, $transactionType, $amount)
{
    $stmtBalance = $pdo->prepare("SELECT CurrentBalance FROM Balance WHERE CustomerID = ?");
    $stmtBalance->execute([$customerID]);
    $balance = $stmtBalance->fetch();

    if ($balance) {
        $currentBalance = $balance['CurrentBalance'];
    } else {
        $currentBalance = 0;
        $pdo->prepare("INSERT INTO Balance (CustomerID, CurrentBalance) VALUES (?, ?)")->execute([$customerID, $currentBalance]);
    }

    $newBalance = $transactionType == 'Credit' ? $currentBalance + $amount : $currentBalance - $amount;

    $stmtUpdate = $pdo->prepare("UPDATE Balance SET CurrentBalance = ? WHERE CustomerID = ?");
    $stmtUpdate->execute([$newBalance, $customerID]);

    return $newBalance;
}

function addCustomer($pdo)
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log(print_r($input, true));

    if (empty($input['CustomerName'])) {
        echo json_encode(['error' => 'CustomerName is required']);
        return;
    }

    $stmt = $pdo->prepare("INSERT INTO customers (CustomerName, Email, ContactDetails) VALUES (?, ?, ?)");

    $params = [
        $input['CustomerName'],
        $input['Email'] ?? null,
        $input['ContactDetails'] ?? null,
    ];

    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => 'Customer added successfully']);
    } else {
        echo json_encode(['error' => 'Failed to add customer or no data provided']);
    }
}

include_once 'getBalance.php';


function addTransaction($pdo)
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log(print_r($input, true));

    if (empty($input['CustomerID']) || empty($input['TransactionType']) || empty($input['Amount'])) {
        echo json_encode(['error' => 'Missing required fields: CustomerID, TransactionType, and Amount are required']);
        return;
    }

    if ($input['Amount'] <= 0) {
        echo json_encode(['error' => 'Amount must be greater than zero']);
        return;
    }

    $stmt = $pdo->prepare("INSERT INTO AccountsReceivable (CustomerID, TransactionType, Amount, TransactionDate, Description) VALUES (?, ?, ?, NOW(), ?)");
    
    $params = [
        $input['CustomerID'],
        $input['TransactionType'],
        $input['Amount'],
        $input['Description'] ?? null,
    ];

    if (!$stmt->execute($params)) {
        echo json_encode(['error' => 'Failed to add transaction']);
        return;
    }

    $newBalance = updateBalance($pdo, $input['CustomerID'], $input['TransactionType'], $input['Amount'], $input['Description'] ?? null);

    $stmtHistory = $pdo->prepare("INSERT INTO AccountsReceivableHistory (CustomerID, TransactionType, Amount, TransactionDate, Description) VALUES (?, ?, ?, NOW(), ?)");
    $stmtHistory->execute([$input['CustomerID'], $input['TransactionType'], $input['Amount'], $input['Description'] ?? null]);

    echo json_encode(['success' => 'Transaction added successfully', 'new_balance' => $newBalance]);
}

if (!function_exists('updateBalance')) {
    function updateBalance($pdo, $customerID, $transactionType, $amount, $description = null)
    {
        $stmt = $pdo->prepare("SELECT CurrentBalance FROM balance WHERE CustomerID = ?");
        $stmt->execute([$customerID]);
        $currentBalance = $stmt->fetchColumn();

        if ($transactionType === 'Credit') {
            $newBalance = $currentBalance + $amount;
        } elseif ($transactionType === 'Debit') {
            $newBalance = $currentBalance - $amount;
        } else {
            throw new Exception('Invalid transaction type');
        }

        $stmtUpdate = $pdo->prepare("UPDATE balance SET CurrentBalance = ?, TransactionType = ?, Description = ? WHERE CustomerID = ?");
        $stmtUpdate->execute([$newBalance, $transactionType, $description, $customerID]);

        return $newBalance;
    }
}


ini_set('display_errors', 1);
error_reporting(E_ALL);

function viewBalance($pdo)
{
    if (isset($_GET['CustomerID'])) {
        $customerID = $_GET['CustomerID'];

        // Log the incoming CustomerID
        error_log("Fetching balance for CustomerID: " . $customerID);

        // Prepare statements
        $stmtBalance = $pdo->prepare("SELECT CurrentBalance FROM Balance WHERE CustomerID = ?");
        $stmtBalance->execute([$customerID]);
        $balance = $stmtBalance->fetch();

        $stmtHistory = $pdo->prepare("SELECT * FROM AccountsReceivableHistory WHERE CustomerID = ? ORDER BY TransactionDate DESC");
        $stmtHistory->execute([$customerID]);
        $history = $stmtHistory->fetchAll();

        // Log the fetched balance and history
        error_log("Fetched Balance: " . json_encode($balance));
        error_log("Fetched History: " . json_encode($history));

        // Prepare the response
        $response = [
            'balance' => $balance['CurrentBalance'] ?? 0,
            'history' => $history ?: [] // Ensure history is an array
        ];

        echo json_encode($response);
        return; // Exit after sending the response
    } else {
        // If CustomerID is missing, return an error
        error_log("Missing CustomerID");
        echo json_encode(['error' => 'Missing CustomerID']);
        return; // Exit after sending the error response
    }
}
    



function getTransactionsWithCustomerDetails($pdo)
{
    if (isset($_GET['CustomerID'])) {
        $customerID = $_GET['CustomerID'];

        $stmt = $pdo->prepare("
            SELECT 
                ar.TransactionID, 
                ar.TransactionType, 
                ar.Amount, 
                ar.TransactionDate, 
                ar.Description, 
                c.CustomerName, 
                c.Email, 
                c.ContactDetails
            FROM 
                AccountsReceivable ar
            INNER JOIN 
                Customers c ON ar.CustomerID = c.CustomerID
            WHERE 
                ar.CustomerID = ?
            ORDER BY 
                ar.TransactionDate DESC
        ");
        $stmt->execute([$customerID]);
        $transactions = $stmt->fetchAll();

        echo json_encode($transactions);
    } else {
        echo json_encode(['error' => 'Missing CustomerID']);
    }
}


function login($pdo)
{
    error_log(print_r($_POST, true)); // Log incoming POST data

    if (isset($_POST['email'], $_POST['password'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
        $stmt->execute([$email, $password]);
        $user = $stmt->fetch();
        echo json_encode($user);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
}

// Main logic to handle different API actions
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action == 'add_customer') {
        addCustomer($pdo);
    } elseif ($action == 'add_transaction') {
        addTransaction($pdo);
    } elseif ($action == 'view_balance') {
        viewBalance($pdo);
    } elseif ($action == 'get_transactions') {
        getTransactionsWithCustomerDetails($pdo);
    } elseif ($action == 'login') {
        login($pdo);
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }
} else {
    echo json_encode(['error' => 'No action specified']);
}
