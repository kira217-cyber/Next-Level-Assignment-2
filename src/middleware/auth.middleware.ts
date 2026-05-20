import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError.js";

interface JwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Authorization token is required",
    );
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "JWT secret is not configured",
    );
  }

  const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

  req.user = decoded;

  next();
};

export default authMiddleware;
