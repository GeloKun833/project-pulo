<?php

declare(strict_types=1);

require_once __DIR__ . '/utils.php';

// Allow POST with _method=DELETE as well as raw DELETE
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
parse_str($_SERVER['QUERY_STRING'] ?? '', $queryParams);

if ($method === 'POST' && isset($_POST['_method']) && strtoupper($_POST['_method']) === 'DELETE') {
    $method = 'DELETE';
}

if ($method !== 'DELETE') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$id = 0;
if (!empty($queryParams['id'])) {
    $id = (int)$queryParams['id'];
} elseif (!empty($_POST['id'])) {
    $id = (int)$_POST['id'];
}

if ($id <= 0) {
    json_response(['error' => 'Invalid service id'], 400);
}

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('DELETE FROM services WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Service not found'], 404);
    }
    json_response(['success' => true]);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

