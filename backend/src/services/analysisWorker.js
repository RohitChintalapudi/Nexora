import { AnalysisJobModel } from '../models/analysisJobModel.js';
import { RepositoryModel } from '../models/repositoryModel.js';
import { RepositoryFileModel } from '../models/repositoryFileModel.js';
import { RepositoryFetcher } from './repositoryFetcher.js';
import { FileScanner } from './fileScanner.js';
import { CodebaseIntelligenceService } from '../code-analysis/services/codebase-intelligence.service.js';
import { CacheService } from '../config/redis.js';

class AnalysisWorkerService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Enqueue a job ID for background ingestion processing
   * @param {number|string} jobId
   */
  enqueue(jobId) {
    this.queue.push(jobId);
    console.log(`📥 [AnalysisWorker] Job #${jobId} enqueued for M5 Ingestion & M6 Intelligence. Queue length: ${this.queue.length}`);
    this.processQueue();
  }

  /**
   * Process queued jobs sequentially without blocking the Node event loop
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const jobId = this.queue.shift();

    try {
      await this.executeJobPipeline(jobId);
    } catch (err) {
      console.error(`❌ [AnalysisWorker] Uncaught exception processing Job #${jobId}:`, err.message);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Execute the full M5 Ingestion + M6 Codebase Intelligence Pipeline
   * @param {number|string} jobId
   */
  async executeJobPipeline(jobId) {
    const job = await AnalysisJobModel.findById(jobId);

    if (!job) {
      console.warn(`⚠️ [AnalysisWorker] Job #${jobId} not found in database.`);
      return;
    }

    if (job.status !== 'QUEUED') {
      console.warn(`⚠️ [AnalysisWorker] Job #${jobId} status is '${job.status}', skipping execution.`);
      return;
    }

    let tempWorkspaceDir = null;

    try {
      // 1. Stage: INITIALIZING
      console.log(`⚙️ [AnalysisWorker] Job #${jobId} starting -> INITIALIZING`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'INITIALIZING',
        startedAt: new Date()
      });

      const repository = await RepositoryModel.findByIdAndUserId(job.repository_id, job.user_id);
      if (!repository) {
        throw new Error('Repository record not found or access denied.');
      }

      // 2. Stage: FETCHING_REPOSITORY & EXTRACTING_REPOSITORY
      console.log(`🌐 [AnalysisWorker] Job #${jobId} -> FETCHING_REPOSITORY (${repository.full_name})`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'FETCHING_REPOSITORY'
      });

      tempWorkspaceDir = await RepositoryFetcher.createTempWorkspace(jobId);

      const { commitSha, extractedRoot } = await RepositoryFetcher.fetchAndExtract({
        userId: job.user_id,
        owner: repository.owner,
        repoName: repository.name,
        defaultBranch: repository.default_branch || 'main',
        tempWorkspaceDir
      });

      // 3. Stage: SCANNING_FILES
      console.log(`🔍 [AnalysisWorker] Job #${jobId} -> SCANNING_FILES`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'SCANNING_FILES'
      });

      // 4. Stage: FILTERING_FILES & Scanning workspace
      console.log(`🧹 [AnalysisWorker] Job #${jobId} -> FILTERING_FILES`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'FILTERING_FILES'
      });

      const { files, stats } = await FileScanner.scanWorkspace(extractedRoot);
      console.log(`📊 [AnalysisWorker] Job #${jobId} Scanned: ${stats.totalFilesCount} files (${stats.sourceFilesCount} source, ${stats.ignoredFilesCount} ignored)`);

      // 5. Stage: PERSISTING_FILES
      console.log(`💾 [AnalysisWorker] Job #${jobId} -> PERSISTING_FILES`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'PERSISTING_FILES',
        filesScanned: stats.totalFilesCount,
        filesIncluded: stats.sourceFilesCount,
        filesIgnored: stats.ignoredFilesCount,
        totalSizeBytes: stats.totalSizeBytes
      });

      // Enforce idempotency: clear any previous file records before batch insert
      await RepositoryFileModel.deleteByRepositoryId(job.repository_id, job.user_id);
      await RepositoryFileModel.batchUpsert(job.repository_id, job.user_id, files);

      // Update repository-level metrics
      await RepositoryModel.updateIngestionMetadata({
        id: job.repository_id,
        userId: job.user_id,
        commitSha,
        fileCount: stats.totalFilesCount,
        sourceFileCount: stats.sourceFilesCount,
        ignoredFileCount: stats.ignoredFilesCount,
        totalSourceSizeBytes: stats.totalSourceSizeBytes
      });

      // 6. M6 Codebase Intelligence Pipeline
      console.log(`🧠 [AnalysisWorker] Job #${jobId} -> Entering M6 Codebase Intelligence Pipeline`);
      const intelligenceStats = await CodebaseIntelligenceService.analyzeRepository({
        repositoryId: job.repository_id,
        userId: job.user_id,
        onStageChange: async (stageName) => {
          console.log(`⚡ [AnalysisWorker] Job #${jobId} -> ${stageName}`);
          await AnalysisJobModel.updateStage({
            id: jobId,
            status: 'PROCESSING',
            currentStage: stageName
          });
        }
      });

      // 7. Stage: COMPLETED (Codebase Intelligence Ready)
      console.log(`✅ [AnalysisWorker] Job #${jobId} Codebase Intelligence complete! (${intelligenceStats.symbolsCount} symbols, ${intelligenceStats.relationshipsCount} relationships, ${intelligenceStats.routesCount} routes)`);
      const completedJob = await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'COMPLETED',
        currentStage: 'COMPLETED',
        filesScanned: stats.totalFilesCount,
        filesIncluded: stats.sourceFilesCount,
        filesIgnored: stats.ignoredFilesCount,
        totalSizeBytes: stats.totalSizeBytes,
        symbolsCount: intelligenceStats.symbolsCount,
        relationshipsCount: intelligenceStats.relationshipsCount,
        routesCount: intelligenceStats.routesCount,
        completedAt: new Date(),
        errorMessage: null
      });

      // Clear & update fast Redis cache
      await CacheService.del(`nexora:repo-latest:${job.repository_id}:${job.user_id}`);
      await CacheService.set(`nexora:job:${jobId}:${job.user_id}`, completedJob, 300);

    } catch (error) {
      console.error(`💥 [AnalysisWorker] Job #${jobId} failed:`, error.message);

      // Secure, user-facing error message without leaking tokens or paths
      let userMessage = error.message || 'Repository analysis failed. Please try again.';
      if (userMessage.includes('fetch failed') || userMessage.includes('terminated')) {
        userMessage = 'Network connection to GitHub was interrupted during download. Please try again.';
      }

      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'FAILED',
        currentStage: 'FAILED',
        completedAt: new Date(),
        errorMessage: userMessage
      });
    } finally {
      // Guaranteed temporary workspace cleanup
      if (tempWorkspaceDir) {
        await RepositoryFetcher.cleanupWorkspace(tempWorkspaceDir);
      }
    }
  }
}

export const analysisWorker = new AnalysisWorkerService();
