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
        $stmt = $pdo->prepare('SELECT id, title, description, image, date_posted FROM announcements WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            json_response(['error' => 'Announcement not found'], 404);
        }
        json_response(['announcement' => $row]);
    }

    $stmt = $pdo->query('SELECT id, title, description, image, date_posted FROM announcements ORDER BY date_posted DESC, id DESC');
    $rows = $stmt->fetchAll();

    json_response(['announcements' => $rows]);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

