<?php
/**
 * SkillSwap – Profile Controller
 *
 * Handles reading and updating user profile data.
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../helpers/auth_middleware.php';
require_once __DIR__ . '/../models/User.php';

class ProfileController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * GET — Get the current user's full profile (auth required).
     * Or get another user's profile with ?id=X (public info only).
     */
    public function read(): void
    {
        $requestedId = (int) ($_GET['id'] ?? 0);

        if ($requestedId > 0) {
            // Public profile view — anyone can see basic info
            $profile = $this->userModel->findWithProfile($requestedId);
            if (!$profile) {
                errorResponse('User not found.', 404);
            }

            // Remove sensitive fields for public view
            unset($profile['email']);

            jsonResponse([
                'success' => true,
                'profile' => $profile,
            ]);

        } else {
            // Own profile — requires auth
            $userId  = requireAuth();
            $profile = $this->userModel->findWithProfile($userId);

            if (!$profile) {
                errorResponse('Profile not found.', 404);
            }

            jsonResponse([
                'success' => true,
                'profile' => $profile,
            ]);
        }
    }

    /**
     * PUT — Update the current user's profile (auth required).
     * Body: { about?, experience?, education?, skills?,
     *         languages?, open_to_learn?, linkedin_url?,
     *         name?, role?, company? }
     */
    public function update(): void
    {
        $userId = requireAuth();
        $data   = getJsonBody();

        if (empty($data)) {
            errorResponse('No data provided to update.', 422);
        }

        // Separate user fields from profile fields
        $userFields    = ['name', 'role', 'company'];
        $profileFields = ['about', 'experience', 'education', 'skills',
                          'languages', 'open_to_learn', 'linkedin_url'];

        $userData    = [];
        $profileData = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $userFields, true)) {
                $userData[$key] = is_string($value) ? sanitize($value) : $value;
            }
            if (in_array($key, $profileFields, true)) {
                // String fields get sanitized; arrays (JSON) pass through
                $profileData[$key] = is_string($value) ? sanitize($value) : $value;
            }
        }

        $updated = false;

        if (!empty($userData)) {
            $this->userModel->updateUser($userId, $userData);
            $updated = true;
        }

        if (!empty($profileData)) {
            $this->userModel->updateProfile($userId, $profileData);
            $updated = true;
        }

        if (!$updated) {
            errorResponse('No valid fields to update.', 422);
        }

        // Return updated profile
        $profile = $this->userModel->findWithProfile($userId);

        jsonResponse([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'profile' => $profile,
        ]);
    }
}
