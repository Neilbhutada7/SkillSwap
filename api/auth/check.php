<?php
/**
 * GET /api/auth/check.php
 * Check if the current session is authenticated.
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/AuthController.php';
$controller = new AuthController();
$controller->check();
