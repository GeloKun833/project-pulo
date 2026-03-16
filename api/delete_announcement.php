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
    json_response(['error' => 'Invalid announcement id'], 400);
}

try {
    $pdo = get_pdo();

    $stmt = $pdo->prepare('SELECT image FROM announcements WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        json_response(['error' => 'Announcement not found'], 404);
    }

    $stmt = $pdo->prepare('DELETE FROM announcements WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if (!empty($existing['image'])) {
        $path = UPLOAD_DIR . $existing['image'];
        if (is_file($path)) {
            @unlink($path);
        }
    }

    json_response(['success' => true]);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

