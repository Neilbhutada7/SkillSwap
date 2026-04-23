<?php
/**
 * SkillSwap – Message Controller
 *
 * Handles sending messages, listing conversations, and reading threads.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/Message.php';

class MessageController
{
    private Message $messageModel;

    public function __construct()
    {
        $this->messageModel = new Message();
    }

    /**
     * POST — Send a message (auth required).
     * Body: { receiver_id, content }
     */
    public function send(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        $missing = validateRequired(['receiver_id', 'content'], $data);
        if (!empty($missing)) {
            errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
        }

        $receiverId = (int) $data['receiver_id'];
        $content    = sanitize($data['content']);

        if ($receiverId <= 0) {
            errorResponse('Invalid receiver ID.', 422);
        }

        if ($receiverId === $userId) {
            errorResponse('You cannot message yourself.', 422);
        }

        if (strlen($content) === 0) {
            errorResponse('Message cannot be empty.', 422);
        }

        $message = $this->messageModel->send($userId, $receiverId, $content);

        jsonResponse([
            'success' => true,
            'message' => $message,
        ], 201);
    }

    /**
     * GET — List all conversations for the current user (auth required).
     */
    public function conversations(): void
    {
        $userId = requireAuth();

        $conversations = $this->messageModel->getConversations($userId);

        jsonResponse([
            'success'       => true,
            'count'         => count($conversations),
            'conversations' => $conversations,
        ]);
    }

    /**
     * GET — Get a chat thread with another user (auth required).
     * Query param: with (the other user's ID)
     */
    public function thread(): void
    {
        $userId  = requireAuth();
        $otherId = (int) ($_GET['with'] ?? 0);

        if ($otherId <= 0) {
            errorResponse('Parameter "with" (user ID) is required.', 400);
        }

        // Get messages
        $messages = $this->messageModel->getThread($userId, $otherId);

        // Mark incoming messages as read
        $this->messageModel->markAsRead($userId, $otherId);

        jsonResponse([
            'success'  => true,
            'count'    => count($messages),
            'messages' => $messages,
        ]);
    }
}
