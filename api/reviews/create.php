<?php
/**
 * POST /api/reviews/create.php
 * Submit a review for a mentor (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed. Use POST.', 405);
}

require_once __DIR__ . '/../../controllers/ReviewController.php';
$controller = new ReviewController();
$controller->create();
