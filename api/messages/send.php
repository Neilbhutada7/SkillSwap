<?php
/**
 * POST /api/messages/send.php
 * Send a message to another user (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed. Use POST.', 405);
}

require_once __DIR__ . '/../../controllers/MessageController.php';
$controller = new MessageController();
$controller->send();
