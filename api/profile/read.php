<?php
/**
 * GET /api/profile/read.php
 * Get own profile (auth) or another user's public profile (?id=X).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/ProfileController.php';
$controller = new ProfileController();
$controller->read();
