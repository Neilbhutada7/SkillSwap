<?php
/**
 * SkillSwap – Booking Model
 *
 * Handles session booking creation, listing, and cancellation.
 * Manages credit transfers between learner and mentor.
 */

require_once __DIR__ . '/../config/database.php';

class Booking
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDBConnection();
    }

    /**
     * Book a session: deduct credits from learner, add to mentor, create booking record.
     * Uses a transaction to ensure atomicity.
     *
     * @param  int    $sessionId
     * @param  int    $learnerId
     * @param  int    $slotId       Optional specific slot
     * @param  string $bookingDate  Format: YYYY-MM-DD
     * @param  string $timeSlot     e.g. "9:30 PM"
     * @return array  The created booking row
     * @throws Exception on insufficient credits or other failures
     */
    public function create(int $sessionId, int $learnerId, ?int $slotId,
                           string $bookingDate, string $timeSlot): array
    {
        $this->db->beginTransaction();

        try {
            // 1. Get session details + cost
            $sStmt = $this->db->prepare(
                'SELECT s.credits_per_session, s.mentor_id, s.title, u.name AS mentor_name
                 FROM sessions s
                 JOIN users u ON u.id = s.mentor_id
                 WHERE s.id = :sid AND s.is_active = 1
                 LIMIT 1'
            );
            $sStmt->execute([':sid' => $sessionId]);
            $session = $sStmt->fetch();

            if (!$session) {
                throw new Exception('Session not found or inactive.');
            }

            if ((int)$session['mentor_id'] === $learnerId) {
                throw new Exception('You cannot book your own session.');
            }

            $cost = (int) $session['credits_per_session'];

            // 2. Check learner's credit balance
            $bStmt = $this->db->prepare('SELECT credits FROM users WHERE id = :uid FOR UPDATE');
            $bStmt->execute([':uid' => $learnerId]);
            $balance = (int) $bStmt->fetchColumn();

            if ($balance < $cost) {
                throw new Exception('Insufficient credits. You need ' . $cost . ' but have ' . $balance . '.');
            }

            // 3. Deduct from learner
            $this->db->prepare('UPDATE users SET credits = credits - :cost WHERE id = :uid')
                     ->execute([':cost' => $cost, ':uid' => $learnerId]);

            // 4. Add to mentor
            $this->db->prepare('UPDATE users SET credits = credits + :cost WHERE id = :uid')
                     ->execute([':cost' => $cost, ':uid' => $session['mentor_id']]);

            // 5. Update session stats
            $this->db->prepare('UPDATE users SET sessions_booked = sessions_booked + 1 WHERE id = :uid')
                     ->execute([':uid' => $learnerId]);

            // 6. Mark slot as booked (if specified)
            if ($slotId) {
                $this->db->prepare('UPDATE session_slots SET is_booked = 1 WHERE id = :id')
                         ->execute([':id' => $slotId]);
            }

            // 7. Create booking record
            $iStmt = $this->db->prepare(
                'INSERT INTO bookings (session_id, learner_id, slot_id, booking_date, time_slot, credits_paid)
                 VALUES (:sid, :lid, :slid, :date, :time, :credits)'
            );
            $iStmt->execute([
                ':sid'     => $sessionId,
                ':lid'     => $learnerId,
                ':slid'    => $slotId,
                ':date'    => $bookingDate,
                ':time'    => $timeSlot,
                ':credits' => $cost,
            ]);

            $bookingId = (int) $this->db->lastInsertId();

            $this->db->commit();

            return [
                'id'           => $bookingId,
                'session_id'   => $sessionId,
                'learner_id'   => $learnerId,
                'booking_date' => $bookingDate,
                'time_slot'    => $timeSlot,
                'credits_paid' => $cost,
                'mentor_name'  => $session['mentor_name'],
                'session_title'=> $session['title'],
                'status'       => 'upcoming',
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Get all bookings for a user (as learner), with session/mentor info.
     *
     * @param  int    $userId
     * @param  string $status  Filter: 'upcoming', 'completed', 'cancelled', or 'all'
     * @return array
     */
    public function getByUser(int $userId, string $status = 'all'): array
    {
        $sql = 'SELECT b.*, s.title AS session_title, s.skill,
                       u.name AS mentor_name, u.avatar_initial, u.avatar_color
                FROM bookings b
                JOIN sessions s ON s.id = b.session_id
                JOIN users u ON u.id = s.mentor_id
                WHERE b.learner_id = :uid';
        $params = [':uid' => $userId];

        if ($status !== 'all') {
            $sql              .= ' AND b.status = :status';
            $params[':status'] = $status;
        }

        $sql .= ' ORDER BY b.booking_date DESC, b.time_slot DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Cancel a booking: refund credits to learner, deduct from mentor.
     *
     * @param  int $bookingId
     * @param  int $userId    Must be the learner who booked
     * @return bool
     */
    public function cancel(int $bookingId, int $userId): bool
    {
        $this->db->beginTransaction();

        try {
            // Get booking details
            $stmt = $this->db->prepare(
                'SELECT b.*, s.mentor_id
                 FROM bookings b
                 JOIN sessions s ON s.id = b.session_id
                 WHERE b.id = :bid AND b.learner_id = :uid AND b.status = "upcoming"
                 LIMIT 1'
            );
            $stmt->execute([':bid' => $bookingId, ':uid' => $userId]);
            $booking = $stmt->fetch();

            if (!$booking) {
                throw new Exception('Booking not found or cannot be cancelled.');
            }

            $refund = (int) $booking['credits_paid'];

            // Refund learner
            $this->db->prepare('UPDATE users SET credits = credits + :amt WHERE id = :uid')
                     ->execute([':amt' => $refund, ':uid' => $userId]);

            // Deduct from mentor
            $this->db->prepare('UPDATE users SET credits = GREATEST(0, CAST(credits AS SIGNED) - :amt) WHERE id = :uid')
                     ->execute([':amt' => $refund, ':uid' => $booking['mentor_id']]);

            // Mark cancelled
            $this->db->prepare('UPDATE bookings SET status = "cancelled" WHERE id = :bid')
                     ->execute([':bid' => $bookingId]);

            // Free the slot
            if ($booking['slot_id']) {
                $this->db->prepare('UPDATE session_slots SET is_booked = 0 WHERE id = :id')
                         ->execute([':id' => $booking['slot_id']]);
            }

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
