<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth_middleware.php';
require_once __DIR__ . '/../../config/database.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$userId = requireAuth();

if (!isset($_FILES['banner']) || $_FILES['banner']['error'] !== UPLOAD_ERR_OK) {
    errorResponse('No file uploaded or upload error occurred.', 400);
}

$file = $_FILES['banner'];

// Max 4MB for banner
if ($file['size'] > 4 * 1024 * 1024) {
    errorResponse('File size exceeds the 4MB limit.', 400);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mimeType, $allowedTypes)) {
    errorResponse('Invalid file type. Only JPG, PNG, and WEBP are allowed.', 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (!$ext) {
    $mimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $ext = $mimes[$mimeType] ?? 'png';
}

$filename = 'banner_' . $userId . '_' . time() . '.' . strtolower($ext);
$uploadDir = __DIR__ . '/../../uploads/banners/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
$uploadPath = $uploadDir . $filename;
$publicUrl = 'uploads/banners/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    errorResponse('Failed to move uploaded file.', 500);
}

$db = getDBConnection();

// Delete old banner
$stmt = $db->prepare('SELECT banner_url FROM users WHERE id = :uid');
$stmt->execute([':uid' => $userId]);
$oldUrl = $stmt->fetchColumn();

if ($oldUrl && strpos($oldUrl, 'uploads/banners/') === 0) {
    $oldPath = __DIR__ . '/../../' . $oldUrl;
    if (file_exists($oldPath)) {
        unlink($oldPath);
    }
}

$update = $db->prepare('UPDATE users SET banner_url = :url WHERE id = :uid');
$update->execute([':url' => $publicUrl, ':uid' => $userId]);

jsonResponse([
    'success' => true,
    'message' => 'Banner updated successfully',
    'banner_url' => $publicUrl
]);
