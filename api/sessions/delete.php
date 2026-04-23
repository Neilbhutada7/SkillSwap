<?php
/**
 * DELETE /api/sessions/delete.php?id=X
 * Delete a session (auth required, owner only).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    errorResponse('Method not allowed. Use DELETE.', 405);
}

require_once __DIR__ . '/../../controllers/SessionController.php';
$controller = new SessionController();
$controller->delete();
