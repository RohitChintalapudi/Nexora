export function buildSummaryPrompt({
  repository,
  technologyStack,
  architecture,
  modules,
  applicationFlow,
  codebaseFacts
}) {
  return `
You are an expert developer advocate and lead software architect. Provide a clear, cohesive developer-friendly overview, architectural facts, and onboarding quickstart for this repository based strictly on the analyzed evidence.

### Repository Context:
- Repository: ${repository?.name || 'Unknown'} (${repository?.full_name || repository?.fullName || 'Unknown'})
- Primary Language: ${repository?.language || 'Unknown'}
- Analyzed Technologies: ${JSON.stringify((technologyStack || []).map(t => `${t.name} (${t.category} - ${t.status})`))}
- Architecture Pattern: ${architecture?.architecturalStyle || 'Modular'}
- Core Modules: ${JSON.stringify((modules || []).map(m => m.name))}
- Entry Points: ${JSON.stringify((codebaseFacts?.entryPoints || []).slice(0, 10))}

### Instructions:
1. Write a 2-4 sentence executive overview answering: What is this application, what core problems does it solve, and how is it built?
2. Create an actionable 3-step developer quick-start guide explaining how to install, configure, and run/test the codebase.
3. Highlight the 3-6 most important files every onboarding developer should inspect first, with concrete reasons.
4. Identify 3-5 concrete architectural facts, technical considerations, or caveats specific to this repository (e.g. required environment variables, database connections, build prerequisites, or unverified external APIs).
5. Avoid generic filler words. Make all insights directly accurate and relevant to this repository.

### Expected JSON Output Format:
{
  "overview": "string",
  "developerQuickStart": [
    {
      "step": 1,
      "title": "Install Dependencies",
      "command": "npm install",
      "explanation": "string"
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
    {
      "topic": "Environment & Secrets",
      "inference": "The application expects runtime environment variables (such as database credentials or API keys) that must be provided in a .env file before running.",
      "missingEvidence": ".env file is ignored/not committed to repository",
      "confidence": 0.95
    }
  ]
}
`.trim();
}
