import { StatusCodes } from "http-status-codes";
import type { ErrorRequestHandler } from "express";

import AppError from "../utils/AppError.js";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let errors: unknown = error;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorMiddleware;
