import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/userModel.js';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || '247080342250-gknlddsc3icjiticu6uqjq31fjq21fq8.apps.googleusercontent.com',
  process.env.GOOGLE_CLIENT_SECRET || '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'
);

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nexora_default_jwt_secret_key',
    { expiresIn: '30d' }
  );
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

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
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

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
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

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
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
      const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liM5dNvXngFXio8t';
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || '5988278d28c1ea5bb7fa2f15c4856babd390df24';

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

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
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
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${clientUrl}/signin?error=No+GitHub+code+provided`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liM5dNvXngFXio8t';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '5988278d28c1ea5bb7fa2f15c4856babd390df24';

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

    const token = generateToken(user.id);

    return res.redirect(`${clientUrl}/dashboard?token=${encodeURIComponent(token)}`);
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
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatar_url,
        createdAt: req.user.created_at
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user'
    });
  }
};

