<?php
/**
 * SkillSwap – User Model
 *
 * Handles user authentication, lookup, profile data,
 * and credit balance updates.
 */

require_once __DIR__ . '/../config/database.php';

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    // ── Authentication ──────────────────────────────────────

    /**
     * Find a user by email address (for login).
     *
     * @param  string $email
     * @return array|false  User row or false
     */
    public function findByEmail(string $email)
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        if ($row) {
            $row['credits'] = (int) $row['credits'];
        }
        return $row;
    }

    /**
     * Create a new user account.
     *
     * @param  string $name
     * @param  string $email
     * @param  string $passwordHash  Already hashed with password_hash()
     * @param  string $role          Optional role/title
     * @param  string $company       Optional company/school
     * @return int    The new user's ID
     */
    public function create(string $name, string $email, string $passwordHash,
                           string $role = '', string $company = ''): int
    {
        $initial = strtoupper(substr($name, 0, 1));
        $colors  = ['#f97316','#0d9488','#8b5cf6','#ec4899','#f59e0b','#1e3a5f','#14532d','#7c2d12'];
        $color   = $colors[array_rand($colors)];

        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, role, company, avatar_initial, avatar_color, credits)
             VALUES (:name, :email, :password_hash, :role, :company, :initial, :color, 50)'
        );
        $stmt->execute([
            ':name'          => $name,
            ':email'         => $email,
            ':password_hash' => $passwordHash,
            ':role'          => $role ?: null,
            ':company'       => $company ?: null,
            ':initial'       => $initial,
            ':color'         => $color,
        ]);

        $userId = (int) $this->db->lastInsertId();

        // Create empty profile row
        $pStmt = $this->db->prepare(
            'INSERT INTO user_profiles (user_id, about, experience, education)
             VALUES (:uid, "", "[]", "[]")'
        );
        $pStmt->execute([':uid' => $userId]);

        return $userId;
    }

    // ── Lookup ──────────────────────────────────────────────

    /**
     * Get a user by ID (excludes password_hash).
     *
     * @param  int $id
     * @return array|false
     */
    public function findById(int $id)
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, company, avatar_initial, avatar_color, avatar_url,
                    credits, profile_strength, profile_level,
                    sessions_taught, sessions_booked, attendance_rate,
                    experience_years, country_flag, is_mentor,
                    is_available_asap, is_notable, is_new, categories, created_at
             FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if ($row) {
            $row['credits'] = (int) $row['credits'];
        }
        return $row;
    }

    /**
     * Get a user with their full profile data.
     *
     * @param  int $id
     * @return array|false
     */
    public function findWithProfile(int $id)
    {
        $stmt = $this->db->prepare(
            'SELECT u.id, u.name, u.email, u.role, u.company,
                    u.avatar_initial, u.avatar_color, u.avatar_url, u.credits,
                    u.profile_strength, u.profile_level,
                    u.sessions_taught, u.sessions_booked,
                    u.attendance_rate, u.experience_years,
                    u.country_flag, u.is_mentor, u.categories, u.created_at,
                    p.about, p.experience, p.education,
                    p.skills, p.languages, p.open_to_learn, p.linkedin_url
             FROM users u
             LEFT JOIN user_profiles p ON p.user_id = u.id
             WHERE u.id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if ($row) {
            $row['credits'] = (int) $row['credits'];
            // Decode JSON fields
            foreach (['experience','education','skills','languages','open_to_learn'] as $field) {
                if (isset($row[$field]) && is_string($row[$field])) {
                    $row[$field] = json_decode($row[$field], true) ?: [];
                }
            }
        }

        return $row;
    }

    // ── Profile Updates ─────────────────────────────────────

    /**
     * Update profile fields (about, experience, education, etc.).
     *
     * @param  int   $userId
     * @param  array $data  Associative array of fields to update
     * @return bool
     */
    public function updateProfile(int $userId, array $data): bool
    {
        $allowed = ['about','experience','education','skills','languages','open_to_learn','linkedin_url'];
        $sets    = [];
        $params  = [':uid' => $userId];

        foreach ($data as $key => $value) {
            if (!in_array($key, $allowed, true)) continue;

            // JSON fields: encode arrays
            if (in_array($key, ['experience','education','skills','languages','open_to_learn'], true)) {
                $value = json_encode($value, JSON_UNESCAPED_UNICODE);
            }

            $sets[]           = "`$key` = :$key";
            $params[":$key"]  = $value;
        }

        if (empty($sets)) return false;

        $sql  = 'UPDATE user_profiles SET ' . implode(', ', $sets) . ' WHERE user_id = :uid';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Update basic user info (name, role, company).
     *
     * @param  int   $userId
     * @param  array $data
     * @return bool
     */
    public function updateUser(int $userId, array $data): bool
    {
        $allowed = ['name','role','company'];
        $sets    = [];
        $params  = [':uid' => $userId];

        foreach ($data as $key => $value) {
            if (!in_array($key, $allowed, true)) continue;
            $sets[]          = "`$key` = :$key";
            $params[":$key"] = $value;
        }

        if (empty($sets)) return false;

        $sql  = 'UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = :uid';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // ── Credits ─────────────────────────────────────────────

    /**
     * Adjust a user's credit balance by a delta amount.
     *
     * @param  int $userId
     * @param  int $amount  Positive to add, negative to deduct
     * @return int          The new balance
     */
    public function adjustCredits(int $userId, int $amount): int
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET credits = GREATEST(0, CAST(credits AS SIGNED) + :amt) WHERE id = :uid'
        );
        $stmt->execute([':amt' => $amount, ':uid' => $userId]);

        $bal = $this->db->prepare('SELECT credits FROM users WHERE id = :uid');
        $bal->execute([':uid' => $userId]);
        return (int) $bal->fetchColumn();
    }

    /**
     * Get the current credit balance.
     *
     * @param  int $userId
     * @return int
     */
    public function getCredits(int $userId): int
    {
        $stmt = $this->db->prepare('SELECT credits FROM users WHERE id = :uid');
        $stmt->execute([':uid' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    // ── Mentor Listing ──────────────────────────────────────

    /**
     * Get all mentors, with optional filters.
     *
     * @param  array $filters  Optional: search, category, availability, experience, rating
     * @return array
     */
    public function getMentors(array $filters = []): array
    {
        $where  = ['u.is_mentor = 1'];
        $params = [];

        if (!empty($filters['search'])) {
            $where[]           = '(u.name LIKE :search OR u.role LIKE :search OR u.company LIKE :search)';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $where[]        = 'u.categories LIKE :cat';
            $params[':cat'] = '%' . $filters['category'] . '%';
        }

        if (!empty($filters['available_asap'])) {
            $where[] = 'u.is_available_asap = 1';
        }

        if (!empty($filters['notable'])) {
            $where[] = 'u.is_notable = 1';
        }

        if (!empty($filters['is_new'])) {
            $where[] = 'u.is_new = 1';
        }

        $sql = 'SELECT u.id, u.name, u.role, u.company, u.avatar_initial, u.avatar_color, u.avatar_url,
                       u.sessions_taught, u.attendance_rate, u.experience_years,
                       u.country_flag, u.is_available_asap, u.is_notable, u.is_new, u.categories
                FROM users u
                WHERE ' . implode(' AND ', $where) . '
                ORDER BY u.sessions_taught DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
