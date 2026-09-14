import { getAIProvider } from '../../providers/index.js';
import { buildFlowPrompt } from '../../prompts/index.js';

/**
 * Node 6: Analyze End-to-End Application & Request Flow
 */
export async function analyzeFlowNode(state) {
  const { codebaseFacts, retrievedContext, jobId } = state;
  console.log(`🔄 [LangGraph:analyzeFlow] Tracing application execution lifecycle & request flow`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'ANALYZING_APPLICATION_FLOW' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const aiProvider = getAIProvider();
    const prompt = buildFlowPrompt({
      codebaseFacts,
      retrievedContext: retrievedContext?.flowContext || ''
    });

    const result = await aiProvider.generateJSON({
      systemPrompt: 'You are a software architect tracing end-to-end request and execution flows. Always return valid JSON adhering strictly to the schema.',
      userPrompt: prompt,
      temperature: 0.1
    });

    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateApplicationFlow(result);

    return {
      applicationFlow: validated
    };
  } catch (err) {
    console.error(`❌ [LangGraph:analyzeFlow] Error analyzing flow:`, err);
    const fallback = [
      {
        step: 1,
        name: 'Application Initialization',
        description: 'Application launches through primary entry point.',
        components: codebaseFacts?.entryPoints || [],
        evidence: ['Entry points']
      }
    ];
    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateApplicationFlow(fallback);
    return {
      applicationFlow: validated,
      errors: [`analyzeFlow: ${err.message}`]
    };
  }
}
