import express from 'express';
import { analysisController } from '../controllers/analysisController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All analysis routes require authenticated NEXORA user session
router.use(protect);

// 1. Get job status by job ID
router.get('/jobs/:jobId', analysisController.getJobStatus);

export default router;
