<?php
/**
 * SkillSwap – Credit Model
 *
 * Manages credit balance retrieval, transaction logging,
 * and history queries.
 */

require_once __DIR__ . '/../config/database.php';

class Credit
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    /**
     * Get the current credit balance for a user.
     *
     * @param  int $userId
     * @return int
     */
    public function getBalance(int $userId): int
    {
        $stmt = $this->db->prepare('SELECT credits FROM users WHERE id = :uid');
        $stmt->execute([':uid' => $userId]);
        $result = $stmt->fetchColumn();
        return $result !== false ? (int) $result : 0;
    }

    /**
     * Log a credit transaction AND update the user's balance.
     *
     * @param  int    $userId
     * @param  int    $amount       Positive for earn, negative for spend
     * @param  string $type         'earn' or 'spend'
     * @param  string $description  Human-readable reason
     * @param  int|null $referenceId Optional FK to booking/session
     * @return int    The transaction ID
     */
    public function addTransaction(int $userId, int $amount, string $type,
                                   string $description, ?int $referenceId = null): int
    {
        // Update balance
        $this->db->prepare(
            'UPDATE users SET credits = GREATEST(0, CAST(credits AS SIGNED) + :amt) WHERE id = :uid'
        )->execute([':amt' => $amount, ':uid' => $userId]);

        // Log the transaction
        $stmt = $this->db->prepare(
            'INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
             VALUES (:uid, :amount, :type, :desc, :ref)'
        );
        $stmt->execute([
            ':uid'    => $userId,
            ':amount' => $amount,
            ':type'   => $type,
            ':desc'   => $description,
            ':ref'    => $referenceId,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Get the credit transaction history for a user.
     *
     * @param  int $userId
     * @param  int $limit   Max records to return
     * @return array
     */
    public function getHistory(int $userId, int $limit = 50): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, amount, type, description, reference_id, created_at
             FROM credit_transactions
             WHERE user_id = :uid
             ORDER BY created_at DESC
             LIMIT :lim'
        );
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Get summary stats for a user's credits.
     *
     * @param  int $userId
     * @return array  Keys: balance, total_earned, total_spent
     */
    public function getSummary(int $userId): array
    {
        $balance = $this->getBalance($userId);

        $stmt = $this->db->prepare(
            'SELECT
                COALESCE(SUM(CASE WHEN type = "earn"  THEN amount ELSE 0 END), 0) AS total_earned,
                COALESCE(SUM(CASE WHEN type = "spend" THEN ABS(amount) ELSE 0 END), 0) AS total_spent
             FROM credit_transactions
             WHERE user_id = :uid'
        );
        $stmt->execute([':uid' => $userId]);
        $row = $stmt->fetch();

        return [
            'balance'      => $balance,
            'total_earned' => (int) $row['total_earned'],
            'total_spent'  => (int) $row['total_spent'],
        ];
    }
}
