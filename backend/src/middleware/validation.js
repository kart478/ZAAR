import { createErrorResponse, sendResponse } from '../utils/response.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error.errors) {
        const errorMessages = error.errors.map(err => err.message);
        return sendResponse(res, 400, createErrorResponse(errorMessages.join(', '), 400));
      }
      return sendResponse(res, 400, createErrorResponse(error.message, 400));
    }
  };
};

// Alias for validate to match the import name
export const validateBody = validate;

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error.errors) {
        const errorMessages = error.errors.map(err => err.message);
        return sendResponse(res, 400, createErrorResponse(errorMessages.join(', '), 400));
      }
      return sendResponse(res, 400, createErrorResponse(error.message, 400));
    }
  };
};
