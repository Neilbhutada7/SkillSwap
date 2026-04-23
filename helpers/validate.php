<?php
/**
 * SkillSwap – Input Validation & Sanitization Helpers
 */

/**
 * Sanitize a single string value.
 * Trims whitespace and escapes HTML entities to prevent XSS.
 *
 * @param  string $input Raw user input
 * @return string        Sanitized string
 */
function sanitize(string $input): string
{
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate an email address format.
 *
 * @param  string $email
 * @return bool
 */
function validateEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Check that all required fields are present and non-empty in the data array.
 *
 * @param  array $fields List of required field names
 * @param  array $data   The data array to check (e.g. decoded JSON body)
 * @return array         List of missing or empty field names (empty = all OK)
 */
function validateRequired(array $fields, array $data): array
{
    $missing = [];

    foreach ($fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }

    return $missing;
}

/**
 * Read and decode the JSON request body.
 * Returns the decoded associative array, or sends a 400 error if invalid.
 *
 * @return array
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        require_once __DIR__ . '/response.php';
        errorResponse('Invalid JSON in request body.', 400);
    }

    return $data;
}
