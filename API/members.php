<?php
require_once 'path/to/your/connection/file.php'; // include your $conn

// Check request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all members
    $stmt = $conn->query('SELECT * FROM membership');
    $members = $stmt->fetchAll();
    echo json_encode($members);
} elseif ($method === 'POST') {
    // Create a new member
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $conn->prepare('INSERT INTO membership (name, email, membership_type) VALUES (?, ?, ?)');
    $stmt->execute([
        $data['name'],
        $data['email'],
        $data['membership_type']
    ]);

    echo json_encode(['message' => 'Member added successfully']);
} elseif ($method === 'PUT') {
    // Handle updates like payments etc.
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $conn->prepare('UPDATE membership SET paid = ? WHERE id = ?');
    $stmt->execute([
        $data['paid'],
        $data['id']
    ]);

    echo json_encode(['message' => 'Payment updated']);
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>
