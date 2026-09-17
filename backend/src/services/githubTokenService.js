import { GithubAccountModel } from '../models/githubAccountModel.js';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

export const githubTokenService = {
  /**
   * Refreshes a GitHub OAuth token using the refresh_token
   * @param {Object} account - GithubAccount record from DB
   * @returns {Promise<Object|null>} Updated account or null if failed
   */
  async refreshAccessToken(account) {
    if (!account || !account.refresh_token) {
      return null;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('GitHub OAuth client credentials missing on server for token refresh');
      return null;
    }

    try {
      const response = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: account.refresh_token
        })
      });

      if (!response.ok) {
        console.warn(`GitHub token refresh HTTP error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      if (data.error || !data.access_token) {
        console.warn('GitHub token refresh rejected:', data.error_description || data.error);
        return null;
      }

      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token || account.refresh_token;
      const newExpiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : null;
      const scopes = data.scope || account.scopes || 'repo,read:user,user:email';

      await GithubAccountModel.upsert({
        userId: account.user_id,
        githubUserId: account.github_user_id,
        username: account.username,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenExpiresAt: newExpiresAt,
        scopes
      });

      console.log(`🔄 Automatically refreshed GitHub access token for user #${account.user_id} (@${account.username})`);
      return {
        ...account,
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_expires_at: newExpiresAt,
        scopes
      };
    } catch (err) {
      console.error('Exception during GitHub token refresh:', err.message);
      return null;
    }
  },

  /**
   * Retrieves a verified valid GitHub access token for a given user ID,
   * automatically refreshing it if it is close to expiration.
   * @param {number|string} userId
   * @returns {Promise<{ account: Object, token: string } | null>}
   */
  async getValidToken(userId) {
    const account = await GithubAccountModel.findByUserId(userId);
    if (!account || !account.access_token) {
      return null;
    }

    // Check if token has an expiration date and expires within the next 5 minutes
    if (account.token_expires_at && account.refresh_token) {
      const expiresAt = new Date(account.token_expires_at).getTime();
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() + fiveMinutes >= expiresAt) {
        // Token is expired or about to expire - refresh it automatically
        const refreshed = await this.refreshAccessToken(account);
        if (refreshed) {
          return { account: refreshed, token: refreshed.access_token };
        }
      }
    }

    return { account, token: account.access_token };
  }
};
