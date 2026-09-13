import dotenv from 'dotenv';
dotenv.config();

import { getSQL } from '../src/config/db.js';
import { AnalysisJobModel } from '../src/models/analysisJobModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { analysisWorker } from '../src/services/analysisWorker.js';

async function runM4Verification() {
  console.log('--- Starting NEXORA M4 Automated Verification ---');

  try {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    // 1. Get or create a test user and repo
    const userRes = await sql`SELECT id FROM users LIMIT 1`;
    if (userRes.length === 0) {
      throw new Error('No users found in database for test.');
    }
    const testUserId = userRes[0].id;
    const fakeOtherUserId = 99999999;
    console.log(`[PASS] Using test user: ${testUserId}`);

    // Get or create a test repository
    const userRepos = await RepositoryModel.findAllByUserId(testUserId);
    let testRepo = userRepos.length > 0 ? userRepos[0] : null;
    if (!testRepo) {
      testRepo = await RepositoryModel.upsert({
        userId: testUserId,
        githubRepositoryId: 99999999,
        name: 'm4-test-repo',
        fullName: 'testowner/m4-test-repo',
        owner: 'testowner',
        htmlUrl: 'https://github.com/testowner/m4-test-repo',
        description: 'M4 Test Repository',
        isPrivate: false,
        defaultBranch: 'main',
        language: 'JavaScript'
      });
    }
    console.log(`[PASS] Using test repository ID: ${testRepo.id} (${testRepo.full_name || testRepo.fullName})`);

    // Clean up any stale active jobs for clean test run
    await sql`UPDATE analysis_jobs SET status = 'FAILED' WHERE repository_id = ${testRepo.id} AND status IN ('QUEUED', 'PROCESSING')`;

    // 2. Test AnalysisJobModel.create
    const createdJob = await AnalysisJobModel.create({
      repositoryId: testRepo.id,
      userId: testUserId,
      status: 'QUEUED'
    });
    console.log(`[PASS] Job created: ${createdJob.id}, Status: ${createdJob.status}, Current Stage: ${createdJob.current_stage || 'none'}`);
    if (createdJob.status !== 'QUEUED') throw new Error('Expected status QUEUED');

    // 3. Test Duplicate Active Job check
    const activeJob = await AnalysisJobModel.findActiveByRepositoryId(testRepo.id, testUserId);
    if (!activeJob || activeJob.id !== createdJob.id) {
      throw new Error('Active job lookup failed to find the existing active job');
    }
    console.log(`[PASS] Duplicate active job detection confirmed: Job ${activeJob.id} is actively ${activeJob.status}`);

    // 4. Test Multi-tenant Isolation
    const isolatedJob = await AnalysisJobModel.findByIdAndUserId(createdJob.id, fakeOtherUserId);
    if (isolatedJob !== null) {
      throw new Error('Multi-tenant security breach: User B accessed User A\'s job');
    }
    console.log('[PASS] Multi-tenant isolation verified (Foreign user query returned null)');

    // 5. Test Worker Pipeline Progression
    console.log('[INFO] Enqueuing job to background worker queue...');
    analysisWorker.enqueue(createdJob.id, testRepo.id, testUserId);

    // Poll until completed or failed
    let finalJob = null;
    const stagesSeen = new Set();
    const maxPolls = 25;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 600));
      const current = await AnalysisJobModel.findById(createdJob.id);
      if (current.current_stage) stagesSeen.add(current.current_stage);
      console.log(`  [Worker Poll #${i+1}] Status: ${current.status}, Stage: ${current.current_stage}, Error: ${current.error_message || 'none'}`);
      if (current.status === 'COMPLETED' || current.status === 'FAILED') {
        finalJob = current;
        break;
      }
    }

    if (!finalJob) {
      throw new Error('Worker timed out before reaching terminal status');
    }

    if (finalJob.status !== 'COMPLETED') {
      throw new Error(`Expected COMPLETED status but got ${finalJob.status}: ${finalJob.error_message}`);
    }

    console.log(`[PASS] Stages visited during analysis: ${Array.from(stagesSeen).join(' -> ')}`);
    console.log(`[PASS] Job reached terminal COMPLETED status at ${finalJob.completed_at}`);

    // 6. Test latest job query
    const latest = await AnalysisJobModel.findLatestByRepositoryId(testRepo.id, testUserId);
    if (!latest || latest.id !== createdJob.id || latest.status !== 'COMPLETED') {
      throw new Error('findLatestByRepositoryId failed to return latest completed job');
    }
    console.log('[PASS] findLatestByRepositoryId accurately retrieved the completed job');

    console.log('\n--- ALL M4 ANALYSIS JOB SYSTEM CHECKS PASSED! ---');
    process.exit(0);
  } catch (err) {
    console.error('--- M4 VERIFICATION FAILED ---', err);
    process.exit(1);
  }
}

runM4Verification();
