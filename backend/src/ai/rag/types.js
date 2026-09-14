/**
 * @typedef {Object} MetadataFilters
 * @property {string} [language] - e.g. "TypeScript", "Python"
 * @property {string} [chunkType] - e.g. "FUNCTION", "CLASS", "DOCUMENTATION"
 * @property {string} [filePath] - exact file path or substring pattern
 * @property {number} [fileId] - specific repository file ID
 * @property {string} [symbolName] - symbol name
 */

/**
 * @typedef {Object} RetrievalOptions
 * @property {number|string} repositoryId - Target repository ID (required)
 * @property {number|string} userId - Authenticated user ID (required)
 * @property {string} query - Natural language or technical code query (required)
 * @property {number} [topK=8] - Number of top chunks to retrieve
 * @property {number} [minSimilarity=0.25] - Minimum cosine similarity threshold (0.0 to 1.0)
 * @property {MetadataFilters} [filters] - Optional metadata filters
 * @property {boolean} [includeNeighbors=false] - Whether to expand adjacent chunks in the same file
 * @property {number} [maxNeighbors=1] - Maximum neighboring chunks per retrieved chunk
 * @property {number} [maxContextTokens=4000] - Budget limit for final LLM context in tokens (~4 chars/token)
 */

/**
 * @typedef {Object} RetrievalResult
 * @property {number} chunkId
 * @property {number} repositoryId
 * @property {number} fileId
 * @property {string} filePath
 * @property {string} content
 * @property {string} [language]
 * @property {string} [chunkType]
 * @property {string} [symbolName]
 * @property {number} [startLine]
 * @property {number} [endLine]
 * @property {number} score - Cosine similarity score (0.0 to 1.0)
 * @property {boolean} [isNeighbor] - Flag if this chunk was included as a neighboring context
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} RAGContextResult
 * @property {string} query - Cleaned query string
 * @property {number} repositoryId - Repository ID
 * @property {string} repositoryName - Repository name
 * @property {RetrievalResult[]} results - Ranked, deduplicated matching chunks
 * @property {string} context - LLM-ready markdown formatted context
 * @property {Object} stats - Telemetry statistics
 * @property {number} stats.totalRetrieved - Raw chunks returned before deduplication
 * @property {number} stats.finalCount - Final chunks included in context
 * @property {number} stats.approxTokens - Approximate token count of generated context
 * @property {number} stats.latencyMs - Total retrieval and context assembly latency
 * @property {string} [message] - Information message (e.g. when no chunks meet threshold)
 */

export const RAGDefaults = {
  TOP_K: parseInt(process.env.RAG_TOP_K || '6', 10),
  MIN_SIMILARITY: parseFloat(process.env.RAG_MIN_SIMILARITY || '0.25'),
  MAX_CONTEXT_TOKENS: parseInt(process.env.RAG_MAX_CONTEXT_TOKENS || '1500', 10),
  MAX_NEIGHBORS: 1
};
