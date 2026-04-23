<?php
/**
 * GET /api/messages/thread.php?with=X
 * Get chat history with a specific user (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/MessageController.php';
$controller = new MessageController();
$controller->thread();
