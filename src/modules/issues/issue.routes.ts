import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { IssueController } from "./issue.controller.js";
import roleMiddleware from "../../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, IssueController.createIssue);
router.get("/", IssueController.getAllIssues);
router.get("/:id", IssueController.getSingleIssue);
router.patch("/:id", authMiddleware, IssueController.updateIssue);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("maintainer"),
  IssueController.updateIssueStatus,
);

export const IssueRoutes = router;
