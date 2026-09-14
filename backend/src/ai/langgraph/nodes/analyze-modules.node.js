import { getAIProvider } from '../../providers/index.js';
import { buildModulesPrompt } from '../../prompts/index.js';

/**
 * Node 5: Analyze Modules & Domains
 */
export async function analyzeModulesNode(state) {
  const { codebaseFacts, retrievedContext, jobId } = state;
  console.log(`📦 [LangGraph:analyzeModules] Analyzing functional domains and modules`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'ANALYZING_MODULES' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const aiProvider = getAIProvider();
    const prompt = buildModulesPrompt({
      codebaseFacts,
      retrievedContext: retrievedContext?.modulesContext || ''
    });

    const result = await aiProvider.generateJSON({
      systemPrompt: 'You are a software architect identifying functional domains and modules. Always return valid JSON adhering strictly to the schema.',
      userPrompt: prompt,
      temperature: 0.1
    });

    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateModules(result);

    return {
      modules: validated
    };
  } catch (err) {
    console.error(`❌ [LangGraph:analyzeModules] Error analyzing modules:`, err);
    const fallback = [
      {
        name: 'Core Application',
        purpose: 'Main entry point and core logic',
        status: 'FACT',
        keyFiles: (codebaseFacts?.entryPoints || []).slice(0, 3),
        keySymbols: (codebaseFacts?.symbols || []).slice(0, 5).map(s => s.name),
        dependencies: Object.keys(codebaseFacts?.dependencies || {}).slice(0, 5),
        evidence: ['Project entry points and metadata']
      }
    ];
    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateModules(fallback);
    return {
      modules: validated,
      errors: [`analyzeModules: ${err.message}`]
    };
  }
}
