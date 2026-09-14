import { BaseAIProvider } from './ai-provider.interface.js';

export class MockAIProvider extends BaseAIProvider {
  constructor(modelName = 'mock-analysis-engine-v1') {
    super();
    this.modelName = modelName;
  }

  getModelName() {
    return this.modelName;
  }

  async generateStructured({ prompt, systemPrompt }) {
    // Determine which analysis domain is being requested from prompt contents
    const lower = (prompt || '').toLowerCase();

    if (lower.includes('technology') || lower.includes('dependencies')) {
      return {
        technologyStack: [
          {
            name: 'Node.js / Express',
            category: 'Backend Framework',
            status: 'FACT',
            confidence: 0.98,
            evidence: ['package.json dependencies: express', 'API route controllers'],
            purpose: 'Core HTTP API routing and middleware handling.'
          },
          {
            name: 'PostgreSQL',
            category: 'Database Client',
            status: 'FACT',
            confidence: 0.95,
            evidence: ['pg / @neondatabase/serverless database pool'],
            purpose: 'Relational data persistence and vector embeddings storage.'
          }
        ],
        runtime: 'Node.js',
        packageManager: 'npm',
        database: {
          detected: true,
          type: 'PostgreSQL',
          evidence: ['PostgreSQL pool initialization in database config']
        }
      };
    }

    if (lower.includes('architecture') || lower.includes('layers')) {
      return {
        summary: 'Layered modular architecture with controllers, services, database access layer, and middleware.',
        architecturalStyle: 'Modular MVC / Layered Service Architecture',
        layers: [
          { name: 'Routes & Endpoints', description: 'HTTP request entry points and URL handlers', role: 'ROUTER' },
          { name: 'Controllers', description: 'Request parameter parsing, validation, and HTTP responses', role: 'CONTROLLER' },
          { name: 'Services & Business Logic', description: 'Domain logic, authentication, and analysis pipelines', role: 'SERVICE' },
          { name: 'Database & Models', description: 'Data access, SQL queries, and vector storage', role: 'REPOSITORY' }
        ],
        relationships: [
          { from: 'Routes', to: 'Controllers', type: 'ROUTES_TO', evidence: 'router definitions' },
          { from: 'Controllers', to: 'Services', type: 'DELEGATES_TO', evidence: 'controller imports' },
          { from: 'Services', to: 'Database', type: 'PERSISTS_TO', evidence: 'database pool queries' }
        ],
        confidence: 'HIGH'
      };
    }

    if (lower.includes('module') || lower.includes('important modules')) {
      return {
        modules: [
          {
            name: 'Authentication & Security',
            purpose: 'User login, password hashing with bcrypt, and JWT token issuance.',
            status: 'FACT',
            keyFiles: ['src/controllers/auth.controller.js'],
            keySymbols: ['loginUser', 'AuthService'],
            dependencies: ['jsonwebtoken', 'bcrypt'],
            evidence: ['auth.controller.js with loginUser and AuthService symbols']
          },
          {
            name: 'Database & Persistence',
            purpose: 'Manages PostgreSQL connection pools and query execution.',
            status: 'FACT',
            keyFiles: ['src/config/database.js'],
            keySymbols: ['dbPool', 'runQuery'],
            dependencies: ['pg'],
            evidence: ['database.js with dbPool instance']
          }
        ]
      };
    }

    if (lower.includes('flow') || lower.includes('lifecycle')) {
      return {
        applicationFlow: [
          {
            stepNumber: 1,
            stage: 'HTTP Request Ingestion',
            description: 'Client sends HTTP request to registered route endpoint.',
            filesInvolved: ['src/controllers/auth.controller.js'],
            status: 'FACT'
          },
          {
            stepNumber: 2,
            stage: 'Authentication & Business Logic',
            description: 'Controller validates input and executes AuthService / domain service.',
            filesInvolved: ['src/controllers/auth.controller.js'],
            status: 'FACT'
          },
          {
            stepNumber: 3,
            stage: 'Data Access & Response',
            description: 'Queries database via dbPool and returns JSON payload.',
            filesInvolved: ['src/config/database.js'],
            status: 'FACT'
          }
        ]
      };
    }

    // Default: Final Summary
    return {
      overview: 'Modular backend web service providing authentication, API routing, and PostgreSQL data persistence.',
      developerQuickStart: [
        { step: 1, action: 'Install dependencies using package manager (npm install).' },
        { step: 2, action: 'Configure DATABASE_URL and environment secrets in .env.' },
        { step: 3, action: 'Start the development server via npm run dev.' }
      ],
      importantFiles: [
        { path: 'src/controllers/auth.controller.js', reason: 'Handles user authentication and JWT validation.' },
        { path: 'src/config/database.js', reason: 'Establishes database connection pooling.' }
      ],
      entryPoints: [
        { path: 'src/server.js', type: 'Server Entry Point' }
      ],
      uncertainties: []
    };
  }
}

export const mockAIProvider = new MockAIProvider();
export default MockAIProvider;
