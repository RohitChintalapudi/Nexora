export function buildSummaryPrompt({
  repository,
  technologyStack,
  architecture,
  modules,
  applicationFlow,
  codebaseFacts
}) {
  return `
You are an expert developer advocate and lead software architect. Provide a clear, cohesive developer-friendly overview and onboarding quickstart for this repository based on the accumulated analysis results.

### Repository Context:
- Repository: ${repository?.name || 'Unknown'} (${repository?.full_name || repository?.fullName || 'Unknown'})
- Primary Language: ${repository?.language || 'Unknown'}
- Analyzed Technologies: ${JSON.stringify((technologyStack || []).map(t => `${t.name} (${t.category})`))}
- Architecture Pattern: ${architecture?.architecturalStyle || 'Modular'}
- Core Modules: ${JSON.stringify((modules || []).map(m => m.name))}

### Instructions:
1. Write a 2-4 sentence executive overview answering: What is this application, what core problems does it solve, and how is it built?
2. Create an actionable 3-step developer quick-start guide explaining how to install, configure, and run/test the codebase.
3. Highlight the 3-6 most important files every onboarding developer should inspect first.
4. List any identified architectural uncertainties, technical debts, or missing configuration details.
5. Avoid vague buzzwords. Make it concrete and repository-specific.

### Expected JSON Output Format:
{
  "overview": "string",
  "developerQuickStart": [
    {
      "step": 1,
      "action": "string"
    }
  ],
  "importantFiles": [
    {
      "path": "string",
      "reason": "string"
    }
  ],
  "entryPoints": [
    {
      "path": "string",
      "type": "string"
    }
  ],
  "uncertainties": [
    "string"
  ]
}
`.trim();
}
