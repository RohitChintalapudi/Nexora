import { RepositoryModel } from '../models/repositoryModel.js';
import { RepositoryAnalysisModel } from '../models/repositoryAnalysisModel.js';
import { RAGService } from '../ai/rag/rag.service.js';
import { groqProvider } from '../ai/providers/groq.provider.js';
import { getSQL } from '../config/db.js';

/**
 * Controller for interactive AI Repository Chat & Q&A
 */
export const chatController = {
  /**
   * Handle user query about a repository with maximum accuracy and table-ready formatting
   * POST /api/repositories/:repositoryId/chat
   */
  async askQuestion(req, res) {
    const startTime = Date.now();
    try {
      const { repositoryId } = req.params;
      const { message, history = [] } = req.body;

      if (!repositoryId || isNaN(Number(repositoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid repository ID is required.'
        });
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Question message cannot be empty.'
        });
      }

      // 1. Strict multi-tenant authorization
      const repository = await RepositoryModel.findByIdAndUserId(repositoryId, req.user.id);
      if (!repository) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied.'
        });
      }

      // 2. Fetch structured analysis summary
      const analysisRecord = await RepositoryAnalysisModel.findByRepositoryId(repositoryId, req.user.id);

      // 3. Perform RAG vector similarity search and context assembly
      const ragResult = await RAGService.retrieveContext({
        repositoryId,
        userId: req.user.id,
        query: message.trim(),
        topK: 8,
        minSimilarity: 0.18,
        maxContextTokens: 3800
      });

      // 4. Exact AST symbol keyword retrieval to guarantee 100% symbol accuracy
      let symbolFacts = [];
      try {
        const sql = getSQL();
        if (sql) {
          const words = message
            .trim()
            .split(/[\s,()]+/)
            .filter(w => w.length >= 3 && /^[a-zA-Z0-9_$.-]+$/.test(w))
            .slice(0, 5);

          if (words.length > 0) {
            const conditions = words.map(w => sql`s.name ILIKE ${'%' + w + '%'}`);
            symbolFacts = await sql`
              SELECT s.name, s.type, s.line_start, s.line_end, f.path as file_path
              FROM symbols s
              JOIN repository_files f ON s.file_id = f.id
              WHERE s.repository_id = ${repositoryId}
                AND s.user_id = ${req.user.id}
                AND (${sql.join(conditions, sql` OR `)})
              LIMIT 15;
            `;
          }
        }
      } catch (e) {
        // Non-fatal AST match fallback
      }

      // 5. Construct high-fidelity system prompt grounded in repository evidence
      let systemPrompt = `You are NEXORA AI, the principal codebase architect and intelligence assistant for "${repository.name}".
Your goal is to answer developer questions with maximum accuracy, clarity, and beautiful formatting.

REPOSITORY GROUND TRUTH:
- Name: ${repository.name} (${repository.full_name || repository.name})
- Primary Language: ${repository.language || 'Multi-language'}
- Default Branch: ${repository.default_branch || 'main'}
- Description: ${repository.description || 'No description provided.'}
`;

      if (analysisRecord) {
        systemPrompt += `
STRUCTURED ARCHITECTURAL OVERVIEW:
${analysisRecord.overview || ''}

DETECTED MODULES & FLOW:
${Array.isArray(analysisRecord.modules) ? analysisRecord.modules.map(m => `- ${m.name}: ${m.purpose || m.description || ''} (Files: ${(m.keyFiles || []).join(', ')})`).join('\n') : ''}

DATABASE STRUCTURE:
Type: ${analysisRecord.database?.type || 'Not detected'}
Models: ${Array.isArray(analysisRecord.database?.models) ? analysisRecord.database.models.join(', ') : 'None'}

API ROUTES:
${Array.isArray(analysisRecord.api_structure) ? analysisRecord.api_structure.map(r => `- ${r.method} ${r.path} -> ${r.handler || 'Controller'} (${r.filePath || ''})`).slice(0, 15).join('\n') : 'No routes listed'}
`;
      }

      if (symbolFacts.length > 0) {
        systemPrompt += `
VERIFIED AST SYMBOL DEFINITIONS:
${symbolFacts.map(s => `- ${s.type} \`${s.name}\` defined in \`${s.file_path}:${s.line_start}-${s.line_end}\``).join('\n')}
`;
      }

      if (ragResult.context && ragResult.context.trim()) {
        systemPrompt += `
RETRIEVED CODE CHUNKS & SOURCE IMPLEMENTATION:
${ragResult.context}
`;
      }

      systemPrompt += `
FORMATTING & ACCURACY RULES:
1. Grounded Accuracy: Answer based strictly on the verified repository facts, symbols, routes, and source code above. Never invent unproven files or endpoints.
2. Markdown Tables: Whenever comparing items, listing routes, breaking down components, explaining file roles, or listing database schemas/parameters, USE CLEAN MARKDOWN TABLES with column headers (e.g., | Component | File Path | Responsibility |).
3. Clear Headings: Structure responses logically using \`###\` section headings.
4. Step-by-Step Explanations: Use numbered lists (\`1.\`, \`2.\`, \`3.\`) for execution flows, lifecycles, and processes.
5. Code Blocks: Format code blocks with specific language tags (\`\`\`typescript, \`\`\`javascript, \`\`\`sql, etc.).
6. Clickable File Citations: Always cite files using backticks and exact paths (e.g. \`src/controllers/authController.js\` or \`backend/src/server.js:L10-25\`).
7. Professional Polish: Make the response developer-friendly, concise, insightful, and visually structured.
`;

      // 6. Format conversation messages with bounded history (last 6 turns)
      const cleanHistory = Array.isArray(history)
        ? history
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-6)
            .map(m => ({ role: m.role, content: m.content.trim() }))
        : [];

      const messages = [
        ...cleanHistory,
        { role: 'user', content: message.trim() }
      ];

      // 7. Invoke Groq conversational LLM
      const answer = await groqProvider.generateChat({
        messages,
        systemPrompt,
        temperature: 0.15,
        maxTokens: 2500
      });

      // 8. Collect extracted citations from retrieved chunks and symbols
      const citations = [
        ...(ragResult.results || []).map(r => ({
          filePath: r.filePath,
          chunkType: r.chunkType,
          startLine: r.startLine,
          endLine: r.endLine,
          similarity: r.similarity
        })),
        ...symbolFacts.map(s => ({
          filePath: s.file_path,
          chunkType: s.type,
          startLine: s.line_start,
          endLine: s.line_end,
          similarity: 1.0
        }))
      ].filter((v, i, arr) => arr.findIndex(x => x.filePath === v.filePath) === i);

      const latencyMs = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        answer,
        citations,
        stats: {
          chunksUsed: ragResult.results ? ragResult.results.length : 0,
          symbolsMatched: symbolFacts.length,
          approxTokens: ragResult.stats ? ragResult.stats.approxTokens : 0,
          latencyMs
        }
      });
    } catch (error) {
      console.error('❌ [chatController:askQuestion] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to process repository question'
      });
    }
  }
};

export default chatController;
