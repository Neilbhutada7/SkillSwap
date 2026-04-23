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

    // Handle CORS for JSON responses
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header('Access-Control-Allow-Credentials: true');
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

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
    // If you are hosting your frontend on GitHub Pages, change '*' 
    // to your specific domain (e.g., https://neilbhutada7.github.io)
    // to allow credentialed requests (cookies/sessions).
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header('Access-Control-Allow-Credentials: true');
    } else {
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    // Handle preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
