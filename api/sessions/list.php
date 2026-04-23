<?php
/**
 * GET /api/sessions/list.php
 * List all sessions with optional filters.
 * Query: ?search=X&category=X&mentor_id=X
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/SessionController.php';
$controller = new SessionController();
$controller->list();
