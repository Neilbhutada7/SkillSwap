<?php
/**
 * GET /api/credits/balance.php
 * Get the current user's credit balance and summary (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/CreditController.php';
$controller = new CreditController();
$controller->balance();
