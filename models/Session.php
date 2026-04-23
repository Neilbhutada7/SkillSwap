<?php
/**
 * SkillSwap – Session Model
 *
 * CRUD operations for teaching sessions published by mentors.
 */

require_once __DIR__ . '/../config/database.php';

class Session
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    // ── Create ──────────────────────────────────────────────

    /**
     * Publish a new teaching session with time slots.
     *
     * @param  array $data  Keys: mentor_id, title, skill, description,
     *                      session_type, duration_minutes, credits_per_session, slots
     * @return int   The new session ID
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO sessions (mentor_id, title, skill, description,
                                   session_type, duration_minutes, credits_per_session)
             VALUES (:mentor_id, :title, :skill, :description,
                     :session_type, :duration, :credits)'
        );
        $stmt->execute([
            ':mentor_id'    => $data['mentor_id'],
            ':title'        => $data['title'],
            ':skill'        => $data['skill'],
            ':description'  => $data['description'] ?? '',
            ':session_type' => $data['session_type'] ?? '1on1',
            ':duration'     => $data['duration_minutes'] ?? 60,
            ':credits'      => $data['credits_per_session'] ?? 10,
        ]);

        $sessionId = (int) $this->db->lastInsertId();

        // Insert time slots if provided
        if (!empty($data['slots']) && is_array($data['slots'])) {
            $slotStmt = $this->db->prepare(
                'INSERT INTO session_slots (session_id, day_of_week, time_slot)
                 VALUES (:sid, :dow, :time)'
            );
            foreach ($data['slots'] as $slot) {
                $slotStmt->execute([
                    ':sid'  => $sessionId,
                    ':dow'  => $slot['day_of_week'],
                    ':time' => $slot['time_slot'],
                ]);
            }
        }

        return $sessionId;
    }

    // ── Read ────────────────────────────────────────────────

    /**
     * List all active sessions with mentor info.
     *
     * @param  array $filters  Optional: search, category, mentor_id
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        $where  = ['s.is_active = 1'];
        $params = [];

        if (!empty($filters['mentor_id'])) {
            $where[]              = 's.mentor_id = :mid';
            $params[':mid']       = $filters['mentor_id'];
        }

        if (!empty($filters['search'])) {
            $where[]              = '(s.title LIKE :q OR s.skill LIKE :q OR u.name LIKE :q)';
            $params[':q']         = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $where[]              = 'u.categories LIKE :cat';
            $params[':cat']       = '%' . $filters['category'] . '%';
        }

        $sql = 'SELECT s.*, u.name AS mentor_name, u.role AS mentor_role,
                       u.company AS mentor_company, u.avatar_initial, u.avatar_color,
                       u.sessions_taught, u.attendance_rate, u.experience_years,
                       u.country_flag, u.is_available_asap, u.categories
                FROM sessions s
                JOIN users u ON u.id = s.mentor_id
                WHERE ' . implode(' AND ', $where) . '
                ORDER BY s.created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Get a single session by ID with full mentor info.
     *
     * @param  int $id
     * @return array|false
     */
    public function getById(int $id)
    {
        $stmt = $this->db->prepare(
            'SELECT s.*, u.name AS mentor_name, u.role AS mentor_role,
                    u.company AS mentor_company, u.avatar_initial, u.avatar_color,
                    u.sessions_taught, u.attendance_rate, u.experience_years,
                    u.country_flag, u.is_available_asap, u.categories
             FROM sessions s
             JOIN users u ON u.id = s.mentor_id
             WHERE s.id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Get available time slots for a session.
     *
     * @param  int      $sessionId
     * @param  int|null $dayOfWeek  Filter by day (0–6), or null for all
     * @return array
     */
    public function getSlots(int $sessionId, ?int $dayOfWeek = null): array
    {
        $sql    = 'SELECT * FROM session_slots WHERE session_id = :sid';
        $params = [':sid' => $sessionId];

        if ($dayOfWeek !== null) {
            $sql            .= ' AND day_of_week = :dow';
            $params[':dow']  = $dayOfWeek;
        }

        $sql .= ' ORDER BY day_of_week, time_slot';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // ── Update ──────────────────────────────────────────────

    /**
     * Update a session (only by its mentor).
     *
     * @param  int   $id
     * @param  int   $mentorId  Must match session owner
     * @param  array $data      Fields to update
     * @return bool
     */
    public function update(int $id, int $mentorId, array $data): bool
    {
        $allowed = ['title','skill','description','session_type','duration_minutes','credits_per_session','is_active'];
        $sets    = [];
        $params  = [':id' => $id, ':mid' => $mentorId];

        foreach ($data as $key => $value) {
            if (!in_array($key, $allowed, true)) continue;
            $sets[]          = "`$key` = :$key";
            $params[":$key"] = $value;
        }

        if (empty($sets)) return false;

        $sql  = 'UPDATE sessions SET ' . implode(', ', $sets) .
                ' WHERE id = :id AND mentor_id = :mid';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // ── Delete ──────────────────────────────────────────────

    /**
     * Delete a session (only by its mentor). CASCADE removes slots.
     *
     * @param  int $id
     * @param  int $mentorId
     * @return bool
     */
    public function delete(int $id, int $mentorId): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM sessions WHERE id = :id AND mentor_id = :mid'
        );
        $stmt->execute([':id' => $id, ':mid' => $mentorId]);
        return $stmt->rowCount() > 0;
    }
}
