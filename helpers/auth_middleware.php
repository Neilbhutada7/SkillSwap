<?php
/**
 * SkillSwap – Authentication Middleware
 *
 * Verifies that the user has an active session.
 * Include this file and call requireAuth() at the top of
 * any API endpoint that requires a logged-in user.
 */

require_once __DIR__ . '/response.php';

/**
 * Ensure the current request is authenticated.
 *
 * Starts the session (if not already started) and checks
 * for a valid user_id in $_SESSION.
 *
 * @return int The authenticated user's ID
 */
function requireAuth(): int
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['user_id'])) {
        errorResponse('Authentication required. Please log in.', 401);
    }

    return (int) $_SESSION['user_id'];
}

/**
 * Get the current user's ID if logged in, or null if not.
 * Does NOT block the request — use for optional auth.
 *
 * @return int|null
 */
function getAuthUserId(): ?int
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}
