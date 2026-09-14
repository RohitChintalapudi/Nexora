export function buildFlowPrompt({ codebaseFacts, retrievedContext }) {
  return `
You are an expert codebase intelligence analyst. Explain the typical end-to-end application lifecycle and request/data flow through the application from an entry point.

### Deterministic Codebase Facts (M6):
- Entry Points: ${JSON.stringify(codebaseFacts?.entryPoints || [])}
- Detected Routes: ${JSON.stringify((codebaseFacts?.routes || []).slice(0, 15))}
- Key Relationships: ${JSON.stringify((codebaseFacts?.relationships || []).slice(0, 20))}
- Architectural Roles: ${JSON.stringify((codebaseFacts?.architecturalRoles || []).slice(0, 20))}

### Retrieved Repository Evidence (M8 RAG):
${retrievedContext || 'No additional code chunks retrieved.'}

### Instructions:
1. Trace how a typical request or execution starts from an entry point and flows through the layers to completion.
2. Provide an ordered list of execution steps (Step 1, Step 2, Step 3, etc.).
3. For each step, specify the stage name, description, files involved, status ("FACT" or "INFERENCE"), and confidence (0.90 to 1.00).
4. If a complete end-to-end path cannot be determined with full certainty, state clearly what is known and what cannot be established from the source code.

### Expected JSON Output Format:
{
  "applicationFlow": [
    {
      "stepNumber": 1,
      "stage": "string (e.g. HTTP Request Ingestion / User Interaction)",
      "description": "string",
      "filesInvolved": ["string"],
      "status": "FACT | INFERENCE",
      "confidence": 0.95
    }
  ]
}
`.trim();
}
