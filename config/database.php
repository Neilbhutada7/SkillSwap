<?php
/**
 * SkillSwap – Database Configuration
 * 
 * PDO connection to MySQL using XAMPP defaults.
 * Change the constants below to match your environment.
 */

// ── Database credentials ────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'skillswap_db');
define('DB_USER', 'root');
define('DB_PASS', '');           // XAMPP default: empty password
define('DB_CHARSET', 'utf8mb4');

/**
 * Get a shared PDO connection instance (singleton pattern).
 *
 * @return PDO
 * @throws PDOException on connection failure
 */
function getDBConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            // Throw exceptions on errors (never fail silently)
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,

            // Return associative arrays by default
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

            // Use real prepared statements (not emulated)
            PDO::ATTR_EMULATE_PREPARES   => false,

            // Preserve native types (int stays int, etc.)
            PDO::ATTR_STRINGIFY_FETCHES  => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // In production, log the error and show a generic message.
            // During development, the full message is helpful.
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    return $pdo;
}
