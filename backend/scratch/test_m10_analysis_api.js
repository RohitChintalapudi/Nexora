import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { UserModel } from '../src/models/userModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { RepositoryAnalysisModel } from '../src/models/repositoryAnalysisModel.js';
import { RepositoryFileModel } from '../src/models/repositoryFileModel.js';
import { AnalysisJobModel } from '../src/models/analysisJobModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

function generateTestToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function runM10BackendTests() {
  console.log('🧪 Starting Milestone M10: Repository Analysis Backend & Security Tests...\n');

  try {
    // 1. Setup User A (owner)
    let userA = await UserModel.findByEmail('test-m10-user-a@nexora.dev');
    if (!userA) {
      userA = await UserModel.create({
        name: 'User A',
        email: 'test-m10-user-a@nexora.dev',
        password: 'password123'
      });
    }

    // 2. Setup User B (attacker/different tenant)
    let userB = await UserModel.findByEmail('test-m10-user-b@nexora.dev');
    if (!userB) {
      userB = await UserModel.create({
        name: 'User B',
        email: 'test-m10-user-b@nexora.dev',
        password: 'password123'
      });
    }

    const tokenA = generateTestToken(userA);
    const tokenB = generateTestToken(userB);

    // 3. Create repository for User A
    const repoA = await RepositoryModel.upsert({
      userId: userA.id,
      githubRepositoryId: '999901',
      name: 'nexora-core',
      fullName: 'userA/nexora-core',
      owner: 'userA',
      description: 'Core intelligence engine for NEXORA',
      isPrivate: true,
      htmlUrl: 'https://github.com/userA/nexora-core',
      defaultBranch: 'main',
      language: 'TypeScript'
    });

    // 4. Create sample files in repository_files for source preview test
    await RepositoryFileModel.batchUpsert(repoA.id, userA.id, [
      {
        path: 'src/main.ts',
        name: 'main.ts',
        extension: '.ts',
        language: 'TypeScript',
        sizeBytes: 250,
        isBinary: false,
        isGenerated: false,
        isIgnored: false,
        content: `import express from 'express';\nimport { setupRoutes } from './routes';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\nsetupRoutes(app);\napp.listen(PORT, () => console.log('Server running on port ' + PORT));\n`
      },
      {
        path: 'src/services/auth.service.ts',
        name: 'auth.service.ts',
        extension: '.ts',
        language: 'TypeScript',
        sizeBytes: 320,
        isBinary: false,
        isGenerated: false,
        isIgnored: false,
        content: `export class AuthService {\n  async validateToken(token: string) {\n    // Validate JWT session\n    return { userId: 1, role: 'admin' };\n  }\n}\n`
      }
    ]);

    // 5. Create structured analysis record in repository_analyses for User A's repo
    await RepositoryAnalysisModel.upsert({
      repositoryId: repoA.id,
      userId: userA.id,
      commitSha: '9f8e7d6c',
      overview: 'NEXORA Core is a full-stack developer intelligence platform analyzing codebases using AST parsing and semantic embeddings.',
      technologyStack: [
        {
          name: 'TypeScript',
          category: 'Language',
          status: 'FACT',
          confidence: 1.0,
          evidence: ['package.json', 'tsconfig.json'],
          purpose: 'Primary typed development language'
        },
        {
          name: 'Express',
          category: 'Backend Framework',
          status: 'FACT',
          confidence: 1.0,
          evidence: ['package.json dependency'],
          purpose: 'HTTP REST API service'
        },
        {
          name: 'PostgreSQL',
          category: 'Database',
          status: 'FACT',
          confidence: 0.95,
          evidence: ['src/config/db.ts'],
          purpose: 'Relational data store and vector persistence'
        }
      ],
      architecture: {
        summary: 'Layered architecture separating API routing, business services, and database persistence.',
        architecturalStyle: 'Layered Service Architecture',
        layers: [
          { name: 'Routes', description: 'HTTP routing endpoints', role: 'ROUTER' },
          { name: 'Controllers', description: 'Request handling & validation', role: 'CONTROLLER' },
          { name: 'Services', description: 'Business logic execution', role: 'SERVICE' },
          { name: 'Database', description: 'PostgreSQL persistence', role: 'REPOSITORY' }
        ],
        relationships: [
          { from: 'Routes', to: 'Controllers', type: 'ROUTES_TO', evidence: 'src/routes/index.ts' },
          { from: 'Controllers', to: 'Services', type: 'DELEGATES_TO', evidence: 'src/controllers/user.controller.ts' }
        ],
        confidence: 'HIGH'
      },
      modules: [
        {
          name: 'Authentication Module',
          purpose: 'Handles user registration, JWT token generation, and OAuth validation.',
          status: 'FACT',
          keyFiles: ['src/services/auth.service.ts', 'src/middlewares/authMiddleware.ts'],
          keySymbols: ['AuthService', 'protect'],
          dependencies: ['jsonwebtoken', 'bcryptjs'],
          evidence: ['src/services/auth.service.ts imports jsonwebtoken']
        }
      ],
      applicationFlow: [
        {
          stepNumber: 1,
          stage: 'HTTP Ingestion',
          description: 'Express server receives incoming request at route endpoint.',
          filesInvolved: ['src/main.ts', 'src/routes/index.ts'],
          status: 'FACT'
        },
        {
          stepNumber: 2,
          stage: 'Authentication Middleware',
          description: 'Validates JWT bearer token before executing controller.',
          filesInvolved: ['src/services/auth.service.ts'],
          status: 'FACT'
        }
      ],
      entryPoints: [
        { path: 'src/main.ts', type: 'Server Startup' }
      ],
      importantFiles: [
        { path: 'src/main.ts', reason: 'Application entry point' },
        { path: 'src/services/auth.service.ts', reason: 'Authentication and session management', startLine: 1, endLine: 7 }
      ],
      dependencies: [
        { name: 'express', version: '^4.21.2', category: 'Backend' },
        { name: 'jsonwebtoken', version: '^9.0.2', category: 'Security' }
      ],
      database: {
        detected: true,
        type: 'PostgreSQL',
        evidence: ['src/config/db.ts'],
        models: ['User', 'Repository', 'AnalysisJob']
      },
      apiStructure: [
        { method: 'GET', path: '/api/repositories/:id/analysis', handler: 'getAnalysisByRepoId', filePath: 'src/routes/repositoryRoutes.ts' }
      ],
      developerQuickStart: [
        { step: 1, action: 'Clone the repository and run npm install.' },
        { step: 2, action: 'Configure DATABASE_URL and JWT_SECRET in .env.' },
        { step: 3, action: 'Start the development server with npm run dev and inspect src/main.ts.' }
      ],
      uncertainties: [
        'Caching layer utilizes Redis when REDIS_URL is provided, else falls back to in-memory.'
      ]
    });

    console.log('✅ Test fixture data seeded successfully.');

    // Import controllers directly for unit/integration testing
    const { analysisController } = await import('../src/controllers/analysisController.js');
    const { repositoryController } = await import('../src/controllers/repositoryController.js');

    // TEST 1: Authenticated User A can fetch their own analysis
    console.log('\n--- Test 1: Authenticated User A retrieves analysis ---');
    let resData1 = null;
    let resStatus1 = 200;
    const req1 = {
      params: { repositoryId: String(repoA.id) },
      user: { id: userA.id }
    };
    const res1 = {
      status(code) { resStatus1 = code; return this; },
      json(data) { resData1 = data; return this; }
    };
    await analysisController.getAnalysisByRepoId(req1, res1);

    if (resStatus1 !== 200 || !resData1.success || resData1.status !== 'COMPLETED') {
      throw new Error(`Test 1 Failed: Expected status 200 and COMPLETED, got ${resStatus1} and ${JSON.stringify(resData1)}`);
    }
    console.log('✅ Test 1 Passed: Retrieved analysis successfully with overview:', resData1.analysis.overview.slice(0, 50) + '...');
    console.log('   Tech Stack count:', resData1.analysis.technologyStack.length);
    console.log('   Architecture style:', resData1.analysis.architecture.architecturalStyle);
    console.log('   Important files count:', resData1.analysis.importantFiles.length);

    // TEST 2: Multi-tenant security - User B cannot access User A's analysis
    console.log('\n--- Test 2: User B attempts to access User A analysis (Multi-tenant check) ---');
    let resData2 = null;
    let resStatus2 = 200;
    const req2 = {
      params: { repositoryId: String(repoA.id) },
      user: { id: userB.id }
    };
    const res2 = {
      status(code) { resStatus2 = code; return this; },
      json(data) { resData2 = data; return this; }
    };
    await analysisController.getAnalysisByRepoId(req2, res2);

    if (resStatus2 !== 404 && resStatus2 !== 403) {
      throw new Error(`Test 2 Failed: Expected 404/403 for unauthorized tenant, got ${resStatus2}`);
    }
    console.log(`✅ Test 2 Passed: User B access denied with status ${resStatus2}: "${resData2.message}"`);

    // TEST 3: Repository without analysis returns NOT_FOUND status
    console.log('\n--- Test 3: Repository without analysis ---');
    const repoB = await RepositoryModel.upsert({
      userId: userB.id,
      githubRepositoryId: '999902',
      name: 'unparsed-repo',
      fullName: 'userB/unparsed-repo',
      owner: 'userB',
      isPrivate: false,
      defaultBranch: 'main'
    });

    let resData3 = null;
    let resStatus3 = 200;
    const req3 = {
      params: { repositoryId: String(repoB.id) },
      user: { id: userB.id }
    };
    const res3 = {
      status(code) { resStatus3 = code; return this; },
      json(data) { resData3 = data; return this; }
    };
    await analysisController.getAnalysisByRepoId(req3, res3);

    if (resStatus3 !== 200 || resData3.status !== 'NOT_FOUND') {
      throw new Error(`Test 3 Failed: Expected status NOT_FOUND, got ${resStatus3} ${JSON.stringify(resData3)}`);
    }
    console.log(`✅ Test 3 Passed: Repository without analysis returned status: "${resData3.status}"`);

    // TEST 4: Source file content preview endpoint
    console.log('\n--- Test 4: File content retrieval for source references ---');
    let resData4 = null;
    let resStatus4 = 200;
    const req4 = {
      params: { repositoryId: String(repoA.id) },
      query: { path: 'src/main.ts' },
      user: { id: userA.id }
    };
    const res4 = {
      status(code) { resStatus4 = code; return this; },
      json(data) { resData4 = data; return this; }
    };
    await repositoryController.getFileContent(req4, res4);

    if (resStatus4 !== 200 || !resData4.success || !resData4.file || !resData4.file.content) {
      throw new Error(`Test 4 Failed: Expected 200 and file content, got ${resStatus4} ${JSON.stringify(resData4)}`);
    }
    console.log(`✅ Test 4 Passed: Retrieved file "${resData4.file.path}" with ${resData4.file.linesCount} lines.`);

    // TEST 5: Source file content multi-tenant check
    console.log('\n--- Test 5: User B attempts to read User A source file ---');
    let resData5 = null;
    let resStatus5 = 200;
    const req5 = {
      params: { repositoryId: String(repoA.id) },
      query: { path: 'src/main.ts' },
      user: { id: userB.id }
    };
    const res5 = {
      status(code) { resStatus5 = code; return this; },
      json(data) { resData5 = data; return this; }
    };
    await repositoryController.getFileContent(req5, res5);

    if (resStatus5 !== 404 && resStatus5 !== 403) {
      throw new Error(`Test 5 Failed: Expected 404/403 for unauthorized file access, got ${resStatus5}`);
    }
    console.log(`✅ Test 5 Passed: User B file access denied with status ${resStatus5}.`);

    console.log('\n🎉 ALL BACKEND TESTS FOR MILESTONE M10 PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ M10 Backend Test Error:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runM10BackendTests();
