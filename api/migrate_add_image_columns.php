<?php
/**
 * One-time migration: add image column to services and events if missing.
 * Run: php api/migrate_add_image_columns.php
 */
declare(strict_types=1);
require __DIR__ . '/config.php';

$pdo = get_pdo();

foreach (['services', 'events'] as $table) {
    $stmt = $pdo->query("PRAGMA table_info($table)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $hasImage = false;
    foreach ($columns as $col) {
        if (($col['name'] ?? '') === 'image') {
            $hasImage = true;
            break;
        }
    }
    if (!$hasImage) {
        $pdo->exec("ALTER TABLE $table ADD COLUMN image TEXT DEFAULT NULL");
        echo "Added column 'image' to table '$table'.\n";
    } else {
        echo "Table '$table' already has 'image' column.\n";
    }
}

echo "Done.\n";
