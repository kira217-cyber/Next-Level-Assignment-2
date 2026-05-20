import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { IssueController } from "./issue.controller.js";
import roleMiddleware from "../../middleware/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, IssueController.createIssue);
router.get("/", IssueController.getAllIssues);
router.get("/:id", IssueController.getSingleIssue);
router.patch("/:id", authMiddleware, IssueController.updateIssue);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("maintainer"),
  IssueController.deleteIssue,
);

export const IssueRoutes = router;
