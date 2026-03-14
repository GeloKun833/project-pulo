<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

session_start();

function json_response(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        json_response(['error' => 'Method not allowed'], 405);
    }
}

function get_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['error' => 'Invalid JSON body'], 400);
    }
    return $data;
}

function require_auth(): void
{
    if (empty($_SESSION['admin_id'])) {
        json_response(['error' => 'Unauthorized'], 401);
    }
}

function ensure_upload_dir(): void
{
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0775, true);
    }
}

/**
 * Determine the MIME type of an uploaded file safely.
 * Works even when `mime_content_type()` is unavailable (common on some Windows/PHP setups).
 */
function detect_mime_type(string $path): ?string
{
    if ($path === '' || !is_file($path)) {
        return null;
    }

    if (function_exists('mime_content_type')) {
        $mime = @mime_content_type($path);
        if (is_string($mime) && $mime !== '') {
            return $mime;
        }
    }

    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = @$finfo->file($path);
        if (is_string($mime) && $mime !== '') {
            return $mime;
        }
    }

    $img = @getimagesize($path);
    if (is_array($img) && isset($img['mime']) && is_string($img['mime'])) {
        return $img['mime'];
    }

    return null;
}

