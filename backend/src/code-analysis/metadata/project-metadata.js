import path from 'path';

export class ProjectMetadataExtractor {
  /**
   * Extract deterministic project-level intelligence from repository files
   * @param {Array<Object>} repositoryFiles
   * @returns {Object} Extracted project metadata
   */
  static extract(repositoryFiles = []) {
    const frameworks = [];
    const entryPoints = [];
    const databaseIndicators = [];
    let packageManager = null;
    let runtime = null;
    let dependencies = {};
    let scripts = {};
    const languages = {};

    // 1. Language breakdown from files
    for (const file of repositoryFiles) {
      if (file.language && !file.isIgnored && !file.isBinary) {
        languages[file.language] = (languages[file.language] || 0) + 1;
      }
    }

    // Determine primary runtime
    if (languages['TypeScript'] || languages['JavaScript'] || languages['TypeScript React'] || languages['JavaScript React']) {
      runtime = 'Node.js / Web';
    } else if (languages['Python']) {
      runtime = 'Python';
    } else if (languages['Go']) {
      runtime = 'Go';
    } else if (languages['Rust']) {
      runtime = 'Rust';
    } else if (languages['Java']) {
      runtime = 'Java / JVM';
    }

    // 2. Package Manager Detection from lockfiles or config files
    const fileNames = new Set(repositoryFiles.map(f => path.basename(f.path).toLowerCase()));
    if (fileNames.has('pnpm-lock.yaml')) packageManager = 'pnpm';
    else if (fileNames.has('yarn.lock')) packageManager = 'yarn';
    else if (fileNames.has('package-lock.json')) packageManager = 'npm';
    else if (fileNames.has('poetry.lock')) packageManager = 'poetry';
    else if (fileNames.has('pipfile.lock') || fileNames.has('pipfile')) packageManager = 'pipenv';
    else if (fileNames.has('requirements.txt')) packageManager = 'pip';
    else if (fileNames.has('cargo.lock') || fileNames.has('cargo.toml')) packageManager = 'cargo';
    else if (fileNames.has('go.sum') || fileNames.has('go.mod')) packageManager = 'go';

    // 3. Inspect package.json
    const packageJsonFile = repositoryFiles.find(f => path.basename(f.path).toLowerCase() === 'package.json');
    if (packageJsonFile && packageJsonFile.content) {
      try {
        const pkg = JSON.parse(packageJsonFile.content);
        scripts = pkg.scripts || {};
        const prodDeps = pkg.dependencies || {};
        const devDeps = pkg.devDependencies || {};
        dependencies = { ...prodDeps, ...devDeps };

        // Framework Detection (Node / Web)
        const checkDep = (depName) => !!(prodDeps[depName] || devDeps[depName]);

        if (checkDep('next')) {
          frameworks.push({
            name: 'Next.js',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: next)',
            version: prodDeps['next'] || devDeps['next']
          });
        }
        if (checkDep('react') && !checkDep('next')) {
          frameworks.push({
            name: 'React',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: react)',
            version: prodDeps['react'] || devDeps['react']
          });
        }
        if (checkDep('vue')) {
          frameworks.push({
            name: 'Vue.js',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: vue)',
            version: prodDeps['vue'] || devDeps['vue']
          });
        }
        if (checkDep('express')) {
          frameworks.push({
            name: 'Express',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: express)',
            version: prodDeps['express'] || devDeps['express']
          });
        }
        if (checkDep('@nestjs/core')) {
          frameworks.push({
            name: 'NestJS',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: @nestjs/core)',
            version: prodDeps['@nestjs/core'] || devDeps['@nestjs/core']
          });
        }
        if (checkDep('fastify')) {
          frameworks.push({
            name: 'Fastify',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: fastify)',
            version: prodDeps['fastify'] || devDeps['fastify']
          });
        }
        if (checkDep('vite')) {
          frameworks.push({
            name: 'Vite',
            confidence: 'DETERMINISTIC',
            source: 'package.json (dependency: vite)',
            version: prodDeps['vite'] || devDeps['vite']
          });
        }

        // Database Indicators (Node)
        if (checkDep('@prisma/client') || checkDep('prisma')) {
          databaseIndicators.push({
            name: 'Prisma ORM',
            confidence: 'DETERMINISTIC',
            evidence: 'prisma dependency declared in package.json'
          });
        }
        if (checkDep('mongoose')) {
          databaseIndicators.push({
            name: 'Mongoose (MongoDB)',
            confidence: 'DETERMINISTIC',
            evidence: 'mongoose dependency declared in package.json'
          });
        }
        if (checkDep('pg') || checkDep('@neondatabase/serverless')) {
          databaseIndicators.push({
            name: 'PostgreSQL',
            confidence: 'DETERMINISTIC',
            evidence: 'pg/@neondatabase/serverless client in package.json'
          });
        }
        if (checkDep('typeorm')) {
          databaseIndicators.push({
            name: 'TypeORM',
            confidence: 'DETERMINISTIC',
            evidence: 'typeorm dependency declared in package.json'
          });
        }
        if (checkDep('ioredis') || checkDep('@upstash/redis') || checkDep('redis')) {
          databaseIndicators.push({
            name: 'Redis',
            confidence: 'DETERMINISTIC',
            evidence: 'Redis client library in package.json'
          });
        }

        // Entry point from package.json
        if (pkg.main) {
          entryPoints.push({
            path: pkg.main,
            confidence: 'DETERMINISTIC',
            source: 'package.json "main" field'
          });
        }
      } catch {
        // Ignore package.json parsing errors
      }
    }

    // 4. Inspect Python dependency files (requirements.txt, pyproject.toml)
    const reqFile = repositoryFiles.find(f => path.basename(f.path).toLowerCase() === 'requirements.txt');
    const pyprojectFile = repositoryFiles.find(f => path.basename(f.path).toLowerCase() === 'pyproject.toml');
    const pythonDepsContent = (reqFile?.content || '') + '\n' + (pyprojectFile?.content || '');

    if (pythonDepsContent.trim()) {
      const lower = pythonDepsContent.toLowerCase();
      if (lower.includes('fastapi')) {
        frameworks.push({
          name: 'FastAPI',
          confidence: 'DETERMINISTIC',
          source: reqFile ? 'requirements.txt' : 'pyproject.toml'
        });
      }
      if (lower.includes('flask')) {
        frameworks.push({
          name: 'Flask',
          confidence: 'DETERMINISTIC',
          source: reqFile ? 'requirements.txt' : 'pyproject.toml'
        });
      }
      if (lower.includes('django')) {
        frameworks.push({
          name: 'Django',
          confidence: 'DETERMINISTIC',
          source: reqFile ? 'requirements.txt' : 'pyproject.toml'
        });
      }
      if (lower.includes('sqlalchemy')) {
        databaseIndicators.push({
          name: 'SQLAlchemy',
          confidence: 'DETERMINISTIC',
          evidence: 'SQLAlchemy in Python requirements'
        });
      }
      if (lower.includes('tortoise-orm')) {
        databaseIndicators.push({
          name: 'Tortoise ORM',
          confidence: 'DETERMINISTIC',
          evidence: 'Tortoise ORM in Python requirements'
        });
      }
    }

    // 5. Inspect Go (go.mod)
    const goModFile = repositoryFiles.find(f => path.basename(f.path).toLowerCase() === 'go.mod');
    if (goModFile && goModFile.content) {
      if (goModFile.content.includes('github.com/gin-gonic/gin')) {
        frameworks.push({ name: 'Gin', confidence: 'DETERMINISTIC', source: 'go.mod' });
      }
      if (goModFile.content.includes('gorm.io/gorm')) {
        databaseIndicators.push({ name: 'GORM', confidence: 'DETERMINISTIC', evidence: 'GORM in go.mod' });
      }
    }

    // 6. Inspect Rust (Cargo.toml)
    const cargoFile = repositoryFiles.find(f => path.basename(f.path).toLowerCase() === 'cargo.toml');
    if (cargoFile && cargoFile.content) {
      if (cargoFile.content.includes('actix-web')) {
        frameworks.push({ name: 'Actix-web', confidence: 'DETERMINISTIC', source: 'Cargo.toml' });
      }
      if (cargoFile.content.includes('axum')) {
        frameworks.push({ name: 'Axum', confidence: 'DETERMINISTIC', source: 'Cargo.toml' });
      }
      if (cargoFile.content.includes('diesel') || cargoFile.content.includes('sqlx')) {
        databaseIndicators.push({ name: 'SQLx / Diesel', confidence: 'DETERMINISTIC', evidence: 'Database driver in Cargo.toml' });
      }
    }

    // 7. Schema files detection
    const hasPrismaSchema = repositoryFiles.some(f => f.path.endsWith('.prisma') || f.path.includes('prisma/schema.prisma'));
    if (hasPrismaSchema && !databaseIndicators.some(d => d.name.includes('Prisma'))) {
      databaseIndicators.push({
        name: 'Prisma Schema',
        confidence: 'DETERMINISTIC',
        evidence: 'schema.prisma found in repository'
      });
    }

    // 8. Conventional Entry Point Identification
    const candidateEntryPaths = [
      'src/main.ts',
      'src/main.tsx',
      'src/index.ts',
      'src/index.tsx',
      'src/server.ts',
      'src/server.js',
      'src/app.ts',
      'src/app.js',
      'index.ts',
      'index.js',
      'server.js',
      'main.py',
      'app.py',
      'manage.py',
      'main.go',
      'src/main.rs',
      'src/lib.rs'
    ];

    for (const candidate of candidateEntryPaths) {
      const match = repositoryFiles.find(f => f.path === candidate);
      if (match && !entryPoints.some(e => e.path === match.path)) {
        entryPoints.push({
          path: match.path,
          confidence: 'HIGH',
          source: 'Standard architectural entry point convention'
        });
      }
    }

    return {
      frameworks,
      languages,
      packageManager,
      runtime,
      dependencies,
      scripts,
      entryPoints,
      databaseIndicators
    };
  }
}
