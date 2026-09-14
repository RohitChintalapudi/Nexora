export function buildModulesPrompt({ codebaseFacts, retrievedContext }) {
  return `
You are an expert codebase intelligence analyst. Identify the primary functional modules/domains in the repository based strictly on codebase facts and retrieved source evidence.

### Deterministic Codebase Facts (M6):
- Files & Roles: ${JSON.stringify((codebaseFacts?.files || []).slice(0, 30).map(f => ({ path: f.path, language: f.language })))}
- Key Exported Symbols: ${JSON.stringify((codebaseFacts?.symbols || []).slice(0, 25).map(s => ({ name: s.name, type: s.type, file: s.filePath })))}
- Routes: ${JSON.stringify((codebaseFacts?.routes || []).slice(0, 15))}

### Retrieved Repository Evidence (M8 RAG):
${retrievedContext || 'No additional code chunks retrieved.'}

### Instructions:
1. Identify the 3 to 8 most important functional modules (e.g. Authentication, Billing, User Management, Data Ingestion, Search, Notifications, Database, API Client).
2. For each module:
   - "name": Module name
   - "purpose": What this module accomplishes
   - "status": "FACT" (explicitly defined in code) or "INFERENCE" (derived from cohesive symbols/files)
   - "confidence": number between 0.90 and 1.00
   - "keyFiles": list of actual file paths from the repository
   - "keySymbols": list of actual function/class names
   - "dependencies": key npm/pip packages used
   - "evidence": specific code evidence
3. Do NOT invent modules or hallucinate file paths not present in the repository facts.

### Expected JSON Output Format:
{
  "modules": [
    {
      "name": "string",
      "purpose": "string",
      "status": "FACT | INFERENCE",
      "confidence": 0.96,
      "keyFiles": ["string"],
      "keySymbols": ["string"],
      "dependencies": ["string"],
      "evidence": ["string"]
    }
  ]
}
`.trim();
}
