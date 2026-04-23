<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth_middleware.php';
require_once __DIR__ . '/../../config/database.php';

handleCors();

// Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$userId = requireAuth();

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    errorResponse('No file uploaded or upload error occurred.', 400);
}

$file = $_FILES['avatar'];

// Check file size (max 2MB)
if ($file['size'] > 2 * 1024 * 1024) {
    errorResponse('File size exceeds the 2MB limit.', 400);
}

// Check mime type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $allowedTypes)) {
    errorResponse('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.', 400);
}

// Generate secure filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (!$ext) {
    // try to guess extension
    $mimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $ext = $mimes[$mimeType] ?? 'png';
}

$filename = 'avatar_' . $userId . '_' . time() . '.' . strtolower($ext);
$uploadDir = __DIR__ . '/../../uploads/avatars/';
$uploadPath = $uploadDir . $filename;
$publicUrl = 'uploads/avatars/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    errorResponse('Failed to move uploaded file.', 500);
}

// Update database
$db = getDBConnection();

// Get the old avatar if exists to delete it
$stmt = $db->prepare('SELECT avatar_url FROM users WHERE id = :uid');
$stmt->execute([':uid' => $userId]);
$oldUrl = $stmt->fetchColumn();

if ($oldUrl && strpos($oldUrl, 'uploads/avatars/') === 0) {
    $oldPath = __DIR__ . '/../../' . $oldUrl;
    if (file_exists($oldPath)) {
        unlink($oldPath);
    }
}

$update = $db->prepare('UPDATE users SET avatar_url = :url WHERE id = :uid');
$update->execute([':url' => $publicUrl, ':uid' => $userId]);

jsonResponse([
    'success' => true,
    'message' => 'Avatar updated successfully',
    'avatar_url' => $publicUrl
]);
