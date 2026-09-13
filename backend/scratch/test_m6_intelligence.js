import dotenv from 'dotenv';
dotenv.config();

import { TypeScriptParser } from '../src/code-analysis/parsers/typescript.parser.js';
import { PythonParser } from '../src/code-analysis/parsers/python.parser.js';
import { GenericCodeParser } from '../src/code-analysis/parsers/generic.parser.js';
import { ImportResolver } from '../src/code-analysis/imports/import-resolver.js';
import { RouteDetector } from '../src/code-analysis/routes/route-detector.js';
import { ProjectMetadataExtractor } from '../src/code-analysis/metadata/project-metadata.js';
import { ArchitecturalClassifier } from '../src/code-analysis/roles/architectural-classifier.js';
import { RelationshipBuilder } from '../src/code-analysis/relationships/relationship-builder.js';
import { CodebaseIntelligenceService } from '../src/code-analysis/services/codebase-intelligence.service.js';
import { SymbolModel } from '../src/models/symbolModel.js';
import { RelationshipModel } from '../src/models/relationshipModel.js';
import { RouteModel } from '../src/models/routeModel.js';
import { ProjectMetadataModel } from '../src/models/projectMetadataModel.js';
import { UserModel } from '../src/models/userModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { RepositoryFileModel } from '../src/models/repositoryFileModel.js';
import { getSQL, initDB } from '../src/config/db.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runM6Tests() {
  console.log('====================================================');
  console.log('🧪 NEXORA M6: CODEBASE INTELLIGENCE TEST SUITE');
  console.log('====================================================\n');

  // ---------------------------------------------------------------
  // TEST 1: TypeScript & TSX AST Parser
  // ---------------------------------------------------------------
  console.log('▶ TEST 1: TypeScript & TSX AST Parsing');
  const tsParser = new TypeScriptParser();
  const tsCode = `
    import React from 'react';
    import { UserService } from '../services/user.service';
    import type { UserProfile } from '@/types/user';

    export interface IUserComponent {
      title: string;
    }

    export type UserStatus = 'active' | 'suspended';

    export enum Role {
      ADMIN = 'admin',
      MEMBER = 'member'
    }

    export const MAX_RETRY_COUNT = 3;

    export class UserDashboard extends BaseComponent implements IUserComponent {
      constructor(public title: string) {
        super();
      }

      async loadMetrics(userId: string): Promise<void> {
        // load
      }
    }

    export const UserCard = ({ title }: IUserComponent) => {
      return <div>{title}</div>;
    };

    export async function fetchUserData(id: string) {
      return { id };
    }
  `;

  const tsParsed = await tsParser.parse({
    file: { id: 1, path: 'src/components/UserCard.tsx', extension: '.tsx', language: 'TypeScript React' },
    content: tsCode
  });

  assert(tsParsed.status === 'PARSED', 'TypeScript parser completed with status PARSED');
  assert(tsParsed.symbols.some(s => s.name === 'UserCard' && s.type === 'COMPONENT'), 'Detected React Component "UserCard"');
  assert(tsParsed.symbols.some(s => s.name === 'UserDashboard' && s.type === 'CLASS'), 'Extracted Class "UserDashboard"');
  assert(tsParsed.symbols.some(s => s.name === 'UserDashboard.loadMetrics' && s.type === 'METHOD'), 'Extracted Method "UserDashboard.loadMetrics"');
  assert(tsParsed.symbols.some(s => s.name === 'IUserComponent' && s.type === 'INTERFACE'), 'Extracted Interface "IUserComponent"');
  assert(tsParsed.symbols.some(s => s.name === 'UserStatus' && s.type === 'TYPE'), 'Extracted Type "UserStatus"');
  assert(tsParsed.symbols.some(s => s.name === 'Role' && s.type === 'ENUM'), 'Extracted Enum "Role"');
  assert(tsParsed.symbols.some(s => s.name === 'fetchUserData' && s.type === 'FUNCTION'), 'Extracted Async Function "fetchUserData"');
  assert(tsParsed.symbols.some(s => s.name === 'MAX_RETRY_COUNT' && s.type === 'CONSTANT'), 'Extracted Constant "MAX_RETRY_COUNT"');
  assert(tsParsed.extendsList.some(e => e.className === 'UserDashboard' && e.superClassName === 'BaseComponent'), 'Extracted inheritance extends: UserDashboard -> BaseComponent');
  assert(tsParsed.implementsList.some(i => i.className === 'UserDashboard' && i.interfaceName === 'IUserComponent'), 'Extracted inheritance implements: UserDashboard -> IUserComponent');
  assert(tsParsed.imports.length === 3, `Extracted ${tsParsed.imports.length} imports`);
  assert(tsParsed.exports.length === 7, `Extracted ${tsParsed.exports.length} exported symbols`);

  // ---------------------------------------------------------------
  // TEST 2: Python AST Parser
  // ---------------------------------------------------------------
  console.log('\n▶ TEST 2: Python AST Parsing');
  const pyParser = new PythonParser();
  const pyCode = `
import os
from fastapi import FastAPI, APIRouter
from app.services.user_service import UserService

app = FastAPI()
router = APIRouter()

@app.get('/api/v1/users')
def list_users(limit: int = 10):
    return UserService.get_all(limit)

class AuthManager(BaseManager):
    def __init__(self, key: str):
        self.key = key

    @router.post('/login')
    async def login_user(self, credentials: dict):
        pass
  `;

  const pyParsed = await pyParser.parse({
    file: { id: 2, path: 'app/controllers/user_controller.py', extension: '.py', language: 'Python' },
    content: pyCode
  });

  assert(pyParsed.status === 'PARSED', 'Python parser completed with status PARSED');
  assert(pyParsed.symbols.some(s => s.name === 'list_users' && s.type === 'FUNCTION'), 'Extracted Python function "list_users"');
  assert(pyParsed.symbols.some(s => s.name === 'AuthManager' && s.type === 'CLASS'), 'Extracted Python class "AuthManager"');
  assert(pyParsed.symbols.some(s => s.name === 'AuthManager.login_user' && s.type === 'METHOD'), 'Extracted Python method "AuthManager.login_user"');
  assert(pyParsed.extendsList.some(e => e.className === 'AuthManager' && e.superClassName === 'BaseManager'), 'Extracted Python class inheritance extends: AuthManager -> BaseManager');
  assert(pyParsed.routes.some(r => r.method === 'GET' && r.path === '/api/v1/users' && r.framework === 'FastAPI'), 'Extracted FastAPI route GET /api/v1/users');
  assert(pyParsed.routes.some(r => r.method === 'POST' && r.path === '/login'), 'Extracted router route POST /login');
  assert(pyParsed.imports.some(i => i.rawPath === 'app.services.user_service'), 'Extracted Python from-import "app.services.user_service"');

  // ---------------------------------------------------------------
  // TEST 3: Import Resolution & Alias Mapping
  // ---------------------------------------------------------------
  console.log('\n▶ TEST 3: Import Resolution & Alias Handling');
  const mockFiles = [
    { id: 10, path: 'src/controllers/user.controller.ts', language: 'TypeScript' },
    { id: 11, path: 'src/services/user.service.ts', language: 'TypeScript' },
    { id: 12, path: 'src/components/Button.tsx', language: 'TypeScript React' },
    { id: 13, path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { paths: { "@/*": ["src/*"] } } }) }
  ];

  const resolver = new ImportResolver(mockFiles);

  const resRelative = resolver.resolveImport({
    sourceFilePath: 'src/controllers/user.controller.ts',
    rawImportPath: '../services/user.service',
    language: 'TypeScript'
  });
  assert(resRelative.resolved === true && resRelative.targetFile.id === 11, 'Successfully resolved relative import "../services/user.service" -> "src/services/user.service.ts"');

  const resAlias = resolver.resolveImport({
    sourceFilePath: 'src/controllers/user.controller.ts',
    rawImportPath: '@/components/Button',
    language: 'TypeScript'
  });
  assert(resAlias.resolved === true && resAlias.targetFile.id === 12, 'Successfully resolved alias import "@/components/Button" -> "src/components/Button.tsx"');

  const resExternal = resolver.resolveImport({
    sourceFilePath: 'src/controllers/user.controller.ts',
    rawImportPath: 'express',
    language: 'TypeScript'
  });
  assert(resExternal.resolved === false && resExternal.isExternal === true, 'External package "express" correctly flagged unresolved and external');

  // ---------------------------------------------------------------
  // TEST 4: Project Metadata & Framework Detection
  // ---------------------------------------------------------------
  console.log('\n▶ TEST 4: Project Metadata & Framework Detection');
  const repoMetaFiles = [
    {
      id: 20,
      path: 'package.json',
      content: JSON.stringify({
        name: 'nexora-app',
        main: 'src/server.js',
        scripts: { start: 'node src/server.js', dev: 'nodemon src/server.js' },
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          '@prisma/client': '^5.0.0',
          '@neondatabase/serverless': '^0.10.0'
        }
      })
    },
    { id: 21, path: 'pnpm-lock.yaml', content: '' },
    { id: 22, path: 'src/server.js', content: 'console.log("server");', language: 'JavaScript' },
    { id: 23, path: 'src/app.tsx', content: '', language: 'TypeScript React' }
  ];

  const metadata = ProjectMetadataExtractor.extract(repoMetaFiles);
  assert(metadata.frameworks.some(f => f.name === 'Next.js' && f.confidence === 'DETERMINISTIC'), 'Detected Next.js framework from package.json');
  assert(metadata.packageManager === 'pnpm', 'Detected package manager "pnpm" from lockfile');
  assert(metadata.databaseIndicators.some(d => d.name.includes('Prisma')), 'Detected Prisma ORM database indicator');
  assert(metadata.databaseIndicators.some(d => d.name.includes('PostgreSQL')), 'Detected PostgreSQL database client');
  assert(metadata.entryPoints.some(e => e.path === 'src/server.js'), 'Identified entry point "src/server.js"');

  // ---------------------------------------------------------------
  // TEST 5: Architectural Role Classification
  // ---------------------------------------------------------------
  console.log('\n▶ TEST 5: Architectural Role Classification');
  const filesToClassify = [
    { id: 30, path: 'src/controllers/user.controller.ts', language: 'TypeScript' },
    { id: 31, path: 'src/services/billing.service.ts', language: 'TypeScript' },
    { id: 32, path: 'src/repositories/account.repository.ts', language: 'TypeScript' },
    { id: 33, path: 'src/models/user.model.ts', language: 'TypeScript' },
    { id: 34, path: 'src/components/Header.tsx', language: 'TypeScript React' },
    { id: 35, path: 'src/hooks/useAuth.ts', language: 'TypeScript' },
    { id: 36, path: 'src/__tests__/auth.test.ts', language: 'TypeScript' }
  ];

  const roles = ArchitecturalClassifier.classify(filesToClassify);
  assert(roles.find(r => r.fileId === 30)?.role === 'CONTROLLER', 'Classified user.controller.ts as CONTROLLER');
  assert(roles.find(r => r.fileId === 31)?.role === 'SERVICE', 'Classified billing.service.ts as SERVICE');
  assert(roles.find(r => r.fileId === 32)?.role === 'REPOSITORY', 'Classified account.repository.ts as REPOSITORY');
  assert(roles.find(r => r.fileId === 33)?.role === 'MODEL', 'Classified user.model.ts as MODEL');
  assert(roles.find(r => r.fileId === 34)?.role === 'COMPONENT', 'Classified Header.tsx as COMPONENT');
  assert(roles.find(r => r.fileId === 35)?.role === 'HOOK', 'Classified useAuth.ts as HOOK');
  assert(roles.find(r => r.fileId === 36)?.role === 'TEST', 'Classified auth.test.ts as TEST');

  // ---------------------------------------------------------------
  // TEST 6: Relationship Graph Building
  // ---------------------------------------------------------------
  console.log('\n▶ TEST 6: Relationship Graph Building');
  const parsedMap = new Map();
  parsedMap.set(10, {
    symbols: [{ name: 'UserController', type: 'CLASS' }],
    imports: [{ rawPath: '../services/user.service', specifiers: [{ name: 'UserService' }] }],
    extendsList: [],
    implementsList: [],
    routes: []
  });
  parsedMap.set(11, {
    symbols: [{ name: 'UserService', type: 'CLASS' }],
    imports: [],
    extendsList: [],
    implementsList: [],
    routes: []
  });

  const rels = RelationshipBuilder.build({
    repositoryFiles: mockFiles,
    parsedFilesMap: parsedMap,
    importResolver: resolver
  });

  assert(rels.some(r => r.sourceFileId === 10 && r.targetFileId === 11 && r.relationshipType === 'IMPORTS'), 'Established relationship: user.controller.ts -> IMPORTS -> user.service.ts');

  // ---------------------------------------------------------------
  // TEST 7: Database Migration, Live Persistence & Multi-Tenant Isolation
  // ---------------------------------------------------------------
  console.log('\n▶ TEST 7: Database Migration & Tenant Isolation (Neon PostgreSQL)');
  await initDB();
  const sql = getSQL();
  if (sql) {
    // 1. Create a test user A and test user B
    const uniqueEmailA = `test_m6_a_${Date.now()}@nexora.test`;
    const uniqueEmailB = `test_m6_b_${Date.now()}@nexora.test`;

    const userA = await UserModel.create({ name: 'User A', email: uniqueEmailA, password: 'password123' });
    const userB = await UserModel.create({ name: 'User B', email: uniqueEmailB, password: 'password123' });

    // 2. Create test repository for User A
    const repoA = await RepositoryModel.upsert({
      userId: userA.id,
      githubRepositoryId: `gh_test_${Date.now()}`,
      name: 'nexora-test-repo',
      fullName: 'userA/nexora-test-repo',
      owner: 'userA',
      defaultBranch: 'main',
      language: 'TypeScript'
    });

    // 3. Create test files for Repo A
    const sampleFiles = [
      {
        path: 'src/services/user.service.ts',
        name: 'user.service.ts',
        extension: '.ts',
        language: 'TypeScript',
        sizeBytes: 350,
        content: `export class UserService {\n  static async findUser(id: string) { return { id }; }\n}`
      },
      {
        path: 'src/controllers/user.controller.ts',
        name: 'user.controller.ts',
        extension: '.ts',
        language: 'TypeScript',
        sizeBytes: 450,
        content: `import { UserService } from '../services/user.service';\nexport class UserController {\n  async getUser(id: string) { return UserService.findUser(id); }\n}`
      },
      {
        path: 'src/routes/user.routes.ts',
        name: 'user.routes.ts',
        extension: '.ts',
        language: 'TypeScript',
        sizeBytes: 250,
        content: `import express from 'express';\nconst router = express.Router();\nrouter.get('/api/users', (req, res) => res.json([]));\nexport default router;`
      },
      {
        path: 'package.json',
        name: 'package.json',
        extension: '.json',
        language: 'JSON',
        sizeBytes: 200,
        content: JSON.stringify({
          name: 'test-app',
          dependencies: { express: '^4.18.2' }
        })
      }
    ];

    await RepositoryFileModel.batchUpsert(repoA.id, userA.id, sampleFiles);
    const dbFiles = await RepositoryFileModel.findByRepositoryId(repoA.id, userA.id, { includeContent: true });
    assert(dbFiles.length === 4, 'Saved 4 repository files to database for Repo A');

    // 4. Run full CodebaseIntelligenceService pipeline
    const stagesVisited = [];
    const stats = await CodebaseIntelligenceService.analyzeRepository({
      repositoryId: repoA.id,
      userId: userA.id,
      files: dbFiles,
      onStageChange: (stage) => stagesVisited.push(stage)
    });

    assert(stats.symbolsCount >= 3, `Extracted and persisted ${stats.symbolsCount} symbols`);
    assert(stats.relationshipsCount >= 1, `Extracted and persisted ${stats.relationshipsCount} relationships`);
    assert(stats.routesCount >= 1, `Extracted and persisted ${stats.routesCount} routes`);
    assert(stagesVisited.includes('PARSING_FILES'), 'Pipeline passed stage PARSING_FILES');
    assert(stagesVisited.includes('BUILDING_RELATIONSHIPS'), 'Pipeline passed stage BUILDING_RELATIONSHIPS');
    assert(stagesVisited.includes('EXTRACTING_PROJECT_METADATA'), 'Pipeline passed stage EXTRACTING_PROJECT_METADATA');

    // 5. Verify User Tenant Isolation
    // User A can read their own symbols, relationships, metadata
    const userASymbols = await SymbolModel.findByRepositoryId(repoA.id, userA.id);
    const userARoutes = await RouteModel.findByRepositoryId(repoA.id, userA.id);
    const userAMetadata = await ProjectMetadataModel.findByRepositoryId(repoA.id, userA.id);

    assert(userASymbols.length > 0, `User A retrieved ${userASymbols.length} symbols from their repo`);
    assert(userARoutes.length > 0, `User A retrieved ${userARoutes.length} routes from their repo`);
    assert(userAMetadata !== null, 'User A retrieved project metadata');

    // User B CANNOT read User A's symbols, routes, relationships, or metadata
    const userBSymbols = await SymbolModel.findByRepositoryId(repoA.id, userB.id);
    const userBRoutes = await RouteModel.findByRepositoryId(repoA.id, userB.id);
    const userBMetadata = await ProjectMetadataModel.findByRepositoryId(repoA.id, userB.id);

    assert(userBSymbols.length === 0, 'Security: User B cannot retrieve User A symbols (isolation verified)');
    assert(userBRoutes.length === 0, 'Security: User B cannot retrieve User A routes (isolation verified)');
    assert(userBMetadata === null, 'Security: User B cannot retrieve User A metadata (isolation verified)');

    // 6. Clean up test records
    await sql`DELETE FROM users WHERE id IN (${userA.id}, ${userB.id})`;
    console.log('  ✅ PostgreSQL DB operations, persistence & tenant isolation verified successfully.');
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runM6Tests().catch((err) => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
