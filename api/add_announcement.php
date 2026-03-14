<?php

declare(strict_types=1);

require_once __DIR__ . '/utils.php';

require_method('POST');
require_auth();

ensure_upload_dir();

function handle_upload(?array $file): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        json_response(['error' => 'Image upload failed'], 400);
    }

    $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = detect_mime_type($file['tmp_name']);
    if (!$mime) {
        json_response(['error' => 'Unable to determine image type'], 400);
    }
    if (!isset($allowedTypes[$mime])) {
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

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$datePosted = trim($_POST['date_posted'] ?? '');

if ($title === '' || $description === '') {
    json_response(['error' => 'Title and description are required'], 400);
}

$imageFilename = handle_upload($_FILES['image'] ?? null);

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare(
        'INSERT INTO announcements (title, description, image, date_posted)
         VALUES (:title, :description, :image, :date_posted)'
    );

    $stmt->execute([
        ':title'       => $title,
        ':description' => $description,
        ':image'       => $imageFilename,
        ':date_posted' => $datePosted !== '' ? $datePosted : date('Y-m-d H:i:s'),
    ]);

    $id = (int)$pdo->lastInsertId();

    json_response([
        'success' => true,
        'announcement' => [
            'id'          => $id,
            'title'       => $title,
            'description' => $description,
            'image'       => $imageFilename,
            'date_posted' => $datePosted !== '' ? $datePosted : date('Y-m-d H:i:s'),
        ],
    ], 201);
} catch (Throwable $e) {
    json_response(['error' => 'Server error'], 500);
}

