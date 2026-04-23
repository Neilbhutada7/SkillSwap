<?php
/**
 * DELETE or POST /api/bookings/cancel.php?id=X
 * Cancel a booking and refund credits (auth required).
 */
require_once __DIR__ . '/../../helpers/response.php';
handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed. Use DELETE or POST.', 405);
}

require_once __DIR__ . '/../../controllers/BookingController.php';
$controller = new BookingController();
$controller->cancel();
