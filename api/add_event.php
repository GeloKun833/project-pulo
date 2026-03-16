<?php

declare(strict_types=1);

require_once __DIR__ . '/utils.php';

require_method('POST');
require_auth();
ensure_upload_dir();

function handle_event_upload(?array $file): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        json_response(['error' => 'Image upload failed'], 400);
    }
    $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = detect_mime_type($file['tmp_name']);
    if (!$mime || !isset($allowedTypes[$mime])) {
        json_response(['error' => 'Unsupported image type'], 400);
    }
    $extension = $allowedTypes[$mime];
    $basename = bin2hex(random_bytes(16));
    $filename = $basename . '.' . $extension;
    $targetPath = UPLOAD_DIR . $filename;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        json_response(['error' => 'Failed to save uploaded image'], 500);
    }
    return $filename;
}

$category = trim($_POST['category'] ?? '');
$title = trim($_POST['title'] ?? '');
$subtitle = trim($_POST['subtitle'] ?? '');
$details = trim($_POST['details'] ?? '');
$location = trim($_POST['location'] ?? '');
$startAt = trim($_POST['start_at'] ?? '');
$endAt = trim($_POST['end_at'] ?? '');

if ($title === '') {
    json_response(['error' => 'Title is required'], 400);
}

$imageFilename = handle_event_upload($_FILES['image'] ?? null);

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare(
        'INSERT INTO events (category, title, subtitle, details, location, start_at, end_at, image)
         VALUES (:category, :title, :subtitle, :details, :location, :start_at, :end_at, :image)'
    );
    $stmt->execute([
        ':category' => $category !== '' ? $category : null,
        ':title' => $title,
        ':subtitle' => $subtitle !== '' ? $subtitle : null,
        ':details' => $details !== '' ? $details : null,
        ':location' => $location !== '' ? $location : null,
        ':start_at' => $startAt !== '' ? $startAt : null,
        ':end_at' => $endAt !== '' ? $endAt : null,
        ':image' => $imageFilename,
    ]);
    $id = (int)$pdo->lastInsertId();

    json_response([
        'success' => true,
        'event' => [
            'id' => $id,
            'category' => $category !== '' ? $category : null,
            'title' => $title,
            'subtitle' => $subtitle !== '' ? $subtitle : null,
            'details' => $details !== '' ? $details : null,
            'location' => $location !== '' ? $location : null,
            'start_at' => $startAt !== '' ? $startAt : null,
            'end_at' => $endAt !== '' ? $endAt : null,
            'image' => $imageFilename,
        ],
    ], 201);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

