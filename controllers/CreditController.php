<?php
/**
 * SkillSwap – Credit Controller
 *
 * Handles credit balance queries and transaction history.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/Credit.php';

class CreditController
{
    private Credit $creditModel;

    public function __construct()
    {
        $this->creditModel = new Credit();
    }

    /**
     * GET — Get the current user's credit balance and summary (auth required).
     */
    public function balance(): void
    {
        $userId  = requireAuth();
        $summary = $this->creditModel->getSummary($userId);

        jsonResponse([
            'success' => true,
            'credits' => $summary,
        ]);
    }

    /**
     * GET — Get credit transaction history (auth required).
     * Query param: limit (default 50)
     */
    public function history(): void
    {
        $userId = requireAuth();
        $limit  = min((int) ($_GET['limit'] ?? 50), 200);

        $history = $this->creditModel->getHistory($userId, $limit);

        jsonResponse([
            'success' => true,
            'count'   => count($history),
            'history' => $history,
        ]);
    }
}
