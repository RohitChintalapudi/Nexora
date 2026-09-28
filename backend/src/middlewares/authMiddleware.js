import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'nexora_default_jwt_secret_key'
      );

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Determine auth provider from token or user record
      let authProvider = decoded.authProvider;
      if (!authProvider) {
        if (!user.password || user.password.length === 0) {
          if (user.google_id) authProvider = 'google';
          else if (user.github_id) authProvider = 'github';
          else authProvider = 'oauth';
        } else {
          authProvider = 'email';
        }
      }

      req.user = user;
      req.authProvider = authProvider;
      req.user.authProvider = authProvider;
      req.user.loginMethod = authProvider;
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
