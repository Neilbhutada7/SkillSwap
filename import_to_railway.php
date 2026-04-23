<?php
/**
 * One-time script to import schema.sql to Railway
 */

// 1. PASTE YOUR RAILWAY MYSQL_URL HERE
$railway_url = 'mysql://root:PHViOwVmEwWbJpezDCQfQlTznShSDgLA@shortline.proxy.rlwy.net:40388/railway'; 

if ($railway_url === 'PASTE_YOUR_MYSQL_URL_HERE') {
    die("Please open this file and paste your Railway MYSQL_URL inside the single quotes on line 7.");
}

// Parse the URL
$url = parse_url($railway_url);
$host = $url['host'];
$port = $url['port'];
$user = $url['user'];
$pass = $url['pass'];
$db   = ltrim($url['path'], '/');

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    echo "✅ Connected to Railway successfully!<br>";

    $sql = file_get_contents(__DIR__ . '/sql/schema.sql');
    
    // Remove the CREATE DATABASE and USE lines as they cause errors on Railway
    $sql = preg_replace('/CREATE DATABASE IF NOT EXISTS.*?;/s', '', $sql);
    $sql = preg_replace('/USE `.*?`;/', '', $sql);

    echo "⏳ Importing schema.sql... (this may take a moment)<br>";
    
    // Execute the SQL
    $pdo->exec($sql);

    echo "🎉 <b>SUCCESS!</b> Your database tables have been created on Railway.<br>";
    echo "You can now delete this file and refresh your Railway Data tab.";

} catch (Exception $e) {
    echo "❌ <b>ERROR:</b> " . $e->getMessage();
}
