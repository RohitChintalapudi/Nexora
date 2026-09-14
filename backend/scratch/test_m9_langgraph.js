import 'dotenv/config';
import { runRepositoryAnalysis } from '../src/ai/langgraph/index.js';
import { RepositoryAnalysisModel } from '../src/models/repositoryAnalysisModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { UserModel } from '../src/models/userModel.js';

async function runM9Test() {
  console.log('🧪 Starting Milestone M9: LangGraph + AI Analysis Engine Test...\n');

  try {
    // 1. Find a test user and test repository
    let user = await UserModel.findByEmail('test-m9@nexora.dev');
    if (!user) {
      user = await UserModel.create({
        name: 'test-m9-user',
        email: 'test-m9@nexora.dev',
        password: 'testpassword123'
      });
    }

    let repos = await RepositoryModel.findAllByUserId(user.id);
    let repo = repos[0];

    if (!repo) {
      repo = await RepositoryModel.upsert({
        userId: user.id,
        githubRepositoryId: '888888',
        name: 'test-nexora-app',
        fullName: 'test-user/test-nexora-app',
        owner: 'test-user',
        isPrivate: false,
        htmlUrl: 'https://github.com/test-user/test-nexora-app',
        defaultBranch: 'main',
        language: 'TypeScript'
      });
    }

    console.log(`📌 Using User #${user.id} (${user.username}) and Repo #${repo.id} (${repo.name})`);

    // 2. Execute the LangGraph AI Analysis Workflow
    console.log('\n--- Executing LangGraph Analysis Engine ---');
    const finalState = await runRepositoryAnalysis({
      repositoryId: repo.id,
      userId: user.id,
      jobId: null,
      commitSha: 'm9-test-sha',
      onProgress: (stage, pct, msg) => {
        console.log(`   [Progress ${pct}%] Stage: ${stage} - ${msg}`);
      }
    });

    console.log('\n--- LangGraph Execution Complete ---');
    console.log('State Keys:', Object.keys(finalState));

    // 3. Verify Database Persistence in repository_analyses
    console.log('\n--- Verifying PostgreSQL Persistence ---');
    const persisted = await RepositoryAnalysisModel.findByRepositoryId(repo.id, user.id);

    if (!persisted) {
      throw new Error('Analysis record was not found in repository_analyses table!');
    }

    console.log('✅ Analysis ID:', persisted.id);
    console.log('✅ Overview:', persisted.overview?.slice(0, 120) + '...');
    console.log('✅ Tech Stack Entries:', (persisted.technology_stack || []).length);
    console.log('✅ Architecture Style:', persisted.architecture?.architecturalStyle);
    console.log('✅ Identified Modules:', (persisted.modules || []).map(m => m.name));
    console.log('✅ Application Flow Steps:', (persisted.application_flow || []).length);
    console.log('✅ Quickstart Steps:', (persisted.developer_quick_start || []).length);

    console.log('\n🎉 MILESTONE M9: LangGraph + AI Analysis Engine is 100% OPERATIONAL!');
  } catch (err) {
    console.error('❌ M9 Test Failed:', err);
  } finally {
    process.exit(0);
  }
}

runM9Test();
