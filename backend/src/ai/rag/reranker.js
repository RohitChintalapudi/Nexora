export class Reranker {
  /**
   * Filter, deduplicate, and rank retrieved chunks
   * @param {Array<Object>} chunks - Raw retrieved chunks
   * @param {Object} options
   * @param {number} [options.topK=8] - Max chunks to return
   * @param {number} [options.minSimilarity=0.25] - Minimum cosine similarity threshold
   * @returns {Array<Object>} Deduplicated, ranked chunks
   */
  static process(chunks = [], options = {}) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return [];
    }

    const { topK = 8, minSimilarity = 0.25 } = options;

    // 1. Filter by minimum similarity threshold
    const filtered = chunks.filter((c) => {
      const score = typeof c.score === 'number' ? c.score : (c.similarity || 0);
      return score >= minSimilarity;
    });

    if (filtered.length === 0) {
      return [];
    }

    // 2. Sort by similarity score descending
    const sorted = [...filtered].sort((a, b) => {
      const scoreA = typeof a.score === 'number' ? a.score : (a.similarity || 0);
      const scoreB = typeof b.score === 'number' ? b.score : (b.similarity || 0);
      return scoreB - scoreA;
    });

    // 3. Deduplicate by chunk ID and content hash
    const seenHashes = new Set();
    const seenIds = new Set();
    const uniqueChunks = [];

    for (const chunk of sorted) {
      const idKey = chunk.chunkId || chunk.id;
      const hashKey = chunk.content_hash || chunk.contentHash;

      if (idKey && seenIds.has(idKey)) continue;
      if (hashKey && seenHashes.has(hashKey)) continue;

      if (idKey) seenIds.add(idKey);
      if (hashKey) seenHashes.add(hashKey);

      uniqueChunks.push(chunk);
    }

    // 4. Deduplicate overlapping line intervals within the same file
    const deduplicated = this.deduplicateOverlappingLines(uniqueChunks);

    // 5. Slice to topK
    return deduplicated.slice(0, topK);
  }

  /**
   * Remove chunks that significantly overlap with already selected chunks from the same file
   * @param {Array<Object>} chunks - Sorted by score descending
   * @returns {Array<Object>}
   */
  static deduplicateOverlappingLines(chunks) {
    const acceptedByFile = new Map();
    const result = [];

    for (const chunk of chunks) {
      const filePath = chunk.filePath || chunk.file_path;
      const start = chunk.startLine || chunk.start_line;
      const end = chunk.endLine || chunk.end_line;

      // If no line range metadata exists, accept chunk directly
      if (!filePath || typeof start !== 'number' || typeof end !== 'number') {
        result.push(chunk);
        continue;
      }

      if (!acceptedByFile.has(filePath)) {
        acceptedByFile.set(filePath, []);
      }

      const existingRanges = acceptedByFile.get(filePath);

      // Check if current chunk heavily overlaps with any accepted chunk (>70% overlap)
      let isRedundant = false;
      for (const range of existingRanges) {
        const overlapStart = Math.max(start, range.start);
        const overlapEnd = Math.min(end, range.end);

        if (overlapEnd > overlapStart) {
          const overlapLength = overlapEnd - overlapStart + 1;
          const currentLength = end - start + 1;
          const overlapRatio = overlapLength / Math.max(1, currentLength);

          if (overlapRatio > 0.70) {
            isRedundant = true;
            break;
          }
        }
      }

      if (!isRedundant) {
        existingRanges.push({ start, end });
        result.push(chunk);
      }
    }

    return result;
  }
}

export const reranker = Reranker;
export default Reranker;
