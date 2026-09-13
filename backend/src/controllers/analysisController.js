import { AnalysisJobModel } from '../models/analysisJobModel.js';
import { RepositoryModel } from '../models/repositoryModel.js';
import { analysisWorker } from '../services/analysisWorker.js';

export const analysisController = {
  /**
   * Start asynchronous repository analysis job
   * POST /api/repositories/:repositoryId/analyze
   */
  async startAnalysis(req, res) {
    try {
      const { repositoryId } = req.params;

      if (!repositoryId || isNaN(Number(repositoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID parameter'
        });
      }

      // Verify authenticated user owns this repository
      const repository = await RepositoryModel.findByIdAndUserId(repositoryId, req.user.id);
      if (!repository) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }

      // Check for an existing active analysis job (QUEUED or PROCESSING)
      const activeJob = await AnalysisJobModel.findActiveByRepositoryId(repositoryId, req.user.id);
      if (activeJob) {
        return res.status(200).json({
          success: true,
          message: 'Analysis job is already in progress',
          jobId: activeJob.id,
          status: activeJob.status,
          currentStage: activeJob.current_stage
        });
      }

      // Create new analysis job with QUEUED status
      const job = await AnalysisJobModel.create({
        repositoryId: repository.id,
        userId: req.user.id,
        status: 'QUEUED',
        currentStage: 'QUEUED'
      });

      // Dispatch to asynchronous background worker
      analysisWorker.enqueue(job.id);

      return res.status(201).json({
        success: true,
        message: 'Analysis job created successfully',
        jobId: job.id,
        status: job.status,
        currentStage: job.current_stage
      });
    } catch (error) {
      console.error('Error starting analysis job:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initiate repository analysis'
      });
    }
  },

  /**
   * Get analysis job status with strict multi-tenant authorization
   * GET /api/analysis/jobs/:jobId
   */
  async getJobStatus(req, res) {
    try {
      const { jobId } = req.params;

      if (!jobId || isNaN(Number(jobId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID parameter'
        });
      }

      // Multi-tenant check: user_id must match authenticated user
      const job = await AnalysisJobModel.findByIdAndUserId(jobId, req.user.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Analysis job not found or access denied'
        });
      }

      return res.status(200).json({
        success: true,
        job: {
          id: job.id,
          repositoryId: job.repository_id,
          repositoryName: job.repository_name,
          repositoryFullName: job.repository_full_name,
          status: job.status,
          currentStage: job.current_stage,
          errorMessage: job.error_message,
          filesScanned: job.files_scanned || 0,
          filesIncluded: job.files_included || 0,
          filesIgnored: job.files_ignored || 0,
          totalSizeBytes: job.total_size_bytes || 0,
          startedAt: job.started_at,
          completedAt: job.completed_at,
          createdAt: job.created_at
        }
      });
    } catch (error) {
      console.error('Error fetching job status:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve analysis job status'
      });
    }
  },

  /**
   * Get latest analysis job for a specific repository
   * GET /api/repositories/:repositoryId/analysis/latest
   */
  async getLatestRepoJob(req, res) {
    try {
      const { repositoryId } = req.params;

      if (!repositoryId || isNaN(Number(repositoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID parameter'
        });
      }

      const repository = await RepositoryModel.findByIdAndUserId(repositoryId, req.user.id);
      if (!repository) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }

      const latestJob = await AnalysisJobModel.findLatestByRepositoryId(repositoryId, req.user.id);

      return res.status(200).json({
        success: true,
        job: latestJob
          ? {
              id: latestJob.id,
              repositoryId: latestJob.repository_id,
              status: latestJob.status,
              currentStage: latestJob.current_stage,
              errorMessage: latestJob.error_message,
              filesScanned: latestJob.files_scanned || 0,
              filesIncluded: latestJob.files_included || 0,
              filesIgnored: latestJob.files_ignored || 0,
              totalSizeBytes: latestJob.total_size_bytes || 0,
              startedAt: latestJob.started_at,
              completedAt: latestJob.completed_at,
              createdAt: latestJob.created_at
            }
          : null
      });
    } catch (error) {
      console.error('Error fetching latest repository job:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve repository analysis status'
      });
    }
  }
};
