<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDBConnection();
    
    // Check if columns exist first (optional, but safer)
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT NULL AFTER avatar_color");
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url VARCHAR(255) DEFAULT NULL AFTER avatar_url");
    
    echo "Migration successful. 'avatar_url' and 'banner_url' columns added.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
