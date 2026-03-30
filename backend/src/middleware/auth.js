import { verifyAccessToken } from '../utils/jwt.js';
import { store } from '../data/store.js';
import { createErrorResponse, sendResponse } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, createErrorResponse('Access token required'));
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    const user = store.users.get(decoded.userId);
    if (!user) {
      return sendResponse(res, 401, createErrorResponse('User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, createErrorResponse('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, createErrorResponse('Invalid token'));
    }
    return sendResponse(res, 500, createErrorResponse('Authentication error'));
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return sendResponse(res, 403, createErrorResponse('Admin access required'));
  }
  next();
};

export const requireCommunityRole = (roles = ['owner', 'moderator']) => {
  return (req, res, next) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    const membership = store.memberships.get(`${communityId}-${userId}`);
    
    if (!membership || !roles.includes(membership.role)) {
      return sendResponse(res, 403, createErrorResponse('Insufficient permissions for this community'));
    }

    req.membership = membership;
    next();
  };
};
