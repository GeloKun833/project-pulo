<?php

declare(strict_types=1);

require_once __DIR__ . '/utils.php';

// Allow POST with _method=PUT for easier frontend integration
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
if ($method === 'POST' && isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT') {
    $method = 'PUT';
}

if ($method !== 'POST' && $method !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();
ensure_upload_dir();

function handle_event_edit_upload(?array $file): ?string
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

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) {
    json_response(['error' => 'Invalid event id'], 400);
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

$newImage = handle_event_edit_upload($_FILES['image'] ?? null);

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT image FROM events WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        json_response(['error' => 'Event not found'], 404);
    }

    $imageToStore = $existing['image'] ?? null;
    if ($newImage !== null) {
        $imageToStore = $newImage;
        if (!empty($existing['image'])) {
            $oldPath = UPLOAD_DIR . $existing['image'];
            if (is_file($oldPath)) {
                @unlink($oldPath);
            }
        }
    }

    $stmt = $pdo->prepare(
        'UPDATE events
         SET category = :category,
             title = :title,
             subtitle = :subtitle,
             details = :details,
             location = :location,
             start_at = :start_at,
             end_at = :end_at,
             image = :image,
             updated_at = datetime(\'now\')
         WHERE id = :id'
    );
    $stmt->execute([
        ':id' => $id,
        ':category' => $category !== '' ? $category : null,
        ':title' => $title,
        ':subtitle' => $subtitle !== '' ? $subtitle : null,
        ':details' => $details !== '' ? $details : null,
        ':location' => $location !== '' ? $location : null,
        ':start_at' => $startAt !== '' ? $startAt : null,
        ':end_at' => $endAt !== '' ? $endAt : null,
        ':image' => $imageToStore,
    ]);

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
            'image' => $imageToStore,
        ],
    ]);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

