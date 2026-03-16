<?php

declare(strict_types=1);

require_once __DIR__ . '/utils.php';

require_method('POST');

$body = get_json_input();
$username = trim($body['username'] ?? '');
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['error' => 'Username and password are required'], 400);
}

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, username, password FROM admins WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        json_response(['error' => 'Invalid credentials'], 401);
    }

    $_SESSION['admin_id'] = (int)$admin['id'];
    $_SESSION['username'] = $admin['username'];

    json_response([
        'success' => true,
        'user' => [
            'id' => (int)$admin['id'],
            'username' => $admin['username'],
        ],
    ]);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

