import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/userModel.js';
import { GithubAccountModel } from '../models/githubAccountModel.js';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nexora_default_jwt_secret_key',
    { expiresIn: '30d' }
  );
};

/**
 * Format user response object with integrated GitHub connection status
 */
const getUserProfile = async (user) => {
  let githubConnected = false;
  let githubUsername = null;

  try {
    const ghAcc = await GithubAccountModel.findByUserId(user.id);
    if (ghAcc && ghAcc.access_token) {
      githubConnected = true;
      githubUsername = ghAcc.username || null;
    }
  } catch (err) {
    console.warn('Could not query GitHub account status for user:', err.message);
  }

  const hasPassword = Boolean(user.password && user.password.length > 0);
  let authProvider = 'email';
  if (!hasPassword) {
    if (user.google_id) authProvider = 'google';
    else if (user.github_id) authProvider = 'github';
    else authProvider = 'oauth';
  }

  const finalGithubUsername = githubUsername || user.github_username || null;
  const xUsername = user.x_username || null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    githubConnected,
    githubUsername: finalGithubUsername,
    xUsername,
    hasPassword,
    authProvider
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in DB
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(user.id);
    const userProfile = await getUserProfile({ ...user, password: hashedPassword });

    return res.status(201).json({
      success: true,
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user.id);
    const userProfile = await getUserProfile(user);

    return res.status(200).json({
      success: true,
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    let payload = null;

    if (credential) {
      // ID Token verification from Google Identity Services
      const clientId = process.env.GOOGLE_CLIENT_ID || '247080342250-gknlddsc3icjiticu6uqjq31fjq21fq8.apps.googleusercontent.com';
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      payload = ticket.getPayload();
    } else if (accessToken) {
      // Access Token verification
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch Google profile with access token');
      }
      payload = await response.json();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account did not return a valid email address'
      });
    }

    const { sub: googleId, email, name, picture: avatarUrl } = payload;

    const user = await UserModel.upsertGoogleUser({
      name: name || email.split('@')[0],
      email,
      googleId: googleId || payload.id || `google_${Date.now()}`,
      avatarUrl
    });

    const token = generateToken(user.id);
    const userProfile = await getUserProfile(user);

    return res.status(200).json({
      success: true,
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Google authentication'
    });
  }
};

export const githubAuth = async (req, res) => {
  try {
    let { code, accessToken } = req.body;

    if (!code && !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub authorization code or access token is required'
      });
    }

    if (code && !accessToken) {
      // Exchange code for access token with GitHub
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('GitHub OAuth credentials are not fully configured on the server');
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub authorization code');
      }

      accessToken = tokenData.access_token;
    }

    // Fetch user profile from GitHub API
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Nexora-App'
      }
    });

    if (!userRes.ok) {
      throw new Error('Failed to retrieve GitHub user profile');
    }

    const ghUser = await userRes.json();
    let email = ghUser.email;

    // If email is not public on GitHub profile, retrieve primary verified email from emails endpoint
    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'Nexora-App'
          }
        });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
          if (primary) email = primary.email;
        }
      } catch (err) {
        console.warn('Could not fetch GitHub user emails:', err.message);
      }
    }

    if (!email) {
      email = `${ghUser.login}@users.noreply.github.com`;
    }

    const user = await UserModel.upsertGithubUser({
      name: ghUser.name || ghUser.login,
      email,
      githubId: String(ghUser.id),
      avatarUrl: ghUser.avatar_url
    });

    // Auto-link GitHub account credentials in github_accounts table
    try {
      await GithubAccountModel.upsert({
        userId: user.id,
        githubUserId: ghUser.id,
        username: ghUser.login,
        accessToken,
        scopes: 'repo,read:user,user:email'
      });
      console.log(`✅ Auto-linked GitHub @${ghUser.login} for user #${user.id} during GitHub login`);
    } catch (ghAccErr) {
      console.warn('Could not auto-link github_accounts on GitHub login:', ghAccErr.message);
    }

    const token = generateToken(user.id);
    const userProfile = await getUserProfile(user);

    return res.status(200).json({
      success: true,
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('GitHub Auth error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during GitHub authentication'
    });
  }
};

export const githubCallback = async (req, res) => {
  // If state is present, delegate to githubController for M2 repository authorization
  if (req.query.state) {
    const { githubController } = await import('./githubController.js');
    return githubController.callback(req, res);
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${clientUrl}/signin?error=No+GitHub+code+provided`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials are not fully configured on the server');
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub authorization code');
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Nexora-App'
      }
    });

    if (!userRes.ok) {
      throw new Error('Failed to retrieve GitHub user profile');
    }

    const ghUser = await userRes.json();
    let email = ghUser.email;

    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'Nexora-App'
          }
        });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
          if (primary) email = primary.email;
        }
      } catch (err) {
        console.warn('Could not fetch GitHub user emails:', err.message);
      }
    }

    if (!email) {
      email = `${ghUser.login}@users.noreply.github.com`;
    }

    const user = await UserModel.upsertGithubUser({
      name: ghUser.name || ghUser.login,
      email,
      githubId: String(ghUser.id),
      avatarUrl: ghUser.avatar_url
    });

    // Auto-link GitHub account credentials in github_accounts table
    try {
      await GithubAccountModel.upsert({
        userId: user.id,
        githubUserId: ghUser.id,
        username: ghUser.login,
        accessToken,
        scopes: 'repo,read:user,user:email'
      });
      console.log(`✅ Auto-linked GitHub @${ghUser.login} for user #${user.id} during GitHub callback`);
    } catch (ghAccErr) {
      console.warn('Could not auto-link github_accounts on GitHub callback:', ghAccErr.message);
    }

    const token = generateToken(user.id);

    return res.redirect(`${clientUrl}/dashboard?token=${encodeURIComponent(token)}&github_connected=true&github_username=${encodeURIComponent(ghUser.login)}`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    return res.redirect(`${clientUrl}/signin?error=${encodeURIComponent(error.message || 'GitHub authentication failed')}`);
  }
};

export const googleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${clientUrl}/signin?error=No+Google+code+provided`);
    }

    const redirectUri = 'http://localhost:5000/api/auth/google/callback';
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: redirectUri
    });

    let payload = null;
    if (tokens.id_token) {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID || '247080342250-gknlddsc3icjiticu6uqjq31fjq21fq8.apps.googleusercontent.com'
      });
      payload = ticket.getPayload();
    } else if (tokens.access_token) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      payload = await userRes.json();
    }

    if (!payload || !payload.email) {
      throw new Error('Could not retrieve Google profile');
    }

    const { sub: googleId, email, name, picture: avatarUrl } = payload;

    const user = await UserModel.upsertGoogleUser({
      name: name || email.split('@')[0],
      email,
      googleId: googleId || payload.id || `google_${Date.now()}`,
      avatarUrl
    });

    const token = generateToken(user.id);

    return res.redirect(`${clientUrl}/dashboard?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${clientUrl}/signin?error=${encodeURIComponent(error.message || 'Google authentication failed')}`);
  }
};

export const getMe = async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user);
    return res.status(200).json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was authenticated using OAuth (Google/GitHub) and does not have an active password.'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is identical to current password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.updatePassword(userId, hashedPassword);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating password'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, githubUsername, xUsername } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Display name must be at least 2 characters long'
        });
      }
    }

    // Clean up social handles if full URLs were pasted
    const cleanGithub = githubUsername !== undefined
      ? (githubUsername ? githubUsername.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '') : '')
      : undefined;

    const cleanX = xUsername !== undefined
      ? (xUsername ? xUsername.trim().replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '').replace(/^@/, '') : '')
      : undefined;

    const updatedUser = await UserModel.updateProfile(userId, {
      name: name !== undefined ? name.trim() : undefined,
      githubUsername: cleanGithub,
      xUsername: cleanX
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    const profile = await getUserProfile(updatedUser);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating profile'
    });
  }
};

