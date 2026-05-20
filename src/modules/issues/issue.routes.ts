import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { IssueController } from "./issue.controller.js";

const router = express.Router();

router.post("/", authMiddleware, IssueController.createIssue);
router.get("/", IssueController.getAllIssues);
router.get("/:id", IssueController.getSingleIssue);

export const IssueRoutes = router;
