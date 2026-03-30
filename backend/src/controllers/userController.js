import { store } from '../data/store.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

export const getProfile = async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    sendResponse(res, 200, createSuccessResponse(userWithoutPassword, 'Profile retrieved successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to retrieve profile'));
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, interests, avatarUrl } = req.body;
    const userId = req.user.id;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = Array.from(store.users.values()).find(
        user => user.username === username && user.id !== userId
      );
      if (existingUser) {
        return sendResponse(res, 409, createErrorResponse('Username already taken'));
      }
    }

    // Update user
    const user = store.users.get(userId);
    if (name) user.name = name;
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (interests !== undefined) user.interests = interests;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    store.users.set(userId, user);

    const { password: _, ...userWithoutPassword } = user;
    sendResponse(res, 200, createSuccessResponse(userWithoutPassword, 'Profile updated successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to update profile'));
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = store.users.get(userId);
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return sendResponse(res, 400, createErrorResponse('Current password is incorrect'));
    }

    // Hash and update new password
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    store.users.set(userId, user);

    sendResponse(res, 200, createSuccessResponse(null, 'Password changed successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to change password'));
  }
};
