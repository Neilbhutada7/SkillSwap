<?php
/**
 * SkillSwap – Review Model
 *
 * Handles session reviews: create, list by mentor, list by session.
 */

require_once __DIR__ . '/../config/database.php';

class Review
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    /**
     * Create a new review.
     *
     * @param  int    $reviewerId
     * @param  int    $mentorId
     * @param  int    $sessionId
     * @param  int    $rating     1-5
     * @param  string $reviewText
     * @param  int|null $bookingId
     * @return array
     */
    public function create(int $reviewerId, int $mentorId, int $sessionId,
                           int $rating, string $reviewText, ?int $bookingId = null): array
    {
        if ($rating < 1 || $rating > 5) {
            throw new Exception('Rating must be between 1 and 5.');
        }

        if ($reviewerId === $mentorId) {
            throw new Exception('You cannot review yourself.');
        }

        $stmt = $this->db->prepare(
            'INSERT INTO reviews (booking_id, reviewer_id, mentor_id, session_id, rating, review_text)
             VALUES (:bid, :rid, :mid, :sid, :rating, :text)'
        );
        $stmt->execute([
            ':bid'    => $bookingId,
            ':rid'    => $reviewerId,
            ':mid'    => $mentorId,
            ':sid'    => $sessionId,
            ':rating' => $rating,
            ':text'   => $reviewText,
        ]);

        return [
            'id'           => (int) $this->db->lastInsertId(),
            'reviewer_id'  => $reviewerId,
            'mentor_id'    => $mentorId,
            'session_id'   => $sessionId,
            'rating'       => $rating,
            'review_text'  => $reviewText,
        ];
    }

    /**
     * Get all reviews for a mentor, with reviewer info.
     *
     * @param  int $mentorId
     * @return array
     */
    public function getByMentor(int $mentorId): array
    {
        $stmt = $this->db->prepare(
            'SELECT r.*, u.name AS reviewer_name, u.avatar_initial, u.avatar_color
             FROM reviews r
             JOIN users u ON u.id = r.reviewer_id
             WHERE r.mentor_id = :mid
             ORDER BY r.created_at DESC'
        );
        $stmt->execute([':mid' => $mentorId]);
        return $stmt->fetchAll();
    }

    /**
     * Get average rating and count for a mentor.
     *
     * @param  int $mentorId
     * @return array { avg_rating, review_count }
     */
    public function getMentorStats(int $mentorId): array
    {
        $stmt = $this->db->prepare(
            'SELECT ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
             FROM reviews WHERE mentor_id = :mid'
        );
        $stmt->execute([':mid' => $mentorId]);
        $row = $stmt->fetch();
        return [
            'avg_rating'   => $row['avg_rating'] ? (float) $row['avg_rating'] : 0,
            'review_count' => (int) $row['review_count'],
        ];
    }
}
