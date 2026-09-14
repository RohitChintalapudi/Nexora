/**
 * Abstract Base AI Provider Interface
 * All LLM inference providers implement this contract.
 */
export class BaseAIProvider {
  /**
   * Generate structured JSON output based on a prompt and expected schema/structure
   * @param {Object} params
   * @param {string} params.prompt - Formatted system and user prompt
   * @param {string} [params.systemPrompt] - Optional system guidance
   * @param {Object} [params.schema] - JSON schema / expected keys
   * @param {number} [params.temperature=0.1] - Sampling temperature
   * @param {number} [params.maxTokens=4096] - Max generation tokens
   * @returns {Promise<Object>} Parsed JSON object response
   */
  async generateStructured(params) {
    throw new Error('Method "generateStructured" must be implemented.');
  }

  /**
   * Alias for generateStructured that supports { systemPrompt, userPrompt, prompt, ... }
   */
  async generateJSON(params) {
    const prompt = params.prompt || params.userPrompt;
    return this.generateStructured({
      ...params,
      prompt
    });
  }

  /**
   * Get the active model name
   * @returns {string}
   */
  getModelName() {
    throw new Error('Method "getModelName" must be implemented.');
  }
}
