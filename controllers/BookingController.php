<?php
/**
 * SkillSwap – Booking Controller
 *
 * Handles session booking, listing, and cancellation.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../models/Credit.php';

class BookingController
{
    private Booking $bookingModel;
    private Credit  $creditModel;

    public function __construct()
    {
        $this->bookingModel = new Booking();
        $this->creditModel  = new Credit();
    }

    /**
     * POST — Book a session (auth required).
     * Body: { session_id, booking_date, time_slot, slot_id? }
     */
    public function create(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        $missing = validateRequired(['session_id', 'booking_date', 'time_slot'], $data);
        if (!empty($missing)) {
            errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $sessionId   = (int) $data['session_id'];
        $bookingDate = sanitize($data['booking_date']);
        $timeSlot    = sanitize($data['time_slot']);
        $slotId      = isset($data['slot_id']) ? (int) $data['slot_id'] : null;

        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
            errorResponse('Invalid date format. Use YYYY-MM-DD.', 422);
        }

        try {
            $booking = $this->bookingModel->create($sessionId, $userId, $slotId, $bookingDate, $timeSlot);

            // Log credit transactions
            $this->creditModel->addTransaction(
                $userId,
                -$booking['credits_paid'],
                'spend',
                'Booked session: ' . $booking['session_title'] . ' with ' . $booking['mentor_name'],
                $booking['id']
            );

            jsonResponse([
                'success' => true,
                'message' => 'Session booked successfully!',
                'booking' => $booking,
            ], 201);

        } catch (Exception $e) {
            errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * GET — List user's bookings (auth required).
     * Query param: status (upcoming|completed|cancelled|all)
     */
    public function list(): void
    {
        $userId = requireAuth();
        $status = $_GET['status'] ?? 'all';

        $allowed = ['upcoming', 'completed', 'cancelled', 'all'];
        if (!in_array($status, $allowed, true)) {
            $status = 'all';
        }

        $bookings = $this->bookingModel->getByUser($userId, $status);

        jsonResponse([
            'success'  => true,
            'count'    => count($bookings),
            'bookings' => $bookings,
        ]);
    }

    /**
     * DELETE — Cancel a booking and refund credits (auth required).
     * Query or body: { id }
     */
    public function cancel(): void
    {
        $userId = requireAuth();

        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            $data = getJsonBody();
            $id   = (int) ($data['id'] ?? 0);
        }
        if ($id <= 0) {
            errorResponse('Booking ID is required.', 400);
        }

        try {
            $cancelled = $this->bookingModel->cancel($id, $userId);

            if ($cancelled) {
                jsonResponse([
                    'success' => true,
                    'message' => 'Booking cancelled. Credits have been refunded.',
                ]);
            } else {
                errorResponse('Could not cancel booking.', 400);
            }

        } catch (Exception $e) {
            errorResponse($e->getMessage(), 400);
        }
    }
}
