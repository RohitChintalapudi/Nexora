import path from 'path';

export class ArchitecturalClassifier {
  /**
   * Classify architectural roles of repository files with evidence and confidence
   * @param {Array<Object>} repositoryFiles
   * @param {Map<number, Object>} parsedFilesMap
   * @returns {Array<Object>} List of { fileId, filePath, role, confidence, evidence }
   */
  static classify(repositoryFiles = [], parsedFilesMap = new Map()) {
    const classifications = [];

    for (const file of repositoryFiles) {
      if (file.isIgnored || file.isBinary) continue;

      const p = (file.path || '').toLowerCase().replace(/\\/g, '/');
      const filename = path.basename(p);
      const parsed = parsedFilesMap.get(file.id);

      const evidence = [];
      let role = null;
      let confidence = 'MEDIUM';

      // 1. Tests
      if (
        p.includes('__tests__/') ||
        p.includes('/tests/') ||
        p.includes('/test/') ||
        filename.includes('.test.') ||
        filename.includes('.spec.')
      ) {
        role = 'TEST';
        confidence = 'FACT';
        evidence.push('File is located inside test directory or matches test/spec suffix');
      }

      // 2. Controller
      else if (p.includes('/controllers/') || p.startsWith('controllers/') || filename.endsWith('controller.ts') || filename.endsWith('controller.js') || filename.endsWith('_controller.py')) {
        role = 'CONTROLLER';
        confidence = (p.includes('controllers/') && filename.includes('controller')) ? 'FACT' : 'HIGH';
        if (p.includes('controllers/')) evidence.push('Located in controllers/ directory');
        if (filename.includes('controller')) evidence.push('Filename ends with Controller');
      }

      // 3. Service
      else if (p.includes('/services/') || p.startsWith('services/') || filename.endsWith('service.ts') || filename.endsWith('service.js') || filename.endsWith('_service.py')) {
        role = 'SERVICE';
        confidence = (p.includes('services/') && filename.includes('service')) ? 'FACT' : 'HIGH';
        if (p.includes('services/')) evidence.push('Located in services/ directory');
        if (filename.includes('service')) evidence.push('Filename ends with Service');
      }

      // 4. Repository / Data Access
      else if (p.includes('/repositories/') || p.startsWith('repositories/') || filename.endsWith('repository.ts') || filename.endsWith('repository.js')) {
        role = 'REPOSITORY';
        confidence = (p.includes('repositories/') && filename.includes('repository')) ? 'FACT' : 'HIGH';
        if (p.includes('repositories/')) evidence.push('Located in repositories/ directory');
        if (filename.includes('repository')) evidence.push('Filename ends with Repository');
      }

      // 5. Routes / API Endpoints
      else if (
        p.includes('/routes/') ||
        p.startsWith('routes/') ||
        p.includes('/api/') ||
        filename.endsWith('routes.ts') ||
        filename.endsWith('route.ts') ||
        filename.endsWith('routes.js')
      ) {
        role = 'ROUTE';
        confidence = 'HIGH';
        if (p.includes('routes/')) evidence.push('Located in routes/ directory');
        if (parsed?.routes?.length > 0) {
          confidence = 'FACT';
          evidence.push(`Contains ${parsed.routes.length} detected HTTP route declarations`);
        }
      }

      // 6. Models / Schemas
      else if (
        p.includes('/models/') ||
        p.startsWith('models/') ||
        p.includes('/schemas/') ||
        p.includes('/entities/') ||
        filename.endsWith('model.ts') ||
        filename.endsWith('model.js') ||
        filename.endsWith('_model.py') ||
        filename.endsWith('.prisma')
      ) {
        role = 'MODEL';
        confidence = 'HIGH';
        if (p.includes('models/')) evidence.push('Located in models/ directory');
        if (p.includes('schemas/')) evidence.push('Located in schemas/ directory');
      }

      // 7. React Components / Views
      else if (
        p.includes('/components/') ||
        p.startsWith('components/') ||
        p.includes('/views/') ||
        p.includes('/pages/') ||
        p.includes('/screens/')
      ) {
        role = 'COMPONENT';
        confidence = 'HIGH';
        evidence.push('Located in UI component / view directory');
      }

      // 8. Hooks
      else if (
        (p.includes('/hooks/') || p.startsWith('hooks/')) &&
        (filename.startsWith('use') || filename.includes('hook'))
      ) {
        role = 'HOOK';
        confidence = 'FACT';
        evidence.push('Custom React/frontend hook in hooks/ directory');
      }

      // 9. Middlewares
      else if (
        p.includes('/middlewares/') ||
        p.includes('/middleware/') ||
        filename.includes('middleware')
      ) {
        role = 'MIDDLEWARE';
        confidence = 'HIGH';
        evidence.push('Located in middleware directory');
      }

      // 10. Config
      else if (
        p.includes('/config/') ||
        p.startsWith('config/') ||
        filename.includes('.config.') ||
        filename === 'tsconfig.json' ||
        filename === 'package.json'
      ) {
        role = 'CONFIG';
        confidence = 'FACT';
        evidence.push('System or framework configuration file');
      }

      // 11. Utilities / Helpers
      else if (
        p.includes('/utils/') ||
        p.includes('/helpers/') ||
        p.includes('/lib/')
      ) {
        role = 'UTIL';
        confidence = 'MEDIUM';
        evidence.push('Utility or helper function module');
      }

      if (role) {
        classifications.push({
          fileId: file.id,
          filePath: file.path,
          role,
          confidence,
          evidence
        });
      }
    }

    return classifications;
  }
}
