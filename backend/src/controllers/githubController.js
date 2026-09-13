import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { GithubAccountModel } from '../models/githubAccountModel.js';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API = 'https://api.github.com/user';
const GITHUB_SCOPES = 'repo,read:user,user:email';

/**
 * Robust fetch with timeout and retries for resilient API communication with GitHub
 */
async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      // Short backoff before retry on socket drops
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

export const githubController = {
  /**
   * Start GitHub OAuth flow for an authenticated NEXORA user
   * GET /api/github/connect
   */
  async connect(req, res) {
    try {
      const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liM5dNvXngFXio8t';
      const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

      if (!clientId) {
        return res.status(500).json({
          success: false,
          message: 'GITHUB_CLIENT_ID is not configured on the server'
        });
      }

      // Generate cryptographically signed state bound to this user ID
      const state = jwt.sign(
        {
          userId: req.user.id,
          nonce: crypto.randomBytes(16).toString('hex'),
          type: 'github_connect'
        },
        process.env.JWT_SECRET || 'nexora_default_jwt_secret_key',
        { expiresIn: '15m' }
      );

      const authUrl = `${GITHUB_AUTH_URL}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent(GITHUB_SCOPES)}&state=${encodeURIComponent(state)}`;

      // Return URL if requested as JSON, otherwise redirect
      if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
        return res.status(200).json({
          success: true,
          url: authUrl
        });
      }

      return res.redirect(authUrl);
    } catch (error) {
      console.error('Error initiating GitHub connect flow:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate GitHub authorization'
      });
    }
  },

  /**
   * GitHub OAuth callback handler
   * GET /api/github/callback or GET /api/auth/github/callback
   */
  async callback(req, res) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const { code, state, error, error_description } = req.query;

    // Handle user cancellation or OAuth error from GitHub
    if (error) {
      console.warn('GitHub authorization returned error:', error, error_description);
      let userFriendlyMessage = 'GitHub authorization was cancelled or interrupted';
      if (error === 'access_denied') {
        userFriendlyMessage = 'GitHub authorization was cancelled';
      } else if (error_description) {
        userFriendlyMessage = error_description;
      }
      return res.redirect(`${clientUrl}/dashboard?github_error=${encodeURIComponent(userFriendlyMessage)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientUrl}/dashboard?github_error=${encodeURIComponent('Missing authorization code or state parameter. Please try connecting again.')}`);
    }

    try {
      // Validate cryptographic OAuth state
      let decodedState;
      try {
        decodedState = jwt.verify(
          state,
          process.env.JWT_SECRET || 'nexora_default_jwt_secret_key'
        );
      } catch (err) {
        console.warn('Invalid or expired OAuth state token:', err.message);
        return res.redirect(`${clientUrl}/dashboard?github_error=${encodeURIComponent('Authorization session expired. Please try connecting again.')}`);
      }

      if (decodedState.type !== 'github_connect' || !decodedState.userId) {
        return res.redirect(`${clientUrl}/dashboard?github_error=${encodeURIComponent('Invalid authorization state. Please try connecting again.')}`);
      }

      const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liM5dNvXngFXio8t';
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || '5988278d28c1ea5bb7fa2f15c4856babd390df24';
      const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

      if (!clientId || !clientSecret) {
        throw new Error('Server GitHub OAuth credentials are not fully configured');
      }

      // Exchange authorization code for access token with retries
      const tokenResponse = await fetchWithRetry(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error || !tokenData.access_token) {
        const errorDetail = tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for token';
        throw new Error(errorDetail);
      }

      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token || null;
      const tokenExpiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000) 
        : null;
      const scopes = tokenData.scope || GITHUB_SCOPES;

      // Fetch authenticated GitHub user identity
      const userResponse = await fetchWithRetry(GITHUB_USER_API, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Nexora-App'
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to retrieve GitHub profile (HTTP ${userResponse.status})`);
      }

      const ghUser = await userResponse.json();

      // Securely store GitHub authorization in PostgreSQL
      await GithubAccountModel.upsert({
        userId: decodedState.userId,
        githubUserId: ghUser.id,
        username: ghUser.login,
        accessToken,
        refreshToken,
        tokenExpiresAt,
        scopes
      });

      console.log(`✅ GitHub account @${ghUser.login} successfully linked to NEXORA User ID: ${decodedState.userId}`);

      return res.redirect(`${clientUrl}/dashboard?github_connected=true&github_username=${encodeURIComponent(ghUser.login)}`);
    } catch (err) {
      console.error('Error during GitHub OAuth callback processing:', err);
      let friendlyError = 'GitHub connection failed. Please try connecting again.';
      if (err.message) {
        if (err.message.includes('terminated') || err.message.includes('fetch failed')) {
          friendlyError = 'Network connection to GitHub was interrupted. Please try clicking Connect GitHub again.';
        } else {
          friendlyError = err.message;
        }
      }
      return res.redirect(`${clientUrl}/dashboard?github_error=${encodeURIComponent(friendlyError)}`);
    }
  },

  /**
   * Get GitHub connection status for authenticated user
   * GET /api/github/status
   */
  async getStatus(req, res) {
    try {
      const account = await GithubAccountModel.findByUserId(req.user.id);

      if (!account) {
        return res.status(200).json({
          success: true,
          connected: false
        });
      }

      return res.status(200).json({
        success: true,
        connected: true,
        githubUsername: account.username,
        scopes: account.scopes,
        connectedAt: account.created_at
      });
    } catch (error) {
      console.error('Error fetching GitHub status:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve GitHub connection status'
      });
    }
  },

  /**
   * Disconnect GitHub authorization for authenticated user
   * DELETE /api/github/disconnect
   */
  async disconnect(req, res) {
    try {
      const deleted = await GithubAccountModel.deleteByUserId(req.user.id);

      return res.status(200).json({
        success: true,
        message: deleted 
          ? 'GitHub connection removed successfully' 
          : 'No active GitHub connection found'
      });
    } catch (error) {
      console.error('Error disconnecting GitHub account:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to disconnect GitHub account'
      });
    }
  }
};
