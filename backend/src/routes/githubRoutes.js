import express from 'express';
import { githubController } from '../controllers/githubController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Start OAuth - Authenticated NEXORA user initiates GitHub authorization
router.get('/connect', protect, githubController.connect);

// 2. OAuth Callback - GitHub redirects back with authorization code & state
router.get('/callback', githubController.callback);

// 3. Status - Returns whether current user has connected GitHub
router.get('/status', protect, githubController.getStatus);

// 4. Repositories - Returns paginated repositories from GitHub for authenticated user
router.get('/repositories', protect, githubController.listRepositories);

// 5. Disconnect - Disconnects GitHub authorization without deleting NEXORA user account
router.delete('/disconnect', protect, githubController.disconnect);

export default router;
