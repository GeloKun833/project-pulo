<?php

declare(strict_types=1);

require_once __DIR__ . '/utils.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $pdo = get_pdo();

    if (!empty($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $pdo->prepare('SELECT id, category, title, subtitle, details, location, start_at, end_at, image, created_at, updated_at FROM events WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            json_response(['error' => 'Event not found'], 404);
        }
        json_response(['event' => $row]);
    }

    $stmt = $pdo->query('SELECT id, category, title, subtitle, details, location, start_at, end_at, image, created_at, updated_at FROM events ORDER BY COALESCE(start_at, created_at) DESC, id DESC');
    $rows = $stmt->fetchAll();
    json_response(['events' => $rows]);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

