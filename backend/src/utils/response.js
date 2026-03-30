export const createSuccessResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    data,
    message,
    meta
  };
};

export const createErrorResponse = (message, statusCode = 500) => {
  return {
    success: false,
    error: {
      message,
      statusCode
    }
  };
};

export const sendResponse = (res, statusCode, response) => {
  res.status(statusCode).json(response);
};
