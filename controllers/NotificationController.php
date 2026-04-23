<?php
/**
 * SkillSwap – Notification Controller
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/Notification.php';

class NotificationController
{
    private Notification $notifModel;

    public function __construct()
    {
        $this->notifModel = new Notification();
    }

    public function list(): void
    {
        $userId = requireAuth();
        $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        $notifications = $this->notifModel->getForUser($userId, $limit);
        $unreadCount   = $this->notifModel->getUnreadCount($userId);

        jsonResponse([
            'success'       => true,
            'notifications' => $notifications,
            'unread_count'  => $unreadCount
        ]);
    }

    public function markRead(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        if (!isset($data['id'])) {
            errorResponse('Notification ID is required.', 400);
        }

        $this->notifModel->markAsRead((int)$data['id'], $userId);

        jsonResponse([
            'success' => true,
            'message' => 'Marked as read'
        ]);
    }

    public function markAllRead(): void
    {
        $userId = requireAuth();
        $this->notifModel->markAllAsRead($userId);

        jsonResponse([
            'success' => true,
            'message' => 'All marked as read'
        ]);
    }
}
