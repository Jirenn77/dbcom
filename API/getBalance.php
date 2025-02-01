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


$pdo = connectDatabase($host, $db, $user, $pass, $charset);

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


// function updateBalance($pdo, $customerID, $transactionType, $amount)
// {
//     $stmtBalance = $pdo->prepare("SELECT CurrentBalance FROM Balance WHERE CustomerID = ?");
//     $stmtBalance->execute([$customerID]);
//     $balance = $stmtBalance->fetch();

//     if ($balance) {
//         $currentBalance = $balance['CurrentBalance'];
//     } else {
//         $currentBalance = 0;
//         $pdo->prepare("INSERT INTO Balance (CustomerID, CurrentBalance) VALUES (?, ?)")->execute([$customerID, $currentBalance]);
//     }

//     $newBalance = $transactionType == 'Credit' ? $currentBalance + $amount : $currentBalance - $amount;

//     $stmtUpdate = $pdo->prepare("UPDATE Balance SET CurrentBalance = ? WHERE CustomerID = ?");
//     $stmtUpdate->execute([$newBalance, $customerID]);

//     return $newBalance;
// }

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
    error_log("Raw input: " . print_r($input, true));

    // Validate required fields
    if (empty($input['CustomerName']) || empty($input['TransactionType']) || empty($input['Amount']) || empty($input['ProductID']) || empty($input['Quantity']) || empty($input['DueDate'])) {
        echo json_encode(['error' => 'Missing required fields: CustomerName, TransactionType, Amount, ProductID, Quantity, and DueDate are required']);
        return;
    }

    $stmtCustomer = $pdo->prepare("SELECT CustomerID FROM customers WHERE CustomerName = ?");
    $stmtCustomer->execute([$input['CustomerName']]);
    $customerID = $stmtCustomer->fetchColumn();

    if (!$customerID) {
        echo json_encode(['error' => 'Customer not found']);
        return;
    }

    // Validate ProductID
    $productID = (int) trim($input['ProductID']);
    error_log("Received ProductID: " . $productID);

    $stmtProduct = $pdo->prepare("SELECT ProductID, Price FROM products WHERE ProductID = ?");
    $stmtProduct->execute([$productID]);
    $productData = $stmtProduct->fetch(PDO::FETCH_ASSOC);

    if (!$productData) {
        error_log("Invalid ProductID: " . $productID);
        echo json_encode(['error' => 'Invalid ProductID']);
        return;
    }

    $quantity = (int) $input['Quantity'];
    $totalAmount = $quantity * $productData['Price'];

    // Get DueDate from the input
    $dueDate = date('Y-m-d H:i:s', strtotime($input['DueDate'])); // Convert to correct datetime format

    // Insert the transaction
    $stmtTransaction = $pdo->prepare("INSERT INTO transactions (CustomerID, ProductID, TransactionType, Amount, TransactionDate, Description) VALUES (?, ?, ?, ?, NOW(), ?)");
    $paramsTransaction = [
        $customerID,
        $productID,
        $input['TransactionType'],
        $input['Amount'],
        $input['Description'] ?? null,
    ];

    if (!$stmtTransaction->execute($paramsTransaction)) {
        error_log('Failed to execute transaction insert: ' . implode(", ", $stmtTransaction->errorInfo()));
        echo json_encode(['error' => 'Failed to add transaction']);
        return;
    }

    // Set PaymentStatus based on TransactionType
    $paymentStatus = ($input['TransactionType'] === 'Debit') ? 'Paid' : 'Unpaid';

    // Insert the invoice
    $stmtInvoice = $pdo->prepare("INSERT INTO invoices (CustomerID, ProductID, Quantity, TotalAmount, InvoiceDate, DueDate, PaymentStatus) VALUES (?, ?, ?, ?, NOW(), ?, ?)");
    if (!$stmtInvoice->execute([$customerID, $productID, $quantity, $totalAmount, $dueDate, $paymentStatus])) {
        error_log('Failed to execute invoice insert: ' . implode(", ", $stmtInvoice->errorInfo()));
        echo json_encode(['error' => 'Failed to create invoice']);
        return;
    }

    // Insert into accountsreceivable
    $stmtAccountsReceivable = $pdo->prepare("INSERT INTO accountsreceivable (CustomerID, Amount) VALUES (?, ?)");
    if (!$stmtAccountsReceivable->execute([$customerID, $totalAmount])) {
        error_log('Failed to execute accountsreceivable insert: ' . implode(", ", $stmtAccountsReceivable->errorInfo()));
        echo json_encode(['error' => 'Failed to add to accounts receivable']);
        return;
    }

    // Insert into accountsreceivablehistory
    $stmtHistory = $pdo->prepare("INSERT INTO accountsreceivablehistory (CustomerID, ProductID, Amount, TransactionDate, Description) VALUES (?, ?, ?, NOW(), ?)");
    if (!$stmtHistory->execute([$customerID, $productID, $totalAmount, $input['Description'] ?? null])) {
        error_log('Failed to execute accountsreceivablehistory insert: ' . implode(", ", $stmtHistory->errorInfo()));
        echo json_encode(['error' => 'Failed to add to accounts receivable history']);
        return;
    }

    echo json_encode(['success' => 'Transaction, invoice, accounts receivable, and history added successfully']);
}




function getCustomers($pdo)
{
    $stmt = $pdo->query("SELECT CustomerID AS id, CustomerName AS name FROM customers");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($customers);
}



function getProducts($pdo)
{
    $stmt = $pdo->query("SELECT ProductID AS ProductID, ProductName AS ProductName, Price FROM Products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);
}

function getInvoices($pdo) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10; // Set a default limit of 10 invoices per page
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare("
        SELECT 
            i.InvoiceID, 
            c.CustomerName, 
            p.ProductName, 
            i.Quantity, 
            i.TotalAmount, 
            i.InvoiceDate, 
            i.DueDate, 
            i.PaymentStatus
        FROM invoices i
        JOIN customers c ON i.CustomerID = c.CustomerID
        JOIN products p ON i.ProductID = p.ProductID
        ORDER BY i.InvoiceDate DESC
        LIMIT :limit OFFSET :offset
    ");

    // Bind limit and offset
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total invoice count for pagination
    $totalStmt = $pdo->prepare("SELECT COUNT(*) as total FROM invoices");
    $totalStmt->execute();
    $totalInvoices = $totalStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'invoices' => $invoices,
        'totalInvoices' => $totalInvoices
    ]);
}

// Delete invoice by ID
function deleteInvoice($pdo, $invoiceID) {
    $stmt = $pdo->prepare("DELETE FROM invoices WHERE InvoiceID = :invoiceID");
    $stmt->bindParam(':invoiceID', $invoiceID, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Invoice deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete invoice']);
    }
}



ini_set('display_errors', 1);
error_reporting(E_ALL);

function viewBalance($pdo)
{
    // Check the request method first
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid request method.']);
        return;
    }

    if (isset($_GET['CustomerName'])) {
        $customerName = $_GET['CustomerName'];

        // Fetch customer data
        $stmtCustomer = $pdo->prepare("SELECT * FROM customers WHERE CustomerName = ?");
        $stmtCustomer->execute([$customerName]);
        $customer = $stmtCustomer->fetch(PDO::FETCH_ASSOC);

        if ($customer) {
            $customerID = $customer['CustomerID'];

            // Fetch current balance
            $stmtBalance = $pdo->prepare("SELECT CurrentBalance FROM Balance WHERE CustomerID = ?");
            $stmtBalance->execute([$customerID]);
            $balance = $stmtBalance->fetch(PDO::FETCH_ASSOC);

            // Fetch transaction history
            $stmtHistory = $pdo->prepare("
                SELECT t.*, p.ProductName, p.Price,
                CASE
                    WHEN t.TransactionType = 'Credit' THEN CONCAT('Payment made for ', p.ProductName)
                    WHEN t.TransactionType = 'Debit' THEN CONCAT('Purchase of ', p.ProductName)
                    ELSE 'Transaction'
                END AS TransactionDescription
                FROM transactions t 
                LEFT JOIN products p ON t.ProductID = p.ProductID 
                WHERE t.CustomerID = ? 
                ORDER BY t.TransactionDate DESC
            ");
            $stmtHistory->execute([$customerID]);
            $transactions = $stmtHistory->fetchAll(PDO::FETCH_ASSOC);

            // Fetch invoice quantities for the customer
            $stmtInvoices = $pdo->prepare("
                SELECT ProductID, Quantity 
                FROM invoices 
                WHERE CustomerID = ?
            ");
            $stmtInvoices->execute([$customerID]);
            $invoices = $stmtInvoices->fetchAll(PDO::FETCH_KEY_PAIR); // returns an associative array with ProductID as key and Quantity as value

            // Add Quantity to transactions
            foreach ($transactions as &$transaction) {
                $transaction['Quantity'] = $invoices[$transaction['ProductID']] ?? 0; // Default to 0 if not found
            }

            // Prepare the response
            $response = [
                'balance' => $balance['CurrentBalance'] ?? 0,
                'history' => $transactions ?: [],
                'customer' => $customer
            ];

            // Return the response as JSON
            header('Content-Type: application/json');
            echo json_encode($response);
        } else {
            // Return a valid JSON response if the customer is not found
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Customer not found']);
        }
    } else {
        // Return a valid JSON response if the CustomerName is missing
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Missing CustomerName']);
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


function login($pdo) {
    // Log incoming POST data
    
    error_log(print_r($_POST, true));

    if (isset($_POST['email'], $_POST['password'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Check in the users table
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            error_log('User found: ' . json_encode($user)); // Log user data for debugging
            if ($user['password'] === $password) {
                unset($user['password']); // Remove password from the response
                $user['role'] = 'customer'; // Assume role is customer
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
            error_log('Admin found: ' . json_encode($admin)); // Log admin data for debugging
            if ($admin['password'] === $password) {
                unset($admin['password']); // Remove password from the response
                echo json_encode($admin);
                return;
            } else {
                error_log('Admin password mismatch');
            }
        } else {
            error_log('Admin not found in admin table');
        }

        // If neither user nor admin was found, return an error
        echo json_encode(['error' => 'Invalid email or password']);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
}


function register($pdo)
{
    error_log(print_r($_POST, true)); // Log incoming POST data

    if (isset($_POST['email'], $_POST['password'], $_POST['role'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];
        $role = $_POST['role'];

        if ($role === 'customer') {
            $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->execute([$email, $password]); // Store plain text password
            echo json_encode(['success' => 'Customer registered successfully']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO admin (email, password, role) VALUES (?, ?, ?)");
            $stmt->execute([$email, $password, $role]);
            echo json_encode(['success' => ucfirst($role) . ' registered successfully']);
        }
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
}


function getAgingReport($pdo)
{
    $stmt = $pdo->query("
        SELECT 
            c.CustomerName,
            SUM(CASE WHEN i.PaymentStatus = 'Unpaid' THEN i.TotalAmount ELSE 0 END) AS TotalAmountDue,
            DATEDIFF(CURDATE(), MAX(i.InvoiceDate)) AS DaysOutstanding
        FROM invoices i
        JOIN customers c ON i.CustomerID = c.CustomerID
        GROUP BY c.CustomerName
    ");

    $agingReport = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($agingReport);
}



function markInvoiceAsPaid($pdo)
{
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['InvoiceID'])) {
        http_response_code(400);
        echo json_encode(['error' => 'InvoiceID is required']);
        return;
    }

    try {
        // Begin a transaction
        $pdo->beginTransaction();

        // Get the invoice amount and customer ID
        $stmt = $pdo->prepare("SELECT TotalAmount, CustomerID FROM invoices WHERE InvoiceID = ?");
        $stmt->execute([$input['InvoiceID']]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($invoice) {
            // Mark the invoice as paid
            $stmt = $pdo->prepare("UPDATE invoices SET PaymentStatus = 'Paid' WHERE InvoiceID = ?");
            $stmt->execute([$input['InvoiceID']]);

            // Deduct the invoice amount from the customer's balance
            $stmt = $pdo->prepare("UPDATE customers SET Balance = Balance - ? WHERE CustomerID = ?");
            $stmt->execute([$invoice['TotalAmount'], $invoice['CustomerID']]);

            // Commit the transaction
            $pdo->commit();
            http_response_code(200);
            echo json_encode(['success' => 'Invoice marked as paid and balance updated']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Invoice not found']);
        }
    } catch (PDOException $e) {
        // Rollback the transaction on error
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}


function sendPaymentReminders($pdo)
{
    // Query to fetch unpaid invoices older than 30 days
    $stmt = $pdo->query("
        SELECT c.Email, c.CustomerName, i.InvoiceID, i.TotalAmount 
        FROM Invoices i
        JOIN Customers c ON i.CustomerID = c.CustomerID
        WHERE i.PaymentStatus = 'Unpaid' AND DATEDIFF(CURDATE(), i.InvoiceDate) > 30
    ");
    
    $reminders = $stmt->fetchAll();

    // Log the retrieved reminders
    error_log('Reminders found: ' . print_r($reminders, true)); // Log results

    if (empty($reminders)) {
        echo json_encode(['success' => false, 'error' => 'No reminders to send.']);
        return;
    }

    $successfulReminders = 0;

    foreach ($reminders as $reminder) {
        $email = $reminder['Email'];
        $customerName = $reminder['CustomerName'];
        $invoiceID = $reminder['InvoiceID'];
        $totalAmount = $reminder['TotalAmount'];

        $subject = "Payment Reminder for Invoice #$invoiceID";
        $message = "
            <html>
            <head>
                <title>Payment Reminder</title>
            </head>
            <body>
                <p>Dear $customerName,</p>
                <p>This is a reminder that your payment for Invoice #$invoiceID of amount ₱$totalAmount is still pending.</p>
                <p>Please make the payment at your earliest convenience.</p>
                <p>Thank you!</p>
            </body>
            </html>
        ";

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: noreply@yourdomain.com" . "\r\n";

        if (mail($email, $subject, $message, $headers)) {
            $successfulReminders++;
        } else {
            error_log("Failed to send reminder to: " . $email . " for InvoiceID: " . $invoiceID);
        }
    }

    if ($successfulReminders > 0) {
        echo json_encode(['success' => "$successfulReminders payment reminders sent."]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to send any reminders.']);
    }
}




// Main logic to handle different API actions
if (isset($_GET['action'])) {
    $action = $_GET['action'] ?? null;

    if ($action == 'add_customer') {
        addCustomer($pdo);
    } elseif ($action == 'add_transaction') {
        addTransaction($pdo);
    } elseif ($action == 'view_balance') {
        viewBalance($pdo);
    } elseif ($action == 'get_transactions') {
        getTransactionsWithCustomerDetails($pdo);
    } elseif ($action == 'get_customers') {
        getCustomers($pdo);
    } elseif ($_GET['action'] === 'get_products') {
        getProducts($pdo);
    } elseif ($action == 'login') {
        login($pdo);
    } elseif ($action == 'register') {
        register($pdo);
    } elseif ($action == 'get_invoices') {
        getInvoices($pdo);
    } elseif ($action == 'delete_invoice') {
        deleteInvoice($pdo, $GET['id']);
    } elseif ($action == 'mark_invoice_paid') {
        markInvoiceAsPaid($pdo);
    } elseif ($action == 'get_aging_report') {
        getAgingReport($pdo);
    } elseif ($action == 'send_payment_reminders') {
        sendPaymentReminders($pdo);
    } else {
        error_log('Invalid action specified');
        echo json_encode(['success' => false, 'error' => 'Invalid action specified.']);
    }
} else {
    echo json_encode(['error' => 'No action specified']);
}