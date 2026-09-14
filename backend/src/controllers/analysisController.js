import { AnalysisJobModel } from '../models/analysisJobModel.js';
import { RepositoryModel } from '../models/repositoryModel.js';
import { RepositoryAnalysisModel } from '../models/repositoryAnalysisModel.js';
import { analysisWorker } from '../services/analysisWorker.js';
import { CacheService } from '../config/redis.js';

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

      // Invalidate any cached latest job and analysis for this repo
      await CacheService.del(`nexora:repo-latest:${repositoryId}:${req.user.id}`);
      await CacheService.del(`nexora:analysis:${repositoryId}:${req.user.id}`);

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

      const cacheKey = `nexora:job:${jobId}:${req.user.id}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          job: cached
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

      const jobData = {
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
        symbolsCount: job.symbols_count || 0,
        relationshipsCount: job.relationships_count || 0,
        routesCount: job.routes_count || 0,
        chunksCount: job.chunks_count || 0,
        embeddingsCount: job.embeddings_count || 0,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        createdAt: job.created_at
      };

      // Cache: short TTL for active jobs, longer TTL for completed/failed
      const isTerminal = job.status === 'COMPLETED' || job.status === 'FAILED';
      await CacheService.set(cacheKey, jobData, isTerminal ? 300 : 2);

      return res.status(200).json({
        success: true,
        job: jobData
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

      const cacheKey = `nexora:repo-latest:${repositoryId}:${req.user.id}`;
      const cached = await CacheService.get(cacheKey);
      if (cached !== null && cached !== undefined) {
        return res.status(200).json({
          success: true,
          cached: true,
          job: cached
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

      const jobData = latestJob
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
            symbolsCount: latestJob.symbols_count || 0,
            relationshipsCount: latestJob.relationships_count || 0,
            routesCount: latestJob.routes_count || 0,
            chunksCount: latestJob.chunks_count || 0,
            embeddingsCount: latestJob.embeddings_count || 0,
            startedAt: latestJob.started_at,
            completedAt: latestJob.completed_at,
            createdAt: latestJob.created_at
          }
        : null;

      // Cache latest job (3s for active, 120s for completed)
      const isTerminal = latestJob && (latestJob.status === 'COMPLETED' || latestJob.status === 'FAILED');
      await CacheService.set(cacheKey, jobData, isTerminal ? 120 : 3);

      return res.status(200).json({
        success: true,
        job: jobData
      });
    } catch (error) {
      console.error('Error fetching latest repository job:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve repository analysis status'
      });
    }
  },

  /**
   * Get structured repository analysis results (M10)
   * GET /api/repositories/:repositoryId/analysis
   */
  async getAnalysisByRepoId(req, res) {
    try {
      const { repositoryId } = req.params;

      if (!repositoryId || isNaN(Number(repositoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID parameter'
        });
      }

      // 1. Strict multi-tenant check: repository must belong to authenticated user
      const repository = await RepositoryModel.findByIdAndUserId(repositoryId, req.user.id);
      if (!repository) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }

      const repoPayload = {
        id: repository.id,
        name: repository.name,
        fullName: repository.full_name,
        owner: repository.owner,
        description: repository.description || '',
        private: repository.private,
        defaultBranch: repository.default_branch || 'main',
        language: repository.language || null,
        htmlUrl: repository.html_url,
        createdAt: repository.created_at,
        updatedAt: repository.updated_at
      };

      // 2. Fetch latest analysis job to check job state and metrics
      const latestJob = await AnalysisJobModel.findLatestByRepositoryId(repositoryId, req.user.id);

      // 3. Fetch structured analysis record from PostgreSQL
      const analysisRecord = await RepositoryAnalysisModel.findByRepositoryId(repositoryId, req.user.id);

      // Handle cases where analysis has not completed yet
      if (!analysisRecord) {
        if (latestJob && (latestJob.status === 'QUEUED' || latestJob.status === 'PROCESSING')) {
          return res.status(200).json({
            success: true,
            status: 'IN_PROGRESS',
            repository: repoPayload,
            job: {
              id: latestJob.id,
              status: latestJob.status,
              currentStage: latestJob.current_stage,
              startedAt: latestJob.started_at,
              createdAt: latestJob.created_at
            }
          });
        }

        if (latestJob && latestJob.status === 'FAILED') {
          return res.status(200).json({
            success: true,
            status: 'FAILED',
            repository: repoPayload,
            job: {
              id: latestJob.id,
              status: latestJob.status,
              errorMessage: latestJob.error_message || 'Analysis failed',
              createdAt: latestJob.created_at
            }
          });
        }

        return res.status(200).json({
          success: true,
          status: 'NOT_FOUND',
          repository: repoPayload,
          message: 'No analysis available yet for this repository'
        });
      }

      const ensureArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const ensureObject = (val, fallback = {}) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
          } catch {
            return fallback;
          }
        }
        return fallback;
      };

      // Format clean, structured analysis JSON adhering to M10 specification
      const responsePayload = {
        success: true,
        status: 'COMPLETED',
        repository: repoPayload,
        analysis: {
          overview: typeof analysisRecord.overview === 'string' ? analysisRecord.overview : '',
          technologyStack: ensureArray(analysisRecord.technology_stack),
          architecture: ensureObject(analysisRecord.architecture, { summary: '', layers: [], relationships: [] }),
          modules: ensureArray(analysisRecord.modules),
          applicationFlow: ensureArray(analysisRecord.application_flow),
          entryPoints: ensureArray(analysisRecord.entry_points),
          importantFiles: ensureArray(analysisRecord.important_files),
          dependencies: ensureArray(analysisRecord.dependencies),
          database: ensureObject(analysisRecord.database, {}),
          apiStructure: ensureArray(analysisRecord.api_structure),
          developerQuickStart: ensureArray(analysisRecord.developer_quick_start),
          uncertainties: ensureArray(analysisRecord.uncertainties)
        },
        metadata: {
          jobId: analysisRecord.job_id,
          commitSha: analysisRecord.commit_sha || repository.commit_sha || null,
          createdAt: analysisRecord.created_at,
          updatedAt: analysisRecord.updated_at,
          filesScanned: latestJob?.files_scanned || 0,
          filesIncluded: latestJob?.files_included || 0,
          totalSizeBytes: latestJob?.total_size_bytes || 0,
          symbolsCount: latestJob?.symbols_count || 0,
          relationshipsCount: latestJob?.relationships_count || 0,
          routesCount: latestJob?.routes_count || 0,
          chunksCount: latestJob?.chunks_count || 0,
          embeddingsCount: latestJob?.embeddings_count || 0
        }
      };

      return res.status(200).json(responsePayload);
    } catch (error) {
      console.error('Error fetching repository analysis:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve repository analysis'
      });
    }
  }
};
