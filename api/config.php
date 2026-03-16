<?php
// Basic configuration for database connection and common API settings

declare(strict_types=1);

// SQLite database file path (relative to project root)
const DB_FILE = __DIR__ . '/../data/barangay_pulo.sqlite';

// Base directory for file uploads (../uploads relative to this file)
const UPLOAD_DIR = __DIR__ . '/../uploads/';

// Allow CORS for API access (adjust origin for production if needed)
// Only send headers in web requests (not CLI scripts like init_db.php).
if (PHP_SAPI !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');

    // When using cookies (credentials: 'include'), Access-Control-Allow-Origin cannot be "*".
    // Echo back the requesting origin if it's in our allowlist.
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];
    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        // Ensure the data directory exists
        $dataDir = dirname(DB_FILE);
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0775, true);
        }

        if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            throw new PDOException('PDO SQLite driver is not enabled. Enable pdo_sqlite/sqlite3 in php.ini.');
        }

        $dsn = 'sqlite:' . DB_FILE;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, null, null, $options);
    }
    return $pdo;
}

