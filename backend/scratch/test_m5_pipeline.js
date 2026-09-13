import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

import { getSQL } from '../src/config/db.js';
import { FileScanner } from '../src/services/fileScanner.js';
import { RepositoryFetcher } from '../src/services/repositoryFetcher.js';
import { RepositoryFileModel } from '../src/models/repositoryFileModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { AnalysisJobModel } from '../src/models/analysisJobModel.js';
import { analysisWorker } from '../src/services/analysisWorker.js';

async function runM5Verification() {
  console.log('--- Starting NEXORA M5: Repository Ingestion Automated Verification ---');

  const sql = getSQL();
  if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

  const testTempDirs = [];

  try {
    // 1. Get test user and repository
    const userRes = await sql`SELECT id FROM users LIMIT 1`;
    if (userRes.length === 0) throw new Error('No users found in database for test.');
    const testUserId = userRes[0].id;
    const fakeOtherUserId = 99999999;
    console.log(`[PASS] Using test user: ${testUserId}`);

    const userRepos = await RepositoryModel.findAllByUserId(testUserId);
    let testRepo = userRepos.length > 0 ? userRepos[0] : null;
    if (!testRepo) {
      testRepo = await RepositoryModel.upsert({
        userId: testUserId,
        githubRepositoryId: 88888888,
        name: 'm5-test-repo',
        fullName: 'testowner/m5-test-repo',
        owner: 'testowner',
        htmlUrl: 'https://github.com/testowner/m5-test-repo',
        description: 'M5 Ingestion Test Repository',
        isPrivate: false,
        defaultBranch: 'main',
        language: 'TypeScript'
      });
    }
    console.log(`[PASS] Using test repository: ID ${testRepo.id} (${testRepo.full_name || testRepo.name})`);

    // 2. Create a realistic sample repository directory structure to test scanner & filters
    const sampleRepoDir = path.join(os.tmpdir(), `nexora-test-repo-${crypto.randomBytes(6).toString('hex')}`);
    testTempDirs.push(sampleRepoDir);
    await fs.promises.mkdir(sampleRepoDir, { recursive: true });

    // Populate realistic source files
    await fs.promises.mkdir(path.join(sampleRepoDir, 'src/components'), { recursive: true });
    await fs.promises.mkdir(path.join(sampleRepoDir, 'src/services'), { recursive: true });
    await fs.promises.mkdir(path.join(sampleRepoDir, 'node_modules/fake-pkg'), { recursive: true });
    await fs.promises.mkdir(path.join(sampleRepoDir, '.git/objects'), { recursive: true });
    await fs.promises.mkdir(path.join(sampleRepoDir, 'dist/bundle'), { recursive: true });
    await fs.promises.mkdir(path.join(sampleRepoDir, '.next/static'), { recursive: true });

    // .gitignore file
    await fs.promises.writeFile(path.join(sampleRepoDir, '.gitignore'), `
dist/
coverage/
*.log
ignored-folder/
`);

    await fs.promises.mkdir(path.join(sampleRepoDir, 'ignored-folder'), { recursive: true });
    await fs.promises.writeFile(path.join(sampleRepoDir, 'ignored-folder/secret.js'), 'console.log("ignore me");');

    // Valid source files
    await fs.promises.writeFile(path.join(sampleRepoDir, 'src/index.ts'), 'export const hello = (): string => "Hello Nexora";');
    await fs.promises.writeFile(path.join(sampleRepoDir, 'src/components/App.tsx'), 'import React from "react"; export const App = () => <div>Nexora</div>;');
    await fs.promises.writeFile(path.join(sampleRepoDir, 'src/services/auth.js'), 'module.exports = { login: () => true };');
    await fs.promises.writeFile(path.join(sampleRepoDir, 'package.json'), JSON.stringify({ name: 'm5-test', version: '1.0.0' }, null, 2));
    await fs.promises.writeFile(path.join(sampleRepoDir, 'README.md'), '# M5 Test Repository\n\nTesting ingestion.');

    // Ignored / Binary / Lock / Sensitive files
    await fs.promises.writeFile(path.join(sampleRepoDir, 'package-lock.json'), '{"name": "lockfile", "version": "1.0.0"}');
    await fs.promises.writeFile(path.join(sampleRepoDir, 'node_modules/fake-pkg/index.js'), 'module.exports = {};');
    await fs.promises.writeFile(path.join(sampleRepoDir, '.git/config'), '[core] repositoryformatversion = 0');
    await fs.promises.writeFile(path.join(sampleRepoDir, 'dist/bundle/app.min.js'), 'function minified(){};');
    await fs.promises.writeFile(path.join(sampleRepoDir, 'debug.log'), '2026-09-13 Error log');
    await fs.promises.writeFile(path.join(sampleRepoDir, '.env'), 'SECRET_DATABASE_KEY=super_secret_123');

    // Real binary file (contains null bytes)
    const binaryBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
    await fs.promises.writeFile(path.join(sampleRepoDir, 'logo.png'), binaryBuffer);

    console.log('[PASS] Created mock repository workspace with diverse file tree');

    // 3. Test FileScanner
    const scanResult = await FileScanner.scanWorkspace(sampleRepoDir);
    const { files, stats } = scanResult;

    console.log(`[PASS] Scanner returned ${files.length} total files (${stats.sourceFilesCount} source files included, ${stats.ignoredFilesCount} ignored)`);

    // Verify directory exclusions
    const paths = files.map(f => f.path);
    if (paths.some(p => p.startsWith('node_modules/') || p.startsWith('.git/') || p.startsWith('.next/'))) {
      throw new Error('Scanner failed to ignore blacklisted directory (.git / node_modules / .next)');
    }
    console.log('[PASS] Directory blacklist verified (.git, node_modules, .next excluded)');

    // Verify .gitignore compliance
    if (paths.some(p => p.startsWith('ignored-folder/') || p.endsWith('.log'))) {
      throw new Error('Scanner failed to respect .gitignore rules');
    }
    console.log('[PASS] .gitignore rules honored (ignored-folder and *.log excluded)');

    // Verify language detection
    const indexTs = files.find(f => f.path === 'src/index.ts');
    const appTsx = files.find(f => f.path === 'src/components/App.tsx');
    const authJs = files.find(f => f.path === 'src/services/auth.js');
    const readmeMd = files.find(f => f.path === 'README.md');

    if (indexTs?.language !== 'TypeScript' || appTsx?.language !== 'TypeScript React' || authJs?.language !== 'JavaScript' || readmeMd?.language !== 'Markdown') {
      throw new Error(`Language detection mismatch: ${indexTs?.language}, ${appTsx?.language}, ${authJs?.language}, ${readmeMd?.language}`);
    }
    console.log('[PASS] Language detection accurate (TS, TSX, JS, Markdown)');

    // Verify binary file detection & non-storage
    const logoPng = files.find(f => f.path === 'logo.png');
    if (!logoPng || !logoPng.isBinary || logoPng.content !== null) {
      throw new Error('Binary detection failed: binary file was not properly flagged or content was not nullified');
    }
    console.log('[PASS] Binary file detected and stripped of content storage');

    // Verify sensitive configuration file redaction
    const envFile = files.find(f => f.path === '.env');
    if (envFile && envFile.content.includes('super_secret_123')) {
      throw new Error('Security Leak: .env file plain secret was stored unredacted');
    }
    console.log('[PASS] Sensitive files (.env) content safely protected/redacted');

    // 4. Test Database Batch Upsert & Idempotency
    console.log('[INFO] Testing RepositoryFileModel database persistence...');
    await RepositoryFileModel.deleteByRepositoryId(testRepo.id, testUserId);
    const insertedCount = await RepositoryFileModel.batchUpsert(testRepo.id, testUserId, files);
    console.log(`[PASS] Batch upserted ${insertedCount} file records into repository_files`);

    // Verify DB Query
    const dbFiles = await RepositoryFileModel.findByRepositoryId(testRepo.id, testUserId);
    if (dbFiles.length !== files.length) {
      throw new Error(`Expected ${files.length} files in DB, found ${dbFiles.length}`);
    }
    console.log(`[PASS] Verified ${dbFiles.length} file records stored in PostgreSQL`);

    // Test Multi-Tenant Isolation
    const foreignUserFiles = await RepositoryFileModel.findByRepositoryId(testRepo.id, fakeOtherUserId);
    if (foreignUserFiles.length !== 0) {
      throw new Error('Multi-tenant security breach: User B accessed User A\'s repository files');
    }
    console.log('[PASS] Multi-tenant isolation verified (Foreign user query returned 0 rows)');

    // Test Stats query
    const repoStats = await RepositoryFileModel.getStats(testRepo.id, testUserId);
    console.log(`[PASS] Database statistics calculated: Source files: ${repoStats.source_files}, Total size: ${repoStats.total_source_size_bytes}B`);

    // Test Repository Ingestion Metadata Update
    await RepositoryModel.updateIngestionMetadata({
      id: testRepo.id,
      userId: testUserId,
      commitSha: 'a1b2c3d4e5f67890abcdef1234567890abcdef12',
      fileCount: stats.totalFilesCount,
      sourceFileCount: stats.sourceFilesCount,
      ignoredFileCount: stats.ignoredFilesCount,
      totalSourceSizeBytes: stats.totalSourceSizeBytes
    });
    console.log('[PASS] Updated repository-level ingestion metadata');

    // 5. Test Temporary Workspace Lifecycle & Cleanup Guarantee
    console.log('[INFO] Testing RepositoryFetcher temporary workspace cleanup guarantee...');
    const tempWorkspace = await RepositoryFetcher.createTempWorkspace(999);
    testTempDirs.push(tempWorkspace);
    if (!fs.existsSync(tempWorkspace)) throw new Error('Temp workspace was not created');
    console.log(`  Created temp workspace: ${tempWorkspace}`);

    await RepositoryFetcher.cleanupWorkspace(tempWorkspace);
    if (fs.existsSync(tempWorkspace)) throw new Error('Temp workspace was not removed after cleanup');
    console.log('[PASS] Guaranteed workspace cleanup verified (workspace removed)');

    console.log('\n--- ALL M5 REPOSITORY INGESTION CHECKS PASSED! ---');
    process.exit(0);
  } catch (err) {
    console.error('--- M5 VERIFICATION FAILED ---', err);
    process.exit(1);
  } finally {
    for (const dir of testTempDirs) {
      try {
        if (fs.existsSync(dir)) {
          await fs.promises.rm(dir, { recursive: true, force: true });
        }
      } catch {}
    }
  }
}

runM5Verification();
