import express from 'express';
import {
  register,
  login,
  googleAuth,
  githubAuth,
  googleCallback,
  githubCallback,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/github', authLimiter, githubAuth);
router.get('/google/callback', googleCallback);
router.get('/github/callback', githubCallback);
router.get('/me', protect, getMe);

export default router;
