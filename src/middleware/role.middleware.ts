import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";

import AppError from "../utils/AppError.js";

type UserRole = "contributor" | "maintainer";

const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have permission");
    }

    next();
  };
};

export default roleMiddleware;
