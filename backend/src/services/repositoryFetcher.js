import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { githubTokenService } from './githubTokenService.js';
import { INGESTION_CONFIG } from '../config/ingestionConfig.js';

export class RepositoryFetcher {
  /**
   * Create an isolated, unique temporary workspace for an analysis job
   * @param {number|string} jobId
   * @returns {Promise<string>}
   */
  static async createTempWorkspace(jobId) {
    const nonce = crypto.randomBytes(8).toString('hex');
    const tempDir = path.join(os.tmpdir(), `nexora-analysis-job-${jobId}-${nonce}`);
    await fs.promises.mkdir(tempDir, { recursive: true, mode: 0o700 });
    return tempDir;
  }

  /**
   * Safely and recursively clean up temporary workspace
   * @param {string} tempDir
   */
  static async cleanupWorkspace(tempDir) {
    if (!tempDir || !fs.existsSync(tempDir)) return;
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`⚠️ Failed to remove temporary workspace '${tempDir}':`, err.message);
    }
  }

  /**
   * Fetch repository metadata (commit SHA) and download/extract archive into temporary workspace
   * @param {Object} params
   * @param {number|string} params.userId
   * @param {string} params.owner
   * @param {string} params.repoName
   * @param {string} params.defaultBranch
   * @param {string} params.tempWorkspaceDir
   * @returns {Promise<{ commitSha: string, extractedRoot: string }>}
   */
  static async fetchAndExtract({ userId, owner, repoName, defaultBranch = 'main', tempWorkspaceDir }) {
    // 1. Retrieve authorized and validated GitHub OAuth token
    const tokenResult = await githubTokenService.getValidToken(userId);
    if (!tokenResult || !tokenResult.token) {
      throw new Error('GitHub account is not connected. Please authorize GitHub in settings.');
    }

    let { account, token } = tokenResult;
    const getHeaders = (t) => ({
      Authorization: `Bearer ${t}`,
      'User-Agent': 'Nexora-App',
      Accept: 'application/vnd.github.v3+json'
    });

    // 2. Fetch latest commit SHA for the branch
    let commitSha = null;
    try {
      const commitRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/commits/${encodeURIComponent(defaultBranch)}`,
        { headers: getHeaders(token) }
      );
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        commitSha = commitData.sha || null;
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch commit SHA from GitHub API:', err.message);
    }

    // 3. Fetch zip archive from GitHub
    const zipUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/zipball/${encodeURIComponent(defaultBranch)}`;

    let response = await fetch(zipUrl, {
      headers: getHeaders(token),
      redirect: 'follow'
    });

    // Handle 401: Refresh token and retry download once
    if (response.status === 401) {
      const refreshed = await githubTokenService.refreshAccessToken(account);
      if (refreshed) {
        token = refreshed.access_token;
        response = await fetch(zipUrl, {
          headers: getHeaders(token),
          redirect: 'follow'
        });
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub authorization was revoked or expired. Please reconnect your GitHub account.');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit or permission restriction. Please wait a moment or check repo permissions.');
      }
      if (response.status === 404) {
        throw new Error(`Repository '${owner}/${repoName}' was not found or is no longer accessible.`);
      }
      throw new Error(`GitHub archive download failed with HTTP ${response.status}`);
    }

    // 4. Buffer the downloaded archive
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > INGESTION_CONFIG.MAX_REPOSITORY_SIZE_BYTES) {
      throw new Error(
        `Downloaded repository archive exceeds size limit (${Math.round(buffer.length / (1024 * 1024))}MB > ${INGESTION_CONFIG.MAX_REPOSITORY_SIZE_MB}MB).`
      );
    }

    // 5. Extract safely with Zip-Slip path traversal protection
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const extractDest = path.join(tempWorkspaceDir, 'extracted');
    await fs.promises.mkdir(extractDest, { recursive: true });

    const canonicalDest = path.resolve(extractDest);

    for (const entry of zipEntries) {
      const entryName = entry.entryName;
      const targetPath = path.resolve(canonicalDest, entryName);

      // Security: Prevent Zip-Slip vulnerability
      if (!targetPath.startsWith(canonicalDest)) {
        throw new Error(`Security Violation: Malicious archive entry detected '${entryName}'`);
      }

      if (entry.isDirectory) {
        await fs.promises.mkdir(targetPath, { recursive: true });
      } else {
        await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.promises.writeFile(targetPath, entry.getData());
      }
    }

    // 6. Find the extracted root (GitHub wraps zipball in a single root directory e.g., owner-repo-sha/)
    const extractedEntries = await fs.promises.readdir(extractDest, { withFileTypes: true });
    let rootPath = extractDest;

    if (extractedEntries.length === 1 && extractedEntries[0].isDirectory()) {
      rootPath = path.join(extractDest, extractedEntries[0].name);
    }

    return {
      commitSha,
      extractedRoot: rootPath
    };
  }
}
