import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import { IssueService } from "./issue.service.js";

const createIssue = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
  }

  const issue = await IssueService.createIssue(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Issue created successfully",
    data: issue,
  });
});

const getAllIssues = catchAsync(async (req, res) => {
  const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";

  const type = typeof req.query.type === "string" ? req.query.type : undefined;

  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;

  const issues = await IssueService.getAllIssues(sort, type, status);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: issues,
  });
});

const getSingleIssue = catchAsync(async (req, res) => {
  const issue = await IssueService.getSingleIssue(Number(req.params.id));

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: issue,
  });
});

export const IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
};
