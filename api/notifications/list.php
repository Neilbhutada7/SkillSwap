<?php
require_once __DIR__ . '/../../helpers/response.php';
handleCors();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed. Use GET.', 405);
}
require_once __DIR__ . '/../../controllers/NotificationController.php';
$controller = new NotificationController();
$controller->list();
