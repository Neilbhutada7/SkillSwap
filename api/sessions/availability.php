<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

$sessionId = isset($_GET['session_id']) ? (int)$_GET['session_id'] : 0;

if ($sessionId <= 0) {
    errorResponse('Invalid session ID', 400);
}

$db = getDBConnection();
$stmt = $db->prepare('SELECT id as slot_id, day_of_week, time_slot FROM session_slots WHERE session_id = :sid AND is_booked = 0');
$stmt->execute([':sid' => $sessionId]);
$slots = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse([
    'success' => true,
    'slots' => $slots
]);
