<?php
/**
 * PUT /api/profile/update.php
 * Update the current user's profile (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    errorResponse('Method not allowed. Use PUT.', 405);
}

require_once __DIR__ . '/../../controllers/ProfileController.php';
$controller = new ProfileController();
$controller->update();
