<?php
/**
 * PUT /api/sessions/update.php
 * Update an existing session (auth required, owner only).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    errorResponse('Method not allowed. Use PUT.', 405);
}

require_once __DIR__ . '/../../controllers/SessionController.php';
$controller = new SessionController();
$controller->update();
