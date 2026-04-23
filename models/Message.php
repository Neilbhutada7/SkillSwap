<?php
/**
 * SkillSwap – Message Model
 *
 * Handles sending messages, listing conversations,
 * and retrieving chat threads between two users.
 */

require_once __DIR__ . '/../config/database.php';

class Message
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    /**
     * Send a message from one user to another.
     *
     * @param  int    $senderId
     * @param  int    $receiverId
     * @param  string $content
     * @return array  The created message row
     */
    public function send(int $senderId, int $receiverId, string $content): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO messages (sender_id, receiver_id, content)
             VALUES (:sid, :rid, :content)'
        );
        $stmt->execute([
            ':sid'     => $senderId,
            ':rid'     => $receiverId,
            ':content' => $content,
        ]);

        $id = (int) $this->db->lastInsertId();

        return [
            'id'          => $id,
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'content'     => $content,
            'is_read'     => 0,
            'created_at'  => date('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get all unique conversations for a user.
     * Returns the other user's info + last message preview.
     *
     * @param  int $userId
     * @return array
     */
    public function getConversations(int $userId): array
    {
        // Get distinct conversation partners
        $sql = '
            SELECT
                u.id AS partner_id,
                u.name AS partner_name,
                u.avatar_initial,
                u.avatar_color,
                m.content AS last_message,
                m.created_at AS last_message_at,
                (SELECT COUNT(*) FROM messages
                 WHERE sender_id = u.id AND receiver_id = :uid1 AND is_read = 0
                ) AS unread_count
            FROM (
                SELECT
                    CASE WHEN sender_id = :uid2 THEN receiver_id ELSE sender_id END AS partner_id,
                    MAX(id) AS last_msg_id
                FROM messages
                WHERE sender_id = :uid3 OR receiver_id = :uid4
                GROUP BY partner_id
            ) conv
            JOIN users u ON u.id = conv.partner_id
            JOIN messages m ON m.id = conv.last_msg_id
            ORDER BY m.created_at DESC
        ';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':uid1' => $userId,
            ':uid2' => $userId,
            ':uid3' => $userId,
            ':uid4' => $userId,
        ]);
        return $stmt->fetchAll();
    }

    /**
     * Get all messages between two users (a conversation thread).
     *
     * @param  int $userId   The authenticated user
     * @param  int $otherId  The other participant
     * @param  int $limit    Max messages to return
     * @return array
     */
    public function getThread(int $userId, int $otherId, int $limit = 100): array
    {
        $stmt = $this->db->prepare(
            'SELECT m.*, u.name AS sender_name, u.avatar_initial
             FROM messages m
             JOIN users u ON u.id = m.sender_id
             WHERE (m.sender_id = :uid1 AND m.receiver_id = :oid1)
                OR (m.sender_id = :oid2 AND m.receiver_id = :uid2)
             ORDER BY m.created_at ASC
             LIMIT :lim'
        );
        $stmt->bindValue(':uid1', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':uid2', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':oid1', $otherId, PDO::PARAM_INT);
        $stmt->bindValue(':oid2', $otherId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Mark all messages from a sender to a receiver as read.
     *
     * @param  int $receiverId  The current user reading them
     * @param  int $senderId    The other user who sent them
     * @return int  Number of messages marked
     */
    public function markAsRead(int $receiverId, int $senderId): int
    {
        $stmt = $this->db->prepare(
            'UPDATE messages SET is_read = 1
             WHERE receiver_id = :rid AND sender_id = :sid AND is_read = 0'
        );
        $stmt->execute([':rid' => $receiverId, ':sid' => $senderId]);
        return $stmt->rowCount();
    }
}
