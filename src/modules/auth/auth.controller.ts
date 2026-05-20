import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";

const signup = catchAsync(async (req, res) => {
  const user = await AuthService.signupUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User registered successfully",
    data: user,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Login successful",
    data: result,
  });
});

export const AuthController = {
  signup,
  login,
};
