import { RepositoryModel } from '../models/repositoryModel.js';
import { RepositoryAnalysisModel } from '../models/repositoryAnalysisModel.js';
import { RAGService } from '../ai/rag/rag.service.js';
import { groqProvider } from '../ai/providers/groq.provider.js';

/**
 * Controller for interactive AI Repository Chat & Q&A
 */
export const chatController = {
  /**
   * Handle user query about a repository
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

      // 2. Fetch structured analysis summary if available
      const analysisRecord = await RepositoryAnalysisModel.findByRepositoryId(repositoryId, req.user.id);

      // 3. Perform RAG vector similarity search and context assembly
      const ragResult = await RAGService.retrieveContext({
        repositoryId,
        userId: req.user.id,
        query: message.trim(),
        topK: 6,
        minSimilarity: 0.2,
        maxContextTokens: 3500
      });

      // 4. Construct high-fidelity system prompt grounded in repository evidence
      let systemPrompt = `You are NEXORA AI, the principal codebase intelligence assistant for the repository "${repository.name}".
Your goal is to answer developer questions with maximum accuracy, clarity, and evidence grounding.

REPOSITORY FACTS:
- Repository Name: ${repository.name} (${repository.full_name || repository.name})
- Primary Language: ${repository.language || 'Multi-language'}
- Default Branch: ${repository.default_branch || 'main'}
- Description: ${repository.description || 'No description provided.'}
`;

      if (analysisRecord) {
        systemPrompt += `
STRUCTURED ARCHITECTURAL OVERVIEW:
${analysisRecord.overview || 'Overview not generated yet.'}

TECHNOLOGY STACK SUMMARY:
${Array.isArray(analysisRecord.technology_stack) ? analysisRecord.technology_stack.map(t => `${t.name} (${t.category}): ${t.purpose || ''}`).slice(0, 8).join('\n') : 'Not available'}
`;
      }

      if (ragResult.context && ragResult.context.trim()) {
        systemPrompt += `
RETRIEVED CODE CONTEXT & SYMBOLS (Ground Truth Evidence):
${ragResult.context}
`;
      }

      systemPrompt += `
INSTRUCTIONS FOR ACCURATE RESPONSES:
1. Always base your answer strictly on the provided repository code, symbols, and architecture.
2. If the user asks about how a feature works, explain the step-by-step execution flow, mentioning the exact files, functions, classes, and routes involved.
3. Whenever you reference a file, cite it clearly in markdown format (e.g., \`src/auth/auth.service.js\` or \`backend/src/server.js:L10-25\`).
4. Include clean code snippets when demonstrating how functions or configurations work.
5. If the user asks something not present in the repository, state clearly that it is not in the codebase rather than hallucinating.
6. Format your response cleanly using markdown (headings, bold text, code blocks, bullet points).
`;

      // 5. Format conversation messages with bounded history (last 6 turns)
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

      // 6. Invoke Groq conversational LLM
      const answer = await groqProvider.generateChat({
        messages,
        systemPrompt,
        temperature: 0.2,
        maxTokens: 2048
      });

      // 7. Collect extracted citations from retrieved chunks
      const citations = (ragResult.results || []).map(r => ({
        filePath: r.filePath,
        chunkType: r.chunkType,
        startLine: r.startLine,
        endLine: r.endLine,
        similarity: r.similarity
      }));

      const latencyMs = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        answer,
        citations,
        stats: {
          chunksUsed: ragResult.results ? ragResult.results.length : 0,
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
