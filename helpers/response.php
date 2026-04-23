<?php
/**
 * SkillSwap – JSON Response Helpers
 *
 * Consistent response formatting for all API endpoints.
 */

/**
 * Send a JSON response and terminate.
 *
 * @param mixed $data       The payload (array or object)
 * @param int   $statusCode HTTP status code (default 200)
 */
function jsonResponse($data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');

    // Allow same-origin requests (frontend and API share the same host)
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send an error JSON response and terminate.
 *
 * @param string $message    Human-readable error message
 * @param int    $statusCode HTTP status code (default 400)
 */
function errorResponse(string $message, int $statusCode = 400): void
{
    jsonResponse([
        'success' => false,
        'message' => $message
    ], $statusCode);
}

/**
 * Handle preflight OPTIONS requests for CORS.
 * Call this at the top of every API endpoint.
 */
function handleCors(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
