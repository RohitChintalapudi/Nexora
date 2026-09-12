import express from 'express';
import { register, login, googleAuth, githubAuth, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/github', githubAuth);
router.get('/me', protect, getMe);

export default router;
