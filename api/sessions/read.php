<?php
/**
 * GET /api/sessions/read.php?id=X
 * Get a single session with mentor info and time slots.
 * Optional: &day=0-6 to filter slots by day.
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/SessionController.php';
$controller = new SessionController();
$controller->read();
