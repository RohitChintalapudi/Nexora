/**
 * NEXORA Ingestion Pipeline Configuration & Safety Limits
 * Milestone M5: Repository Ingestion
 */

export const INGESTION_CONFIG = {
  // Maximum total extracted repository size allowed (default: 50MB)
  MAX_REPOSITORY_SIZE_MB: parseInt(process.env.MAX_REPOSITORY_SIZE_MB, 10) || 50,
  get MAX_REPOSITORY_SIZE_BYTES() {
    return this.MAX_REPOSITORY_SIZE_MB * 1024 * 1024;
  },

  // Maximum total number of files scanned in a repository (default: 1,500)
  MAX_REPOSITORY_FILES: parseInt(process.env.MAX_REPOSITORY_FILES, 10) || 1500,

  // Maximum size for an individual source code file stored in the DB (default: 1MB)
  MAX_FILE_SIZE_MB: parseFloat(process.env.MAX_FILE_SIZE_MB) || 1.0,
  get MAX_FILE_SIZE_BYTES() {
    return Math.floor(this.MAX_FILE_SIZE_MB * 1024 * 1024);
  },

  // Maximum cumulative stored source code text size per repository (default: 20MB)
  MAX_TOTAL_SOURCE_SIZE_MB: parseInt(process.env.MAX_TOTAL_SOURCE_SIZE_MB, 10) || 20,
  get MAX_TOTAL_SOURCE_SIZE_BYTES() {
    return this.MAX_TOTAL_SOURCE_SIZE_MB * 1024 * 1024;
  },

  // Batch insert size for repository_files DB persistence
  PERSISTENCE_BATCH_SIZE: 50,

  // Directories always ignored during scanning
  IGNORED_DIRECTORIES: new Set([
    '.git',
    '.github',
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.nyc_output',
    '.cache',
    '.next',
    '.nuxt',
    '.svelte-kit',
    '.turbo',
    '.docusaurus',
    'out',
    'target',
    'vendor',
    'bower_components',
    'venv',
    '.venv',
    'env',
    '.env',
    '__pycache__',
    '.pytest_cache',
    '.mypy_cache',
    '.tox',
    '.gradle',
    '.idea',
    '.vscode',
    'bin',
    'obj',
    '.bundle',
    'Pods'
  ]),

  // Binary file extensions to exclude from source code storage
  BINARY_EXTENSIONS: new Set([
    // Images & Media
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.tiff', '.svgz',
    '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv',
    '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a',
    // Archives & Documents
    '.zip', '.tar', '.gz', '.tgz', '.bz2', '.7z', '.rar',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    // Compiled / Executables
    '.exe', '.dll', '.so', '.dylib', '.bin', '.iso', '.dmg',
    '.class', '.jar', '.war', '.ear',
    '.pyc', '.pyo', '.pyd',
    '.o', '.obj', '.a', '.lib',
    '.wasm',
    // Fonts
    '.woff', '.woff2', '.ttf', '.eot', '.otf'
  ]),

  // Lock files (excluded from normal source analysis, but metadata retained)
  LOCK_FILES: new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    'composer.lock',
    'Cargo.lock',
    'Gemfile.lock',
    'Pipfile.lock',
    'poetry.lock',
    'flake.lock'
  ]),

  // Generated / Minified patterns
  GENERATED_EXTENSIONS: new Set([
    '.min.js', '.min.css', '.bundle.js', '.map', '.d.ts.map', '.js.map', '.css.map'
  ]),

  // Sensitive file patterns (never logged, content redacted/protected)
  SENSITIVE_PATTERNS: [
    /^\.env(\..+)?$/i,
    /.*\.pem$/i,
    /.*\.key$/i,
    /.*\.p12$/i,
    /.*\.pfx$/i,
    /.*id_rsa.*/i,
    /.*credentials\.json$/i,
    /.*service-account.*\.json$/i,
    /.*token.*/i,
    /.*secret.*/i
  ]
};
