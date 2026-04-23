<?php
/**
 * POST /api/auth/login.php
 * Log in with email and password.
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed. Use POST.', 405);
}

require_once __DIR__ . '/../../controllers/AuthController.php';
$controller = new AuthController();
$controller->login();
