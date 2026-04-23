<?php
/**
 * SkillSwap – Review Controller
 *
 * Handles creating and listing reviews for mentors/sessions.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/Review.php';

class ReviewController
{
    private Review $reviewModel;

    public function __construct()
    {
        $this->reviewModel = new Review();
    }

    /**
     * POST — Submit a review (auth required).
     * Body: { mentor_id, session_id, rating, review_text, booking_id? }
     */
    public function create(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        $missing = validateRequired(['mentor_id', 'session_id', 'rating', 'review_text'], $data);
        if (!empty($missing)) {
            errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $mentorId   = (int) $data['mentor_id'];
        $sessionId  = (int) $data['session_id'];
        $rating     = (int) $data['rating'];
        $reviewText = sanitize($data['review_text']);
        $bookingId  = isset($data['booking_id']) ? (int) $data['booking_id'] : null;

        try {
            $review = $this->reviewModel->create(
                $userId, $mentorId, $sessionId, $rating, $reviewText, $bookingId
            );

            jsonResponse([
                'success' => true,
                'message' => 'Review submitted successfully!',
                'review'  => $review,
            ], 201);

        } catch (Exception $e) {
            errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * GET — List reviews for a mentor.
     * Query: mentor_id (required)
     */
    public function list(): void
    {
        $mentorId = (int) ($_GET['mentor_id'] ?? 0);
        if ($mentorId <= 0) {
            errorResponse('mentor_id is required.', 400);
        }

        $reviews = $this->reviewModel->getByMentor($mentorId);
        $stats   = $this->reviewModel->getMentorStats($mentorId);

        jsonResponse([
            'success'      => true,
            'avg_rating'   => $stats['avg_rating'],
            'review_count' => $stats['review_count'],
            'reviews'      => $reviews,
        ]);
    }
}
