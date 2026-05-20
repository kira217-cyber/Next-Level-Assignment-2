import type { Response } from "express";

interface TResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  statusCode: number;
}

const sendResponse = <T>(res: Response, payload: TResponse<T>): void => {
  const { success, message, data, errors, statusCode } = payload;

  res.status(statusCode).json({
    success,
    message,
    data,
    errors,
  });
};

export default sendResponse;
