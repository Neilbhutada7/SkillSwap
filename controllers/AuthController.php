<?php
/**
 * SkillSwap – Auth Controller
 *
 * Handles login, signup, and logout.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Credit.php';

class AuthController
{
    private User   $userModel;
    private Credit $creditModel;

    public function __construct()
    {
        $this->userModel   = new User();
        $this->creditModel = new Credit();
    }

    /**
     * POST — Register a new account.
     * Body: { name, email, password, role?, company? }
     */
    public function signup(): void
    {
        $data = getJsonBody();

        // Validate required fields
        $missing = validateRequired(['name', 'email', 'password'], $data);
        if (!empty($missing)) {
            errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $name     = sanitize($data['name']);
        $email    = trim($data['email']);
        $password = $data['password'];
        $role     = sanitize($data['role'] ?? '');
        $company  = sanitize($data['company'] ?? '');

        // Validate email format
        if (!validateEmail($email)) {
            errorResponse('Invalid email address.', 422);
        }

        // Validate password strength
        if (strlen($password) < 6) {
            errorResponse('Password must be at least 6 characters.', 422);
        }

        // Check if email already exists
        if ($this->userModel->findByEmail($email)) {
            errorResponse('An account with this email already exists.', 409);
        }

        // Hash password
        $hash = password_hash($password, PASSWORD_BCRYPT);

        // Create user
        $userId = $this->userModel->create($name, $email, $hash, $role, $company);

        // Log welcome bonus credit
        $this->creditModel->addTransaction($userId, 50, 'earn', 'Welcome bonus – new account signup');

        // Start session
        if (session_status() === PHP_SESSION_NONE) session_start();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;

        // Return user data
        $user = $this->userModel->findById($userId);

        jsonResponse([
            'success' => true,
            'message' => 'Account created successfully.',
            'user'    => $user,
        ], 201);
    }

    /**
     * POST — Log in with email and password.
     * Body: { email, password }
     */
    public function login(): void
    {
        $data = getJsonBody();

        $missing = validateRequired(['email', 'password'], $data);
        if (!empty($missing)) {
            errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $email    = trim($data['email']);
        $password = $data['password'];

        // Find user by email
        $user = $this->userModel->findByEmail($email);
        if (!$user) {
            errorResponse('Invalid email or password.', 401);
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            errorResponse('Invalid email or password.', 401);
        }

        // Start session
        if (session_status() === PHP_SESSION_NONE) session_start();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];

        // Return user data (exclude password_hash)
        unset($user['password_hash']);

        jsonResponse([
            'success' => true,
            'message' => 'Logged in successfully.',
            'user'    => $user,
        ]);
    }

    /**
     * POST — Log out (destroy session).
     */
    public function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }

        session_destroy();

        jsonResponse([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * GET — Check if current session is authenticated.
     * Returns user data if logged in, or 401.
     */
    public function check(): void
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (empty($_SESSION['user_id'])) {
            jsonResponse([
                'success'       => false,
                'authenticated' => false,
            ]);
            return;
        }

        $user = $this->userModel->findById((int)$_SESSION['user_id']);
        if (!$user) {
            jsonResponse([
                'success'       => false,
                'authenticated' => false,
            ]);
            return;
        }

        jsonResponse([
            'success'       => true,
            'authenticated' => true,
            'user'          => $user,
        ]);
    }
}
