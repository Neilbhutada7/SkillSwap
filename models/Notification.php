<?php
/**
 * SkillSwap – Notification Model
 */

require_once __DIR__ . '/../config/database.php';

class Notification
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    public function create(int $userId, string $type, string $message, ?string $link = null): bool
    {
        $stmt = $this->db->prepare(
            'INSERT INTO notifications (user_id, type, message, link) VALUES (:uid, :type, :msg, :link)'
        );
        return $stmt->execute([
            ':uid'  => $userId,
            ':type' => $type,
            ':msg'  => $message,
            ':link' => $link
        ]);
    }

    public function getForUser(int $userId, int $limit = 50): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM notifications WHERE user_id = :uid ORDER BY created_at DESC LIMIT :limit'
        );
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUnreadCount(int $userId): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = FALSE');
        $stmt->execute([':uid' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public function markAsRead(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare('UPDATE notifications SET is_read = TRUE WHERE id = :id AND user_id = :uid');
        return $stmt->execute([':id' => $id, ':uid' => $userId]);
    }

    public function markAllAsRead(int $userId): bool
    {
        $stmt = $this->db->prepare('UPDATE notifications SET is_read = TRUE WHERE user_id = :uid');
        return $stmt->execute([':uid' => $userId]);
    }
}
