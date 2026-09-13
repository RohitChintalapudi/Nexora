import express from 'express';
import { repositoryController } from '../controllers/repositoryController.js';
import { analysisController } from '../controllers/analysisController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All repository routes require authenticated NEXORA user session
router.use(protect);

// 1. Save / Select repository
router.post('/', repositoryController.selectRepository);

// 2. List saved repositories for authenticated user
router.get('/', repositoryController.getRepositories);

// 3. Start analysis job for a specific repository (M4)
router.post('/:repositoryId/analyze', analysisController.startAnalysis);

// 4. Get latest analysis job for a specific repository (M4)
router.get('/:repositoryId/analysis/latest', analysisController.getLatestRepoJob);

// 5. Get single saved repository by ID (multi-tenant isolated)
router.get('/:id', repositoryController.getRepositoryById);

// 6. Delete saved repository by ID
router.delete('/:id', repositoryController.deleteRepository);

export default router;
