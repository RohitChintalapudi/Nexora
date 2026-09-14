import { getAIProvider } from '../../providers/index.js';
import { buildTechnologyPrompt } from '../../prompts/index.js';

/**
 * Node 3: Analyze Technologies & Dependencies
 */
export async function analyzeTechnologiesNode(state) {
  const { repositoryMetadata, retrievedContext, jobId } = state;
  console.log(`💻 [LangGraph:analyzeTechnologies] Analyzing technology stack`);

  if (jobId) {
    try {
      const { AnalysisJobModel } = await import('../../../models/analysisJobModel.js');
      await AnalysisJobModel.updateStage({ id: jobId, status: 'PROCESSING', currentStage: 'ANALYZING_TECHNOLOGIES' });
    } catch (e) {
      // Non-fatal
    }
  }

  try {
    const aiProvider = getAIProvider();
    const prompt = buildTechnologyPrompt({
      repositoryMetadata,
      retrievedContext: retrievedContext?.technologyContext || ''
    });

    const result = await aiProvider.generateJSON({
      systemPrompt: 'You are a precise, evidence-grounded software architect analyzing a repository technology stack. Always return valid JSON adhering to the schema.',
      userPrompt: prompt,
      temperature: 0.1
    });

    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateTechnologies(
      result,
      repositoryMetadata
    );

    return {
      technologies: validated
    };
  } catch (err) {
    console.error(`❌ [LangGraph:analyzeTechnologies] Error analyzing technologies:`, err);
    const validated = (await import('../../validation/aiSchemaValidator.js')).AISchemaValidator.validateTechnologies(
      null,
      repositoryMetadata
    );
    return {
      technologies: validated,
      errors: [`analyzeTechnologies: ${err.message}`]
    };
  }
}
