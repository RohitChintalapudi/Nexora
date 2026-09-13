import { AnalysisJobModel } from '../models/analysisJobModel.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AnalysisWorkerService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Enqueue a job ID for background analysis processing
   * @param {number|string} jobId
   */
  enqueue(jobId) {
    this.queue.push(jobId);
    console.log(`📥 [AnalysisWorker] Job #${jobId} enqueued. Queue length: ${this.queue.length}`);
    this.processQueue();
  }

  /**
   * Process queued jobs sequentially without blocking the event loop
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const jobId = this.queue.shift();

    try {
      await this.executeJobPipeline(jobId);
    } catch (err) {
      console.error(`❌ [AnalysisWorker] Unexpected failure executing Job #${jobId}:`, err.message);
    } finally {
      this.isProcessing = false;
      // Continue processing remaining queue items if any
      if (this.queue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Execute the staged analysis pipeline placeholder for Milestone M4
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

    try {
      // 1. Transition: QUEUED -> PROCESSING (Stage: INITIALIZING)
      console.log(`⚙️ [AnalysisWorker] Job #${jobId} starting -> INITIALIZING`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'INITIALIZING',
        startedAt: new Date()
      });
      await delay(1200);

      // 2. Transition: Stage -> FETCHING_REPOSITORY (Placeholder for M5)
      console.log(`🌐 [AnalysisWorker] Job #${jobId} -> FETCHING_REPOSITORY`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'FETCHING_REPOSITORY'
      });
      await delay(1800);

      // 3. Transition: Stage -> SCANNING (Placeholder for M5)
      console.log(`🔍 [AnalysisWorker] Job #${jobId} -> SCANNING`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'PROCESSING',
        currentStage: 'SCANNING'
      });
      await delay(1800);

      // 4. Transition: PROCESSING -> COMPLETED
      console.log(`✅ [AnalysisWorker] Job #${jobId} completed successfully.`);
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'COMPLETED',
        currentStage: 'COMPLETED',
        completedAt: new Date(),
        errorMessage: null
      });
    } catch (error) {
      console.error(`💥 [AnalysisWorker] Job #${jobId} encountered an error:`, error.message);
      
      // Guard: Ensure job never remains stuck in PROCESSING
      await AnalysisJobModel.updateStage({
        id: jobId,
        status: 'FAILED',
        currentStage: 'FAILED',
        completedAt: new Date(),
        errorMessage: 'Repository analysis failed. Please try again.'
      });
    }
  }
}

export const analysisWorker = new AnalysisWorkerService();
