import express from 'express';
import {
  register,
  login,
  googleAuth,
  githubAuth,
  googleCallback,
  githubCallback,
  getMe,
  changePassword
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
router.put('/change-password', protect, authLimiter, changePassword);
router.post('/change-password', protect, authLimiter, changePassword);

export default router;
