import { getSQL } from '../config/db.js';

export const CodeChunkModel = {
  /**
   * Delete all existing code chunks for a repository (enforces clean idempotency)
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async deleteByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const deleted = await sql`
      DELETE FROM code_chunks
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      RETURNING id;
    `;
    return deleted.length;
  },

  /**
   * Batch insert code chunks with pgvector embeddings
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Array<Object>} chunks
   * @returns {Promise<number>}
   */
  async batchInsert(repositoryId, userId, chunks) {
    if (!chunks || chunks.length === 0) return 0;
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      for (const chunk of batch) {
        const embeddingStr = Array.isArray(chunk.embedding) 
          ? `[${chunk.embedding.join(',')}]` 
          : null;
        const metaJson = JSON.stringify(chunk.metadata || {});

        if (embeddingStr) {
          await sql`
            INSERT INTO code_chunks (
              repository_id,
              user_id,
              file_id,
              symbol_id,
              chunk_index,
              content,
              content_hash,
              chunk_type,
              language,
              file_path,
              start_line,
              end_line,
              embedding,
              metadata,
              created_at,
              updated_at
            )
            VALUES (
              ${repositoryId},
              ${userId},
              ${chunk.fileId},
              ${chunk.symbolId || null},
              ${chunk.chunkIndex},
              ${chunk.content},
              ${chunk.contentHash},
              ${chunk.chunkType},
              ${chunk.language || null},
              ${chunk.filePath},
              ${chunk.startLine || null},
              ${chunk.endLine || null},
              ${embeddingStr}::vector,
              ${metaJson}::jsonb,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            );
          `;
        } else {
          await sql`
            INSERT INTO code_chunks (
              repository_id,
              user_id,
              file_id,
              symbol_id,
              chunk_index,
              content,
              content_hash,
              chunk_type,
              language,
              file_path,
              start_line,
              end_line,
              metadata,
              created_at,
              updated_at
            )
            VALUES (
              ${repositoryId},
              ${userId},
              ${chunk.fileId},
              ${chunk.symbolId || null},
              ${chunk.chunkIndex},
              ${chunk.content},
              ${chunk.contentHash},
              ${chunk.chunkType},
              ${chunk.language || null},
              ${chunk.filePath},
              ${chunk.startLine || null},
              ${chunk.endLine || null},
              ${metaJson}::jsonb,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            );
          `;
        }
        totalInserted++;
      }
    }

    return totalInserted;
  },

  /**
   * Perform vector similarity search strictly isolated to the authenticated user and repository
   * @param {Object} params
   * @param {number|string} params.repositoryId
   * @param {number|string} params.userId
   * @param {Array<number>} params.queryEmbedding - Vector embedding array
   * @param {number} [params.limit=10]
   * @param {number} [params.minSimilarity=0.0]
   * @param {Object} [params.filters={}] - Optional metadata filters (language, chunkType, filePath, fileId)
   * @returns {Promise<Array>}
   */
  async searchSimilar({ 
    repositoryId, 
    userId, 
    queryEmbedding, 
    limit = 10, 
    minSimilarity = 0.0,
    filters = {}
  }) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new Error('Valid query embedding vector required for vector search.');
    }

    const vectorStr = `[${queryEmbedding.join(',')}]`;
    const language = filters.language || null;
    const chunkType = filters.chunkType || null;
    const filePath = filters.filePath || null;
    const fileId = filters.fileId || null;

    // Strictly isolated: WHERE repository_id = $1 AND user_id = $2
    const rows = await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        file_id,
        symbol_id,
        chunk_index,
        content,
        content_hash,
        chunk_type,
        language,
        file_path,
        start_line,
        end_line,
        metadata,
        1 - (embedding <=> ${vectorStr}::vector) AS similarity
      FROM code_chunks
      WHERE repository_id = ${repositoryId} 
        AND user_id = ${userId}
        AND embedding IS NOT NULL
        AND (${language}::text IS NULL OR LOWER(language) = LOWER(${language}))
        AND (${chunkType}::text IS NULL OR UPPER(chunk_type) = UPPER(${chunkType}))
        AND (${filePath}::text IS NULL OR file_path ILIKE ${'%' + (filePath || '') + '%'})
        AND (${fileId}::int IS NULL OR file_id = ${fileId})
      ORDER BY embedding <=> ${vectorStr}::vector ASC
      LIMIT ${limit};
    `;

    return rows.filter(r => (r.similarity || 0) >= minSimilarity);
  },

  /**
   * Fetch neighboring chunks within the same file to provide localized surrounding context
   * @param {Object} params
   * @param {number|string} params.repositoryId
   * @param {number|string} params.userId
   * @param {number|string} params.fileId
   * @param {number[]} params.chunkIndices
   * @returns {Promise<Array>}
   */
  async fetchNeighborChunks({ repositoryId, userId, fileId, chunkIndices = [] }) {
    if (!chunkIndices || chunkIndices.length === 0) return [];
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const rows = await sql`
      SELECT 
        id,
        repository_id,
        user_id,
        file_id,
        symbol_id,
        chunk_index,
        content,
        content_hash,
        chunk_type,
        language,
        file_path,
        start_line,
        end_line,
        metadata
      FROM code_chunks
      WHERE repository_id = ${repositoryId}
        AND user_id = ${userId}
        AND file_id = ${fileId}
        AND chunk_index = ANY(${chunkIndices})
      ORDER BY chunk_index ASC;
    `;
    return rows;
  },

  /**
   * Find code chunks by repository ID with strict multi-tenant authorization
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @param {Object} [filter]
   * @returns {Promise<Array>}
   */
  async findByRepositoryId(repositoryId, userId, filter = {}) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const fileId = filter.fileId;
    if (fileId) {
      return await sql`
        SELECT 
          id, repository_id, user_id, file_id, symbol_id, chunk_index,
          content, content_hash, chunk_type, language, file_path,
          start_line, end_line, metadata, created_at, updated_at
        FROM code_chunks
        WHERE repository_id = ${repositoryId} AND user_id = ${userId} AND file_id = ${fileId}
        ORDER BY chunk_index ASC;
      `;
    }

    return await sql`
      SELECT 
        id, repository_id, user_id, file_id, symbol_id, chunk_index,
        content, content_hash, chunk_type, language, file_path,
        start_line, end_line, metadata, created_at, updated_at
      FROM code_chunks
      WHERE repository_id = ${repositoryId} AND user_id = ${userId}
      ORDER BY file_path ASC, chunk_index ASC;
    `;
  },

  /**
   * Count chunks for a repository
   * @param {number|string} repositoryId
   * @param {number|string} userId
   * @returns {Promise<number>}
   */
  async countByRepositoryId(repositoryId, userId) {
    const sql = getSQL();
    if (!sql) throw new Error('Database not connected. Please check DATABASE_URL.');

    const result = await sql`
      SELECT COUNT(*)::int as count
      FROM code_chunks
      WHERE repository_id = ${repositoryId} AND user_id = ${userId};
    `;
    return result[0]?.count || 0;
  }
};

export { CodeChunkModel as codeChunkModel };
export default CodeChunkModel;
