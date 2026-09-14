import { getAIProvider } from '../../providers/index.js';
import { buildSummaryPrompt } from '../../prompts/index.js';

/**
 * Node 7: Generate Cohesive Summary & Developer Quickstart
 */
export async function generateSummaryNode(state) {
  const { repository, codebaseFacts, technologies, architecture, modules, applicationFlow, jobId } = state;
  console.log(`📝 [LangGraph:generateSummary] Generating executive developer overview and quickstart`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'GENERATING_SUMMARY' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const aiProvider = getAIProvider();
    const prompt = buildSummaryPrompt({
      repository,
      technologyStack: technologies?.technologyStack || [],
      architecture,
      modules,
      applicationFlow,
      codebaseFacts
    });

    const result = await aiProvider.generateJSON({
      systemPrompt: 'You are a lead software architect creating developer documentation and architectural summaries. Always return valid JSON adhering strictly to the schema.',
      userPrompt: prompt,
      temperature: 0.1
    });

    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateSummary(
      result,
      codebaseFacts
    );

    return {
      summary: validated
    };
  } catch (err) {
    console.error(`❌ [LangGraph:generateSummary] Error generating summary:`, err);
    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateSummary(
      null,
      codebaseFacts
    );
    return {
      summary: validated,
      errors: [`generateSummary: ${err.message}`]
    };
  }
}
