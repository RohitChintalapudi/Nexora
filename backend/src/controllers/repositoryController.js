import { RepositoryModel } from '../models/repositoryModel.js';
import { GithubAccountModel } from '../models/githubAccountModel.js';
import { RepositoryFileModel } from '../models/repositoryFileModel.js';

/**
 * Fetch GitHub repository by ID using authenticated user's access token
 */
async function fetchGithubRepoById(githubRepoId, accessToken) {
  const url = `https://api.github.com/repositories/${githubRepoId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Nexora-App',
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 403) {
      return null;
    }
    throw new Error(`GitHub API returned status ${response.status}`);
  }

  return await response.json();
}

export const repositoryController = {
  /**
   * Select & Save a GitHub repository for the authenticated NEXORA user
   * POST /api/repositories
   */
  async selectRepository(req, res) {
    try {
      const { githubRepositoryId } = req.body;

      if (!githubRepositoryId) {
        return res.status(400).json({
          success: false,
          message: 'githubRepositoryId is required'
        });
      }

      // Verify authenticated user has an active GitHub connection
      const account = await GithubAccountModel.findByUserId(req.user.id);
      if (!account || !account.access_token) {
        return res.status(403).json({
          success: false,
          message: 'Active GitHub connection required. Please connect GitHub first.'
        });
      }

      // Verify that this repository is accessible via the user's GitHub authorization
      const ghRepo = await fetchGithubRepoById(githubRepositoryId, account.access_token);
      if (!ghRepo) {
        return res.status(403).json({
          success: false,
          message: 'Repository is not accessible through your authorized GitHub account.'
        });
      }

      // Persist / upsert the verified repository record
      const repository = await RepositoryModel.upsert({
        userId: req.user.id,
        githubRepositoryId: ghRepo.id,
        name: ghRepo.name,
        fullName: ghRepo.full_name,
        owner: ghRepo.owner?.login || account.username,
        description: ghRepo.description || '',
        isPrivate: Boolean(ghRepo.private),
        defaultBranch: ghRepo.default_branch || 'main',
        language: ghRepo.language || null,
        htmlUrl: ghRepo.html_url,
        githubUpdatedAt: ghRepo.updated_at
      });

      return res.status(201).json({
        success: true,
        message: 'Repository selected and saved successfully',
        repository: {
          id: repository.id,
          userId: repository.user_id,
          githubRepositoryId: repository.github_repository_id,
          name: repository.name,
          fullName: repository.full_name,
          owner: repository.owner,
          description: repository.description,
          private: repository.private,
          defaultBranch: repository.default_branch,
          language: repository.language,
          htmlUrl: repository.html_url,
          githubUpdatedAt: repository.github_updated_at,
          createdAt: repository.created_at,
          updatedAt: repository.updated_at
        }
      });
    } catch (error) {
      console.error('Error selecting repository:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save selected repository'
      });
    }
  },

  /**
   * Get all saved repositories for the authenticated user
   * GET /api/repositories
   */
  async getRepositories(req, res) {
    try {
      const rows = await RepositoryModel.findAllByUserId(req.user.id);

      const repositories = rows.map(repo => ({
        id: repo.id,
        userId: repo.user_id,
        githubRepositoryId: repo.github_repository_id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner,
        description: repo.description,
        private: repo.private,
        defaultBranch: repo.default_branch,
        language: repo.language,
        htmlUrl: repo.html_url,
        githubUpdatedAt: repo.github_updated_at,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at
      }));

      return res.status(200).json({
        success: true,
        repositories
      });
    } catch (error) {
      console.error('Error fetching repositories:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve saved repositories'
      });
    }
  },

  /**
   * Get specific saved repository details with strict multi-tenant authorization
   * GET /api/repositories/:id
   */
  async getRepositoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID parameter'
        });
      }

      // Enforces multi-tenant ownership check (user_id = req.user.id)
      const repo = await RepositoryModel.findByIdAndUserId(id, req.user.id);

      if (!repo) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }

      return res.status(200).json({
        success: true,
        repository: {
          id: repo.id,
          userId: repo.user_id,
          githubRepositoryId: repo.github_repository_id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner,
          description: repo.description,
          private: repo.private,
          defaultBranch: repo.default_branch,
          language: repo.language,
          htmlUrl: repo.html_url,
          githubUpdatedAt: repo.github_updated_at,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at
        }
      });
    } catch (error) {
      console.error('Error fetching repository by ID:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve repository details'
      });
    }
  },

  /**
   * Delete a saved repository for the authenticated user
   * DELETE /api/repositories/:id
   */
  async deleteRepository(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID parameter'
        });
      }

      const deleted = await RepositoryModel.deleteByIdAndUserId(id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Repository removed successfully'
      });
    } catch (error) {
      console.error('Error deleting repository:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete repository'
      });
    }
  },

  /**
   * Get file content for source reference preview
   * GET /api/repositories/:repositoryId/file-content?path=...
   */
  async getFileContent(req, res) {
    try {
      const { repositoryId } = req.params;
      const filePath = req.query.path;

      if (!repositoryId || isNaN(Number(repositoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID parameter'
        });
      }

      if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'File path query parameter is required'
        });
      }

      // Check repository ownership
      const repo = await RepositoryModel.findByIdAndUserId(repositoryId, req.user.id);
      if (!repo) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }

      const fileRecord = await RepositoryFileModel.findByPath(repositoryId, req.user.id, filePath);
      if (!fileRecord) {
        return res.status(404).json({
          success: false,
          message: `File "${filePath}" not found in repository index`
        });
      }

      return res.status(200).json({
        success: true,
        file: {
          id: fileRecord.id,
          path: fileRecord.path,
          name: fileRecord.name,
          extension: fileRecord.extension,
          language: fileRecord.language,
          sizeBytes: fileRecord.size_bytes,
          isBinary: fileRecord.is_binary,
          content: fileRecord.content,
          linesCount: fileRecord.content ? fileRecord.content.split('\n').length : 0
        }
      });
    } catch (error) {
      console.error('Error fetching file content:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve file content'
      });
    }
  }
};
