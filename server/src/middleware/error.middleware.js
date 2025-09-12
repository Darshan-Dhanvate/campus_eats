/**
 * @description Handles requests to routes that do not exist.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * @description A centralized error handling middleware.
 * This function catches all errors from the controllers and sends a structured JSON response.
 * It also handles specific Mongoose errors like CastError for invalid ObjectIds.
 * @param {Error} err - The error object.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come in with a 200 status code, so we set a default
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Check for specific Mongoose errors to provide a cleaner message
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  res.status(statusCode).json({
    message: message,
    // In development mode, include the stack trace for easier debugging.
    // In production, this should be omitted for security.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };

