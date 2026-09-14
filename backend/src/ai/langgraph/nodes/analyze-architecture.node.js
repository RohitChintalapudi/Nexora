import { getAIProvider } from '../../providers/index.js';
import { buildArchitecturePrompt } from '../../prompts/index.js';

/**
 * Node 4: Analyze Architecture & Structural Patterns
 */
export async function analyzeArchitectureNode(state) {
  const { codebaseFacts, retrievedContext, jobId } = state;
  console.log(`🏛️ [LangGraph:analyzeArchitecture] Analyzing architectural design & layers`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'ANALYZING_ARCHITECTURE' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const aiProvider = getAIProvider();
    const prompt = buildArchitecturePrompt({
      codebaseFacts,
      retrievedContext: retrievedContext?.architectureContext || ''
    });

    const result = await aiProvider.generateJSON({
      systemPrompt: 'You are a principal software architect analyzing codebase structure. Always return valid JSON adhering strictly to the schema.',
      userPrompt: prompt,
      temperature: 0.1
    });

    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateArchitecture(
      result,
      codebaseFacts
    );

    return {
      architecture: validated
    };
  } catch (err) {
    console.error(`❌ [LangGraph:analyzeArchitecture] Error analyzing architecture:`, err);
    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateArchitecture(
      null,
      codebaseFacts
    );
    return {
      architecture: validated,
      errors: [`analyzeArchitecture: ${err.message}`]
    };
  }
}
