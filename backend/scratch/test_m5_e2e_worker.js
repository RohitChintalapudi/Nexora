import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

import { getSQL } from '../src/config/db.js';
import { AnalysisJobModel } from '../src/models/analysisJobModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { RepositoryFileModel } from '../src/models/repositoryFileModel.js';
import { RepositoryFetcher } from '../src/services/repositoryFetcher.js';
import { analysisWorker } from '../src/services/analysisWorker.js';

async function runM5E2EWorkerTest() {
  console.log('--- Starting NEXORA M5: End-to-End Worker Ingestion Test ---');

  const sql = getSQL();
  if (!sql) throw new Error('Database not connected.');

  try {
    const userRes = await sql`SELECT id FROM users LIMIT 1`;
    const testUserId = userRes[0].id;

    const userRepos = await RepositoryModel.findAllByUserId(testUserId);
    const testRepo = userRepos[0];

    // Reset any existing active jobs
    await sql`UPDATE analysis_jobs SET status = 'FAILED' WHERE repository_id = ${testRepo.id} AND status IN ('QUEUED', 'PROCESSING')`;

    // Create a new analysis job
    const job = await AnalysisJobModel.create({
      repositoryId: testRepo.id,
      userId: testUserId,
      status: 'QUEUED'
    });
    console.log(`[PASS] Created test Analysis Job #${job.id}`);

    // Mock RepositoryFetcher.fetchAndExtract for local offline test execution
    const originalFetchAndExtract = RepositoryFetcher.fetchAndExtract;
    RepositoryFetcher.fetchAndExtract = async ({ tempWorkspaceDir }) => {
      const extractedRoot = path.join(tempWorkspaceDir, 'extracted/repo-root');
      await fs.promises.mkdir(path.join(extractedRoot, 'src'), { recursive: true });
      await fs.promises.writeFile(path.join(extractedRoot, 'src/main.ts'), 'export function run() { return "Nexora M5"; }');
      await fs.promises.writeFile(path.join(extractedRoot, 'src/utils.js'), 'export const add = (a, b) => a + b;');
      await fs.promises.writeFile(path.join(extractedRoot, 'package.json'), '{"name":"nexora-m5","version":"1.0.0"}');
      await fs.promises.writeFile(path.join(extractedRoot, 'README.md'), '# Nexora M5 Ingestion');
      return {
        commitSha: 'fedcba0987654321fedcba0987654321fedcba09',
        extractedRoot
      };
    };

    // Enqueue job to worker
    console.log('[INFO] Enqueuing job to analysisWorker...');
    analysisWorker.enqueue(job.id);

    // Poll until completed
    let finalJob = null;
    const stagesSeen = [];
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 400));
      const current = await AnalysisJobModel.findById(job.id);
      if (current.current_stage && !stagesSeen.includes(current.current_stage)) {
        stagesSeen.push(current.current_stage);
      }
      console.log(`  [Poll #${i+1}] Status: ${current.status}, Stage: ${current.current_stage}, Scanned: ${current.files_scanned || 0}, Included: ${current.files_included || 0}`);
      if (current.status === 'COMPLETED' || current.status === 'FAILED') {
        finalJob = current;
        break;
      }
    }

    // Restore original method
    RepositoryFetcher.fetchAndExtract = originalFetchAndExtract;

    if (!finalJob || finalJob.status !== 'COMPLETED') {
      throw new Error(`Job did not complete successfully. Status: ${finalJob?.status}, Error: ${finalJob?.error_message}`);
    }

    console.log(`[PASS] Stages observed: ${stagesSeen.join(' -> ')}`);
    console.log(`[PASS] Final job stats: Scanned: ${finalJob.files_scanned}, Included: ${finalJob.files_included}, Ignored: ${finalJob.files_ignored}`);

    // Verify DB file records
    const files = await RepositoryFileModel.findByRepositoryId(testRepo.id, testUserId);
    if (files.length === 0) throw new Error('No files persisted in database after ingestion');
    console.log(`[PASS] Verified ${files.length} file records stored in PostgreSQL for repository ${testRepo.id}`);

    // Verify repository metadata updated
    const updatedRepo = await RepositoryModel.findByIdAndUserId(testRepo.id, testUserId);
    if (!updatedRepo.ingested_at || updatedRepo.file_count === 0) {
      throw new Error('Repository table was not updated with ingestion metadata');
    }
    console.log(`[PASS] Repository metadata updated: commit_sha=${updatedRepo.commit_sha}, file_count=${updatedRepo.file_count}, ingested_at=${updatedRepo.ingested_at}`);

    console.log('\n--- ALL M5 WORKER TESTS PASSED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('--- M5 E2E WORKER TEST FAILED ---', err);
    process.exit(1);
  }
}

runM5E2EWorkerTest();
