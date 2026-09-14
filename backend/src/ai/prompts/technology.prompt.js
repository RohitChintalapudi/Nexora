export function buildTechnologyPrompt({ repositoryMetadata, retrievedContext }) {
  return `
You are an expert codebase intelligence analyst. Analyze the technology stack of the repository based strictly on the provided deterministic metadata and retrieved code context.

### Deterministic Codebase Facts (M6):
- Primary Frameworks: ${JSON.stringify(repositoryMetadata?.frameworks || [])}
- Detected Languages: ${JSON.stringify(repositoryMetadata?.languages || {})}
- Package Manager: ${repositoryMetadata?.packageManager || 'Unknown'}
- Runtime: ${repositoryMetadata?.runtime || 'Unknown'}
- Declared Dependencies: ${JSON.stringify(repositoryMetadata?.dependencies || {})}
- Database Indicators: ${JSON.stringify(repositoryMetadata?.databaseIndicators || [])}

### Retrieved Repository Evidence (M8 RAG):
${retrievedContext || 'No additional code chunks retrieved.'}

### Instructions:
1. Provide a comprehensive breakdown of the languages, frameworks, runtime, database, and significant libraries.
2. For every technology listed, state:
   - "name": technology name
   - "category": e.g. "Backend Framework", "Database Client", "State Management", "ORM", "Testing"
   - "status": MUST be one of "FACT" (proven by package.json / config / imports) or "INFERENCE" (derived from patterns) or "UNKNOWN"
   - "confidence": number between 0.0 and 1.0
   - "evidence": list of specific file paths, package names, or symbols supporting this claim
   - "purpose": short description of what this technology does in the codebase
3. Detail the database architecture if supported by evidence.
4. Do NOT invent databases or frameworks not present in the evidence.

### Expected JSON Output Format:
{
  "technologyStack": [
    {
      "name": "string",
      "category": "string",
      "status": "FACT | INFERENCE | UNKNOWN",
      "confidence": 0.95,
      "evidence": ["package.json dependency", "config file"],
      "purpose": "string"
    }
  ],
  "runtime": "string",
  "packageManager": "string",
  "database": {
    "detected": true,
    "type": "string (e.g. PostgreSQL, MongoDB, Neon)",
    "evidence": ["string"]
  }
}
`.trim();
}
