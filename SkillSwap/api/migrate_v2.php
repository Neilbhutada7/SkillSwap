<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    $db = getDBConnection();
    
    // Add avatar_url and banner_url to users table if not exists
    $db->exec("ALTER TABLE users 
               ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT NULL AFTER avatar_color,
               ADD COLUMN IF NOT EXISTS banner_url VARCHAR(255) DEFAULT NULL AFTER avatar_url;");
    
    echo "Migration successful. 'avatar_url' and 'banner_url' columns added.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
