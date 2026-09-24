import express from 'express';
import { feedbackController } from '../controllers/feedbackController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All feedback routes require an authenticated NEXORA user session
router.use(protect);

// 1. Submit user feedback from the dashboard widget
router.post('/', feedbackController.submitFeedback);

// 2. List feedback submitted by the authenticated user
router.get('/', feedbackController.getFeedback);

export default router;