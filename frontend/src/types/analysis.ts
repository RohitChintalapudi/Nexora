export type FactInferenceStatus = 'FACT' | 'INFERENCE' | 'UNKNOWN';

export interface TechnologyItem {
  name: string;
  category: string;
  status: FactInferenceStatus;
  confidence?: number;
  evidence?: string[];
  purpose?: string;
}

export interface DatabaseInfo {
  detected: boolean;
  type?: string;
  evidence?: string[];
  models?: string[];
}

export interface ArchitectureLayer {
  name: string;
  description: string;
  role?: string;
}

export interface ArchitectureRelationship {
  from: string;
  to: string;
  type: string;
  evidence?: string;
}

export interface ArchitectureInfo {
  summary: string;
  architecturalStyle?: string;
  layers?: ArchitectureLayer[];
  relationships?: ArchitectureRelationship[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export interface ModuleItem {
  name: string;
  purpose: string;
  status?: FactInferenceStatus;
  keyFiles?: string[];
  keySymbols?: string[];
  dependencies?: string[];
  evidence?: string[];
}

export interface ApplicationFlowStep {
  stepNumber: number;
  stage: string;
  description: string;
  filesInvolved?: string[];
  status?: FactInferenceStatus;
}

export interface EntryPoint {
  path: string;
  type?: string;
}

export interface ImportantFile {
  path: string;
  reason: string;
  startLine?: number;
  endLine?: number;
  symbols?: string[];
}

export interface DependencyItem {
  name: string;
  version?: string;
  category?: string;
}

export interface RouteItem {
  method: string;
  path: string;
  handler?: string | null;
  framework?: string | null;
  filePath?: string | null;
  lineStart?: number | null;
  lineEnd?: number | null;
}

export interface QuickStartStep {
  step?: number;
  title?: string;
  command?: string | null;
  explanation?: string;
  action?: string;
}

export interface UncertaintyItem {
  topic?: string;
  inference?: string;
  confidence?: number;
  missingEvidence?: string;
}

export interface RepositoryAnalysisData {
  overview: string;
  technologyStack: TechnologyItem[];
  architecture: ArchitectureInfo;
  modules: ModuleItem[];
  applicationFlow: ApplicationFlowStep[];
  entryPoints: EntryPoint[];
  importantFiles: ImportantFile[];
  dependencies: DependencyItem[];
  database: DatabaseInfo;
  apiStructure: RouteItem[];
  developerQuickStart: QuickStartStep[];
  uncertainties: (string | UncertaintyItem)[];
}

export interface AnalysisMetadata {
  jobId?: number | null;
  commitSha?: string | null;
  createdAt: string;
  updatedAt: string;
  filesScanned?: number;
  filesIncluded?: number;
  totalSizeBytes?: number;
  symbolsCount?: number;
  relationshipsCount?: number;
  routesCount?: number;
  chunksCount?: number;
  embeddingsCount?: number;
}

export interface RepositoryInfo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  language?: string | null;
  htmlUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisJobInfo {
  id: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  currentStage?: string;
  errorMessage?: string | null;
  startedAt?: string | null;
  createdAt: string;
}

export interface AnalysisResponse {
  success: boolean;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'NOT_FOUND';
  repository: RepositoryInfo;
  analysis?: RepositoryAnalysisData;
  metadata?: AnalysisMetadata;
  job?: AnalysisJobInfo;
  message?: string;
}

export interface SourceFilePreview {
  id: number;
  path: string;
  name: string;
  extension?: string;
  language?: string;
  sizeBytes: number;
  isBinary: boolean;
  content: string | null;
  linesCount: number;
}
