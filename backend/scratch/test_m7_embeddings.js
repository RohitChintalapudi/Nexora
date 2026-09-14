import { getSQL, initDB } from '../src/config/db.js';
import { embeddingProviderFactory } from '../src/ai/embeddings/embedding.provider.factory.js';
import { embeddingService } from '../src/ai/embeddings/embedding.service.js';
import { codeChunker } from '../src/ai/chunking/code-chunker.js';
import { codeChunkModel } from '../src/models/codeChunkModel.js';
import { vectorSearchService } from '../src/ai/search/vector-search.service.js';

async function runM7Tests() {
  console.log('====================================================');
  console.log('🚀 NEXORA — M7: Embeddings + pgvector Test Suite');
  console.log('====================================================\n');

  try {
    await initDB();
    const sql = getSQL();

    // 1. Verify pgvector extension and code_chunks schema
    console.log('Step 1: Verifying pgvector extension & table schema...');
    const extRes = await sql`SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';`;
    if (extRes.length === 0) {
      throw new Error('pgvector extension is not installed!');
    }
    console.log(`✅ pgvector extension active: v${extRes[0].extversion}`);

    const tableRes = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'code_chunks';
    `;
    console.log(`✅ code_chunks table columns (${tableRes.length}):`, tableRes.map(r => `${r.column_name} (${r.udt_name})`).join(', '));

    // 2. Test Embedding Provider (Transformers Local 384-dim)
    console.log('\nStep 2: Testing Local Transformers Embedding Provider...');
    const provider = embeddingProviderFactory.getProvider();
    console.log(`✅ Provider loaded: ${provider.getModelName()}, Target Dimensions: ${provider.getDimension()}`);

    const sampleSnippets = [
      'function authenticateUser(username, password) { const token = jwt.sign({ user }, secret); return token; }',
      'const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 20 });',
      '# NEXORA Architecture\nNexora is an autonomous codebase intelligence platform.'
    ];

    const embeddings = await provider.embedDocuments(sampleSnippets);
    console.log(`✅ Generated ${embeddings.length} embeddings.`);
    console.log(`✅ Sample 1 Embedding Dimension: ${embeddings[0].length}`);
    if (embeddings[0].length !== 384) {
      throw new Error(`Expected dimension 384, got ${embeddings[0].length}`);
    }

    // 3. Test Symbol-Guided Chunking
    console.log('\nStep 3: Testing AST Symbol-Guided & Markdown Chunking...');
    const jsSource = `
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

export class AuthGuard {
  static verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
`;

    const mockSymbols = [
      {
        id: 101,
        name: 'loginUser',
        kind: 'FUNCTION',
        startLine: 5,
        endLine: 13,
        signature: 'async function loginUser(req, res)'
      },
      {
        id: 102,
        name: 'AuthGuard',
        kind: 'CLASS',
        startLine: 15,
        endLine: 19,
        signature: 'class AuthGuard'
      }
    ];

    const jsChunks = codeChunker.chunkFile({
      fileId: 1,
      filePath: 'src/controllers/auth.controller.js',
      content: jsSource,
      language: 'JavaScript',
      symbols: mockSymbols
    });

    console.log(`✅ Code File Chunked into ${jsChunks.length} chunks:`);
    jsChunks.forEach((c, idx) => {
      console.log(`   [Chunk ${idx + 1}] Type: ${c.chunkType} | Lines: ${c.startLine}-${c.endLine} | Hash: ${c.contentHash.substring(0, 10)}... | Symbol: ${c.metadata?.symbolName || 'None'}`);
    });

    // Test Markdown Chunking
    const mdSource = `# NEXORA Documentation
Nexora indexes source code deterministic graphs.

## Vector Search
pgvector enables semantic nearest neighbor queries with HNSW indexing.

## Authentication System
JWT bearer authentication guards all protected API routes.
`;

    const mdChunks = codeChunker.chunkFile({
      fileId: 2,
      filePath: 'README.md',
      content: mdSource,
      language: 'Markdown',
      symbols: []
    });

    console.log(`✅ Markdown File Chunked into ${mdChunks.length} chunks:`);
    mdChunks.forEach((c, idx) => {
      console.log(`   [Chunk ${idx + 1}] Type: ${c.chunkType} | Lines: ${c.startLine}-${c.endLine} | Section: ${c.metadata?.sectionHeader || 'Top'}`);
    });

    // 4. Test pgvector Batch Insertion & Vector Search
    console.log('\nStep 4: Testing PostgreSQL pgvector Batch Insert & Persistence...');
    
    // Create a temporary test repository & user or use existing
    const userRes = await sql`SELECT id FROM users LIMIT 1;`;
    if (userRes.length === 0) {
      throw new Error('No user found in database to test with.');
    }
    const testUserId = userRes[0].id;

    // Check or create a test repository
    let repoRes = await sql`SELECT id FROM repositories WHERE user_id = ${testUserId} LIMIT 1;`;
    let testRepoId;
    if (repoRes.length === 0) {
      const newRepo = await sql`
        INSERT INTO repositories (user_id, github_repository_id, name, full_name, private)
        VALUES (${testUserId}, '999999', 'test-m7-repo', 'nexora/test-m7-repo', false) 
        RETURNING id;
      `;
      testRepoId = newRepo[0].id;
    } else {
      testRepoId = repoRes[0].id;
    }
    console.log(`✅ Using Test User ID: ${testUserId}, Repo ID: ${testRepoId}`);

    // Clean any prior test chunks, symbols, and files for this repo
    await codeChunkModel.deleteByRepositoryId(testRepoId, testUserId);
    await sql`DELETE FROM symbols WHERE repository_id = ${testRepoId};`;
    await sql`DELETE FROM repository_files WHERE repository_id = ${testRepoId};`;

    // Create real repository_files records to satisfy foreign key
    const file1Res = await sql`
      INSERT INTO repository_files (repository_id, user_id, path, name, extension, language, size_bytes, content)
      VALUES (${testRepoId}, ${testUserId}, 'src/controllers/auth.controller.js', 'auth.controller.js', '.js', 'JavaScript', ${jsSource.length}, ${jsSource})
      RETURNING id;
    `;
    const realFile1Id = file1Res[0].id;

    const file2Res = await sql`
      INSERT INTO repository_files (repository_id, user_id, path, name, extension, language, size_bytes, content)
      VALUES (${testRepoId}, ${testUserId}, 'README.md', 'README.md', '.md', 'Markdown', ${mdSource.length}, ${mdSource})
      RETURNING id;
    `;
    const realFile2Id = file2Res[0].id;

    // Insert real symbols into symbols table to satisfy foreign key
    const sym1Res = await sql`
      INSERT INTO symbols (repository_id, user_id, file_id, name, type, language, line_start, line_end, is_exported)
      VALUES (${testRepoId}, ${testUserId}, ${realFile1Id}, 'loginUser', 'FUNCTION', 'JavaScript', 5, 13, true)
      RETURNING id;
    `;
    const realSym1Id = sym1Res[0].id;

    const sym2Res = await sql`
      INSERT INTO symbols (repository_id, user_id, file_id, name, type, language, line_start, line_end, is_exported)
      VALUES (${testRepoId}, ${testUserId}, ${realFile1Id}, 'AuthGuard', 'CLASS', 'JavaScript', 15, 19, true)
      RETURNING id;
    `;
    const realSym2Id = sym2Res[0].id;

    // Chunk files with real file & symbol IDs
    const jsChunksWithRealId = codeChunker.chunkFile({
      fileId: realFile1Id,
      filePath: 'src/controllers/auth.controller.js',
      content: jsSource,
      language: 'JavaScript',
      symbols: [
        { id: realSym1Id, name: 'loginUser', kind: 'FUNCTION', startLine: 5, endLine: 13, fileId: realFile1Id },
        { id: realSym2Id, name: 'AuthGuard', kind: 'CLASS', startLine: 15, endLine: 19, fileId: realFile1Id }
      ]
    });

    const mdChunksWithRealId = codeChunker.chunkFile({
      fileId: realFile2Id,
      filePath: 'README.md',
      content: mdSource,
      language: 'Markdown',
      symbols: []
    });

    // Combine chunks
    const allChunks = [...jsChunksWithRealId, ...mdChunksWithRealId];
    const chunkTexts = allChunks.map(c => c.content);

    console.log(`Generating embeddings for ${allChunks.length} chunks...`);
    const chunkEmbeddings = await embeddingService.generateEmbeddings(chunkTexts);

    const chunksToInsert = allChunks.map((c, idx) => ({
      ...c,
      repositoryId: testRepoId,
      embedding: chunkEmbeddings[idx]
    }));

    const insertedCount = await codeChunkModel.batchInsert(testRepoId, testUserId, chunksToInsert);
    console.log(`✅ Successfully inserted ${insertedCount} vector chunks into code_chunks!`);

    // 5. Test Semantic Vector Similarity Search
    console.log('\nStep 5: Testing Semantic Vector Similarity Search...');
    
    const query1 = 'How does login and JWT token authentication work?';
    console.log(`🔎 Query 1: "${query1}"`);
    const results1 = await vectorSearchService.searchSimilar({
      repositoryId: testRepoId,
      userId: testUserId,
      queryText: query1,
      limit: 3,
      minSimilarity: 0.1
    });

    console.log(`Found ${results1.length} matches:`);
    results1.forEach((r, i) => {
      console.log(`   [Match ${i + 1}] Similarity: ${(r.similarity * 100).toFixed(2)}% | File: ${r.filePath} (${r.chunkType}) | Lines: ${r.startLine}-${r.endLine}`);
      console.log(`   Preview: "${r.content.replace(/\n/g, ' ').substring(0, 90)}..."`);
    });

    if (results1.length === 0 || !results1[0].filePath.includes('auth')) {
      console.warn('⚠️ Warning: Expected auth controller to be top match for query 1.');
    } else {
      console.log('✅ Top match correctly retrieved auth chunk!');
    }

    const query2 = 'pgvector HNSW nearest neighbor indexing';
    console.log(`\n🔎 Query 2: "${query2}"`);
    const results2 = await vectorSearchService.searchSimilar({
      repositoryId: testRepoId,
      userId: testUserId,
      queryText: query2,
      limit: 3,
      minSimilarity: 0.1
    });

    console.log(`Found ${results2.length} matches:`);
    results2.forEach((r, i) => {
      console.log(`   [Match ${i + 1}] Similarity: ${(r.similarity * 100).toFixed(2)}% | File: ${r.filePath} (${r.chunkType}) | Section: ${r.metadata?.sectionHeading || '-'}`);
    });

    // 6. Test Multi-Tenant & Cross-Repo Isolation
    console.log('\nStep 6: Testing Strict Multi-Tenant & Cross-Repository Isolation...');
    
    let unauthorizedBlocked = false;
    try {
      await vectorSearchService.searchSimilar({
        repositoryId: testRepoId,
        userId: 9999999, // Unauthorized user ID
        queryText: query1,
        limit: 5
      });
    } catch (err) {
      if (err.message.includes('access denied') || err.message.includes('not found')) {
        unauthorizedBlocked = true;
      }
    }
    if (!unauthorizedBlocked) {
      throw new Error('Expected unauthorized user query to be blocked!');
    }
    console.log('✅ Query with non-owner User ID correctly blocked with access denial.');

    let foreignRepoBlocked = false;
    try {
      await vectorSearchService.searchSimilar({
        repositoryId: 9999999, // Non-existent repository ID
        userId: testUserId,
        queryText: query1,
        limit: 5
      });
    } catch (err) {
      if (err.message.includes('access denied') || err.message.includes('not found')) {
        foreignRepoBlocked = true;
      }
    }
    if (!foreignRepoBlocked) {
      throw new Error('Expected foreign repository query to be blocked!');
    }
    console.log('✅ Query with foreign Repository ID correctly blocked with access denial.');

    // Also verify CodeChunkModel.searchSimilar SQL layer isolation directly
    const directSqlIsolation = await codeChunkModel.searchSimilar({
      repositoryId: testRepoId,
      userId: 9999999,
      queryEmbedding: chunkEmbeddings[0],
      limit: 5
    });
    console.log(`✅ Direct SQL layer query with non-owner User ID returned: ${directSqlIsolation.length} rows.`);
    if (directSqlIsolation.length !== 0) {
      throw new Error('Expected 0 rows from direct SQL search for non-owner user!');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL M7 EMBEDDINGS & PGVECTOR TESTS PASSED!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ M7 Test Failed:', err);
    process.exit(1);
  }
}

runM7Tests();
