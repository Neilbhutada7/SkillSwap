<?php
/**
 * GET /api/credits/history.php
 * Get credit transaction history (auth required).
 * Query: ?limit=50
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/CreditController.php';
$controller = new CreditController();
$controller->history();
