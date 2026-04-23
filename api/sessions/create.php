<?php
/**
 * POST /api/sessions/create.php
 * Publish a new teaching session (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed. Use POST.', 405);
}

require_once __DIR__ . '/../../controllers/SessionController.php';
$controller = new SessionController();
$controller->create();
