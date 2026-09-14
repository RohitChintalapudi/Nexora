import dotenv from 'dotenv';
dotenv.config();

import { getSQL, initDB } from '../src/config/db.js';
import { UserModel } from '../src/models/userModel.js';
import { RepositoryModel } from '../src/models/repositoryModel.js';
import { RepositoryFileModel } from '../src/models/repositoryFileModel.js';
import { SymbolModel } from '../src/models/symbolModel.js';
import { CodeChunkModel } from '../src/models/codeChunkModel.js';
import { embeddingService } from '../src/ai/embeddings/embedding.service.js';
import { codeChunker } from '../src/ai/chunking/code-chunker.js';
import { QueryEmbedder } from '../src/ai/rag/query-embedder.js';
import { Reranker } from '../src/ai/rag/reranker.js';
import { ContextBuilder } from '../src/ai/rag/context-builder.js';
import { ragService } from '../src/ai/rag/rag.service.js';

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

async function runM8Tests() {
  console.log('====================================================');
  console.log('🧪 NEXORA M8: RAG PIPELINE AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  await initDB();
  const sql = getSQL();

  let userA, userB, repoA, repoB;

  try {
    // ---------------------------------------------------------------
    // SETUP: Test Users, Repositories, Files, Symbols & Embeddings
    // ---------------------------------------------------------------
    console.log('▶ SETUP: Seeding Test Data & Vector Embeddings');
    const emailA = `test_m8_a_${Date.now()}@nexora.test`;
    const emailB = `test_m8_b_${Date.now()}@nexora.test`;

    userA = await UserModel.create({ name: 'RAG User A', email: emailA, password: 'password123' });
    userB = await UserModel.create({ name: 'RAG User B', email: emailB, password: 'password123' });

    repoA = await RepositoryModel.upsert({
      userId: userA.id,
      githubRepositoryId: `gh_rag_a_${Date.now()}`,
      name: 'ecommerce-backend',
      fullName: 'userA/ecommerce-backend',
      owner: 'userA',
      defaultBranch: 'main',
      language: 'JavaScript'
    });

    repoB = await RepositoryModel.upsert({
      userId: userB.id,
      githubRepositoryId: `gh_rag_b_${Date.now()}`,
      name: 'analytics-service',
      fullName: 'userB/analytics-service',
      owner: 'userB',
      defaultBranch: 'main',
      language: 'Python'
    });

    // Seed files for Repo A
    const authCode = `
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return res.json({ token, user });
}

export class AuthService {
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
`;

    const dbCode = `
import { Pool } from 'pg';

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000
});

export async function runQuery(text, params) {
  const start = Date.now();
  const res = await dbPool.query(text, params);
  const duration = Date.now() - start;
  return { rows: res.rows, duration };
}
`;

    const file1Res = await sql`
      INSERT INTO repository_files (repository_id, user_id, path, name, extension, language, size_bytes, content)
      VALUES (${repoA.id}, ${userA.id}, 'src/controllers/auth.controller.js', 'auth.controller.js', '.js', 'JavaScript', ${authCode.length}, ${authCode})
      RETURNING id;
    `;
    const file1Id = file1Res[0].id;

    const file2Res = await sql`
      INSERT INTO repository_files (repository_id, user_id, path, name, extension, language, size_bytes, content)
      VALUES (${repoA.id}, ${userA.id}, 'src/config/database.js', 'database.js', '.js', 'JavaScript', ${dbCode.length}, ${dbCode})
      RETURNING id;
    `;
    const file2Id = file2Res[0].id;

    // Seed symbols
    const sym1 = await sql`
      INSERT INTO symbols (repository_id, user_id, file_id, name, type, language, line_start, line_end, is_exported)
      VALUES (${repoA.id}, ${userA.id}, ${file1Id}, 'loginUser', 'FUNCTION', 'JavaScript', 5, 13, true)
      RETURNING id;
    `;
    const sym2 = await sql`
      INSERT INTO symbols (repository_id, user_id, file_id, name, type, language, line_start, line_end, is_exported)
      VALUES (${repoA.id}, ${userA.id}, ${file1Id}, 'AuthService', 'CLASS', 'JavaScript', 15, 19, true)
      RETURNING id;
    `;
    const sym3 = await sql`
      INSERT INTO symbols (repository_id, user_id, file_id, name, type, language, line_start, line_end, is_exported)
      VALUES (${repoA.id}, ${userA.id}, ${file2Id}, 'runQuery', 'FUNCTION', 'JavaScript', 10, 15, true)
      RETURNING id;
    `;

    // Chunk and generate embeddings for Repo A
    const chunksA = [
      ...codeChunker.chunkFile({
        fileId: file1Id,
        filePath: 'src/controllers/auth.controller.js',
        content: authCode,
        language: 'JavaScript',
        symbols: [
          { id: sym1[0].id, name: 'loginUser', kind: 'FUNCTION', startLine: 5, endLine: 13, fileId: file1Id },
          { id: sym2[0].id, name: 'AuthService', kind: 'CLASS', startLine: 15, endLine: 19, fileId: file1Id }
        ]
      }),
      ...codeChunker.chunkFile({
        fileId: file2Id,
        filePath: 'src/config/database.js',
        content: dbCode,
        language: 'JavaScript',
        symbols: [
          { id: sym3[0].id, name: 'runQuery', kind: 'FUNCTION', startLine: 10, endLine: 15, fileId: file2Id }
        ]
      })
    ];

    const embeddingsA = await embeddingService.generateEmbeddings(chunksA.map(c => c.content));
    const chunksToInsertA = chunksA.map((c, i) => ({
      ...c,
      repositoryId: repoA.id,
      embedding: embeddingsA[i]
    }));
    await CodeChunkModel.batchInsert(repoA.id, userA.id, chunksToInsertA);

    // Seed file and chunk for Repo B (User B)
    const pythonCodeB = `
def track_event(event_name: str, properties: dict):
    """Log analytics event to ClickHouse"""
    print(f"Tracking: {event_name}")
`;
    const fileBRes = await sql`
      INSERT INTO repository_files (repository_id, user_id, path, name, extension, language, size_bytes, content)
      VALUES (${repoB.id}, ${userB.id}, 'analytics/tracker.py', 'tracker.py', '.py', 'Python', ${pythonCodeB.length}, ${pythonCodeB})
      RETURNING id;
    `;
    const fileBId = fileBRes[0].id;
    const chunksB = codeChunker.chunkFile({
      fileId: fileBId,
      filePath: 'analytics/tracker.py',
      content: pythonCodeB,
      language: 'Python',
      symbols: []
    });
    const embeddingsB = await embeddingService.generateEmbeddings(chunksB.map(c => c.content));
    const chunksToInsertB = chunksB.map((c, i) => ({
      ...c,
      repositoryId: repoB.id,
      embedding: embeddingsB[i]
    }));
    await CodeChunkModel.batchInsert(repoB.id, userB.id, chunksToInsertB);
    console.log('  ✅ Seeded test users, repositories, files, and vector chunks.\n');

    // ---------------------------------------------------------------
    // TEST 1: Query Embedder
    // ---------------------------------------------------------------
    console.log('▶ TEST 1: Query Preprocessing & Vector Embedding');
    const embedResult = await QueryEmbedder.embedQuery('  How is user authentication implemented?  ');
    assert(embedResult.cleanQuery === 'How is user authentication implemented?', 'Cleaned leading/trailing whitespace');
    assert(Array.isArray(embedResult.embedding) && embedResult.embedding.length === 384, 'Generated 384-dimensional query embedding');

    // ---------------------------------------------------------------
    // TEST 2: Basic RAG Retrieval & Relevance
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 2: Basic RAG Context Retrieval & Relevance');
    const authRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'Where is user login, bcrypt password compare, and jwt sign handled?',
      topK: 5,
      minSimilarity: 0.2
    });

    assert(authRAG.results.length > 0, `Retrieved ${authRAG.results.length} relevant chunks`);
    assert(authRAG.results[0].filePath.includes('auth.controller'), `Top ranked chunk is from auth.controller (${authRAG.results[0].filePath})`);
    assert(authRAG.results[0].score >= 0.40, `Top chunk similarity score is high: ${(authRAG.results[0].score * 100).toFixed(1)}%`);
    assert(authRAG.context.includes('### Repository Context'), 'Context contains structured header');
    assert(authRAG.context.includes('--- File: src/controllers/auth.controller.js ---'), 'Context contains file delimiter');
    assert(authRAG.context.includes('```javascript'), 'Context contains markdown fenced code blocks');
    assert(authRAG.stats.approxTokens > 0, `Context token estimate: ${authRAG.stats.approxTokens} tokens`);

    // ---------------------------------------------------------------
    // TEST 3: Metadata Filtering (Language, ChunkType, FilePath)
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 3: Metadata Filtering');
    
    // Filter by chunkType = FUNCTION
    const funcRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'loginUser and runQuery function',
      minSimilarity: 0.15,
      filters: { chunkType: 'FUNCTION' }
    });
    assert(funcRAG.results.length > 0, `Retrieved ${funcRAG.results.length} chunks matching chunkType filter`);
    assert(funcRAG.results.every(r => r.chunkType === 'FUNCTION'), 'All returned chunks match chunkType=FUNCTION filter');

    // Filter by filePath
    const fileFilterRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'dbPool connection and query execution',
      minSimilarity: 0.15,
      filters: { filePath: 'database.js' }
    });
    assert(fileFilterRAG.results.length > 0, `Retrieved ${fileFilterRAG.results.length} chunks matching filePath filter`);
    assert(fileFilterRAG.results.every(r => r.filePath.includes('database.js')), 'All returned chunks match filePath=database.js filter');

    // ---------------------------------------------------------------
    // TEST 4: Similarity Threshold & Weak Query Handling (No Hallucination)
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 4: Similarity Threshold & Weak Query Handling');
    const weakRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'quantum entanglement teleportation astrophysics wormhole',
      minSimilarity: 0.70 // Strict threshold
    });

    assert(weakRAG.results.length === 0, 'No chunks returned for unrelated query with strict threshold');
    assert(weakRAG.context === '', 'Empty context returned without fabricating code');
    assert(weakRAG.message.includes('No sufficiently relevant'), 'Helpful no-result message returned');

    // ---------------------------------------------------------------
    // TEST 5: Context Deduplication & Overlap Handling
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 5: Context Deduplication & Line Overlap');
    const duplicateChunks = [
      { id: 101, filePath: 'src/auth.js', startLine: 1, endLine: 50, score: 0.9, contentHash: 'hash1' },
      { id: 102, filePath: 'src/auth.js', startLine: 10, endLine: 45, score: 0.85, contentHash: 'hash2' }, // >70% overlap with #101
      { id: 103, filePath: 'src/auth.js', startLine: 60, endLine: 100, score: 0.80, contentHash: 'hash3' }  // Distinct line range
    ];

    const deduplicated = Reranker.process(duplicateChunks, { topK: 5, minSimilarity: 0.1 });
    assert(deduplicated.length === 2, `Deduplicated 3 overlapping chunks to ${deduplicated.length} distinct chunks`);
    assert(deduplicated.some(c => c.id === 101) && deduplicated.some(c => c.id === 103), 'Retained non-overlapping chunks #101 and #103');

    // ---------------------------------------------------------------
    // TEST 6: Neighboring Context Expansion
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 6: Neighboring Context Expansion');
    const neighborRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'loginUser function',
      topK: 1,
      minSimilarity: 0.15,
      includeNeighbors: true
    });

    assert(neighborRAG.results.length >= 1, `Retrieved ${neighborRAG.results.length} chunks with neighbor expansion`);

    // ---------------------------------------------------------------
    // TEST 7: Context Token Budget Enforcement
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 7: Context Token Budget Enforcement');
    const smallBudgetRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'loginUser authentication and database pool query',
      topK: 5,
      minSimilarity: 0.15,
      maxContextTokens: 250 // Budget allows 1 chunk (~214 tokens) but truncates 2nd chunk (~354 tokens total)
    });

    assert(smallBudgetRAG.results.length === 1, `Retrieved exactly ${smallBudgetRAG.results.length} chunk due to budget limit`);
    assert(smallBudgetRAG.stats.approxTokens <= 250, `Context tokens bounded within budget (approx ${smallBudgetRAG.stats.approxTokens} tokens)`);

    // ---------------------------------------------------------------
    // TEST 8: Strict Multi-Tenant & Cross-Repository Isolation
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 8: Multi-Tenant & Cross-Repository Security Isolation');

    // User B tries to retrieve context from Repo A (owned by User A)
    let userBBlocked = false;
    try {
      await ragService.retrieveContext({
        repositoryId: repoA.id,
        userId: userB.id,
        query: 'login user'
      });
    } catch (err) {
      if (err.message.includes('access denied') || err.message.includes('not found')) {
        userBBlocked = true;
      }
    }
    assert(userBBlocked, 'Security: User B cannot access Repo A (access denied)');

    // User A querying Repo A must never retrieve chunks from Repo B
    const userAQuery = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: 'track analytics event'
    });
    assert(!userAQuery.results.some(r => r.filePath.includes('tracker.py')), 'Cross-Repo Isolation: Repo A search never returns Repo B chunks');

    // ---------------------------------------------------------------
    // TEST 9: Error & Resilience Handling
    // ---------------------------------------------------------------
    console.log('\n▶ TEST 9: Error & Resilience Handling');
    const emptyQueryRAG = await ragService.retrieveContext({
      repositoryId: repoA.id,
      userId: userA.id,
      query: '   '
    });
    assert(emptyQueryRAG.results.length === 0 && emptyQueryRAG.context === '', 'Empty string query handled gracefully without error throw');

    let missingParamError = false;
    try {
      await ragService.retrieveContext({
        repositoryId: null,
        userId: userA.id,
        query: 'test'
      });
    } catch {
      missingParamError = true;
    }
    assert(missingParamError, 'Missing repository ID throws clean validation error');

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} M8 RAG TESTS PASSED!`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('💥 M8 Test Suite Failed:', err);
    process.exit(1);
  } finally {
    // Clean up test records
    if (userA && userB) {
      await sql`DELETE FROM users WHERE id IN (${userA.id}, ${userB.id})`;
    }
  }
}

runM8Tests();
