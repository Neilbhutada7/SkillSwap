<?php
/**
 * POST /api/bookings/create.php
 * Book a session (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed. Use POST.', 405);
}

require_once __DIR__ . '/../../controllers/BookingController.php';
$controller = new BookingController();
$controller->create();
