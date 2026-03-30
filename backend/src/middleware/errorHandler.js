import { createErrorResponse, sendResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return sendResponse(res, 400, createErrorResponse('Validation error'));
  }

  if (err.name === 'CastError') {
    return sendResponse(res, 400, createErrorResponse('Invalid ID format'));
  }

  if (err.code === 11000) {
    return sendResponse(res, 409, createErrorResponse('Resource already exists'));
  }

  // Default error
  sendResponse(res, 500, createErrorResponse('Internal server error'));
};

export const notFoundHandler = (req, res) => {
  sendResponse(res, 404, createErrorResponse('Route not found'));
};
