<?php
/**
 * SkillSwap – Session Controller
 *
 * CRUD for teaching sessions published by mentors.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/Session.php';

class SessionController
{
    private Session $sessionModel;

    public function __construct()
    {
        $this->sessionModel = new Session();
    }

    /**
     * GET — List all sessions (with optional filters).
     * Query params: search, category, mentor_id
     */
    public function list(): void
    {
        $filters = [];

        if (!empty($_GET['search']))   $filters['search']    = $_GET['search'];
        if (!empty($_GET['category'])) $filters['category']  = $_GET['category'];
        if (!empty($_GET['mentor_id'])) $filters['mentor_id'] = (int) $_GET['mentor_id'];

        $sessions = $this->sessionModel->getAll($filters);

        jsonResponse([
            'success'  => true,
            'count'    => count($sessions),
            'sessions' => $sessions,
        ]);
    }

    /**
     * GET — Get a single session by ID, including time slots.
     * Query param: id
     */
    public function read(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            errorResponse('Session ID is required.', 400);
        }

        $session = $this->sessionModel->getById($id);
        if (!$session) {
            errorResponse('Session not found.', 404);
        }

        // Attach available slots
        $dayOfWeek = isset($_GET['day']) ? (int) $_GET['day'] : null;
        $session['slots'] = $this->sessionModel->getSlots($id, $dayOfWeek);

        jsonResponse([
            'success' => true,
            'session' => $session,
        ]);
    }

    /**
     * POST — Create a new teaching session (auth required).
     * Body: { title, skill, description?, session_type?, duration_minutes?,
     *         credits_per_session?, slots: [{day_of_week, time_slot}, ...] }
     */
    public function create(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        $missing = validateRequired(['title', 'skill'], $data);
        if (!empty($missing)) {
            errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $data['mentor_id'] = $userId;
        $data['title']     = sanitize($data['title']);
        $data['skill']     = sanitize($data['skill']);
        if (isset($data['description'])) {
            $data['description'] = sanitize($data['description']);
        }

        $sessionId = $this->sessionModel->create($data);
        $session   = $this->sessionModel->getById($sessionId);
        $session['slots'] = $this->sessionModel->getSlots($sessionId);

        jsonResponse([
            'success' => true,
            'message' => 'Session published successfully.',
            'session' => $session,
        ], 201);
    }

    /**
     * PUT — Update an existing session (auth required, owner only).
     * Body: { id, title?, skill?, description?, credits_per_session?, ... }
     */
    public function update(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        $id = (int) ($data['id'] ?? 0);
        if ($id <= 0) {
            errorResponse('Session ID is required.', 400);
        }

        // Sanitize text fields
        foreach (['title', 'skill', 'description'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = sanitize($data[$field]);
            }
        }

        $updated = $this->sessionModel->update($id, $userId, $data);
        if (!$updated) {
            errorResponse('Session not found or you are not the owner.', 403);
        }

        $session = $this->sessionModel->getById($id);

        jsonResponse([
            'success' => true,
            'message' => 'Session updated successfully.',
            'session' => $session,
        ]);
    }

    /**
     * DELETE — Delete a session (auth required, owner only).
     * Body or query: { id }
     */
    public function delete(): void
    {
        $userId = requireAuth();

        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            $data = getJsonBody();
            $id   = (int) ($data['id'] ?? 0);
        }
        if ($id <= 0) {
            errorResponse('Session ID is required.', 400);
        }

        $deleted = $this->sessionModel->delete($id, $userId);
        if (!$deleted) {
            errorResponse('Session not found or you are not the owner.', 403);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Session deleted successfully.',
        ]);
    }
}
