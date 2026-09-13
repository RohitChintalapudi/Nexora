import { CodeChunker } from '../chunking/code-chunker.js';
import { EmbeddingService } from '../embeddings/embedding.service.js';
import { CodeChunkModel } from '../../models/codeChunkModel.js';
import { SymbolModel } from '../../models/symbolModel.js';
import { RepositoryFileModel } from '../../models/repositoryFileModel.js';

export class SemanticIndexingService {
  /**
   * Run the complete M7 semantic chunking, embedding generation, and pgvector persistence pipeline
   * @param {Object} params
   * @param {number|string} params.repositoryId
   * @param {number|string} params.userId
   * @param {Array<Object>} [params.files] - Loaded files with content
   * @param {Array<Object>} [params.symbols] - Extracted symbols
   * @param {Function} [params.onStageChange] - Stage notification callback
   * @returns {Promise<Object>} Indexing summary { chunksCount, embeddingsCount }
   */
  static async indexRepository({
    repositoryId,
    userId,
    files = null,
    symbols = null,
    onStageChange = () => {}
  }) {
    console.log(`📦 [SemanticIndexing] Starting semantic vector indexing for repo #${repositoryId}, user #${userId}`);

    // 1. Stage: CHUNKING_FILES
    await onStageChange('CHUNKING_FILES');

    let repoFiles = files;
    if (!repoFiles || repoFiles.some(f => !f.isIgnored && !f.isBinary && f.content === undefined)) {
      repoFiles = await RepositoryFileModel.findByRepositoryId(repositoryId, userId, { includeContent: true });
    }

    let repoSymbols = symbols;
    if (!repoSymbols) {
      repoSymbols = await SymbolModel.findByRepositoryId(repositoryId, userId);
    }

    const chunks = CodeChunker.chunkRepository({
      repositoryId,
      repositoryFiles: repoFiles,
      symbols: repoSymbols
    });

    console.log(`✂️ [SemanticIndexing] Generated ${chunks.length} semantic chunks across ${repoFiles.length} repository files.`);

    if (chunks.length === 0) {
      console.warn(`⚠️ [SemanticIndexing] No indexable source files found in repo #${repositoryId}.`);
      return { chunksCount: 0, embeddingsCount: 0 };
    }

    // 2. Stage: GENERATING_EMBEDDINGS
    await onStageChange('GENERATING_EMBEDDINGS');

    const embeddedChunks = await EmbeddingService.generateChunkEmbeddings(chunks, {
      onProgress: (done, total) => {
        if (done % 50 === 0 || done === total) {
          console.log(`⚡ [SemanticIndexing] Embedded ${done}/${total} chunks...`);
        }
      }
    });

    // 3. Stage: STORING_EMBEDDINGS (PostgreSQL + pgvector)
    await onStageChange('STORING_EMBEDDINGS');

    // Clean previous chunks for clean idempotency
    await CodeChunkModel.deleteByRepositoryId(repositoryId, userId);

    const insertedCount = await CodeChunkModel.batchInsert(repositoryId, userId, embeddedChunks);

    console.log(`💾 [SemanticIndexing] Persisted ${insertedCount} vector embeddings in PostgreSQL (pgvector).`);

    // 4. Stage: INDEXING_COMPLETE
    await onStageChange('INDEXING_COMPLETE');

    return {
      chunksCount: chunks.length,
      embeddingsCount: insertedCount
    };
  }
}
