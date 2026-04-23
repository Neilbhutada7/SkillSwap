<?php
/**
 * GET /api/reviews/list.php?mentor_id=X
 * List reviews for a mentor (public).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/ReviewController.php';
$controller = new ReviewController();
$controller->list();
