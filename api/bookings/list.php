<?php
/**
 * GET /api/bookings/list.php
 * List user's bookings (auth required).
 * Query: ?status=upcoming|completed|cancelled|all
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}

require_once __DIR__ . '/../../controllers/BookingController.php';
$controller = new BookingController();
$controller->list();
