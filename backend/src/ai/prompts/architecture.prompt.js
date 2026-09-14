export function buildArchitecturePrompt({ codebaseFacts, retrievedContext }) {
  return `
You are an expert software architecture analyst. Explain the architectural structure, component layers, and inter-component relationships of the repository based solely on the provided deterministic codebase facts and retrieved source evidence.

### Deterministic Codebase Facts (M6):
- Detected Routes: ${JSON.stringify((codebaseFacts?.routes || []).slice(0, 15))}
- Key Code Relationships: ${JSON.stringify((codebaseFacts?.relationships || []).slice(0, 20))}
- Architectural Classifications: ${JSON.stringify((codebaseFacts?.architecturalRoles || []).slice(0, 20))}
- Key Symbols: ${JSON.stringify((codebaseFacts?.symbols || []).slice(0, 20))}

### Retrieved Repository Evidence (M8 RAG):
${retrievedContext || 'No additional code chunks retrieved.'}

### Instructions:
1. Explain the architectural style (e.g. "Layered Service Architecture", "Next.js Fullstack Modular", "Event-Driven Microservice", etc.).
2. Detail the architectural layers present (e.g. Routes, Controllers, Services, Repositories, Models, Middleware, UI Components). Only include layers that exist in the codebase facts or retrieved chunks.
3. Detail how components communicate across boundaries (e.g. Routes -> Controllers -> Services -> Database).
4. Every claim must have verifiable evidence. Do NOT force a standard MVC or 3-tier architecture if the codebase does not use it.
5. If something is unknown or unverified, explicitly state it.

### Expected JSON Output Format:
{
  "summary": "Concise 2-3 sentence overview of the architecture pattern.",
  "architecturalStyle": "string",
  "layers": [
    {
      "name": "string (e.g. Controllers, Services)",
      "description": "string",
      "role": "CONTROLLER | SERVICE | REPOSITORY | ROUTER | COMPONENT | MIDDLEWARE"
    }
  ],
  "relationships": [
    {
      "from": "string",
      "to": "string",
      "type": "ROUTES_TO | DELEGATES_TO | PERSISTS_TO | IMPORTS | EXTENDS",
      "evidence": "string"
    }
  ],
  "confidence": "HIGH | MEDIUM | LOW"
}
`.trim();
}
