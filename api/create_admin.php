<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

$pdo = get_pdo();

// Default credentials - change these later if you want
$username = 'pulo';
$password = 'pulo';

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('SELECT id FROM admins WHERE username = :u LIMIT 1');
$stmt->execute([':u' => $username]);
$existing = $stmt->fetch();

if ($existing) {
    $stmt = $pdo->prepare('UPDATE admins SET password = :p WHERE username = :u');
    $stmt->execute([':u' => $username, ':p' => $hash]);
} else {
    $stmt = $pdo->prepare('INSERT INTO admins (username, password) VALUES (:u, :p)');
    $stmt->execute([':u' => $username, ':p' => $hash]);
}

echo "Admin created: $username / $password\n";

