/**
 * A higher-order function to wrap async route handlers and catch errors.
 * This avoids the need for repetitive try-catch blocks in every async controller.
 * @param {Function} requestHandler - The asynchronous controller function to execute.
 * @returns {Function} A new function that handles promise rejections and passes them to Express's error handling middleware.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

