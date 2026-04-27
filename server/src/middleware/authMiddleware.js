import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorised, no token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'business-nexus',
      audience: 'business-nexus-users'
    });

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorised, user not found');
    }

    req.user = user;
    next();
  } catch {
    res.status(401);
    next(new Error('Not authorised, invalid token'));
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorised'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Access denied: insufficient permissions'));
    }

    next();
  };
};
