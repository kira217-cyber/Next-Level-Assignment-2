import { StatusCodes } from "http-status-codes";

import { pool } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

type IssueType = "bug" | "feature_request";
type IssueStatus = "open" | "in_progress" | "resolved";
type UserRole = "contributor" | "maintainer";

interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
}

interface RequestUser {
  id: number;
  name: string;
  role: UserRole;
}

interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

const createIssue = async (payload: CreateIssuePayload, reporterId: number) => {
  const { title, description, type } = payload;

  if (!title?.trim() || !description?.trim() || !type) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title, description and type are required",
    );
  }

  if (title.length > 150) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title must be within 150 characters",
    );
  }

  if (description.trim().length < 20) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Description must be at least 20 characters",
    );
  }

  if (!["bug", "feature_request"].includes(type)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Type must be bug or feature_request",
    );
  }

  const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [
    reporterId,
  ]);

  if (userResult.rows.length === 0) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Reporter user does not exist",
    );
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title.trim(), description.trim(), type, reporterId],
  );

  return result.rows[0];
};

const getAllIssues = async (sort: string, type?: string, status?: string) => {
  let query = `
    SELECT
      id,
      title,
      description,
      type,
      status,
      reporter_id,
      created_at,
      updated_at
    FROM issues
  `;

  const conditions: string[] = [];
  const values: string[] = [];

  if (type) {
    if (!["bug", "feature_request"].includes(type)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid issue type");
    }

    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    if (!["open", "in_progress", "resolved"].includes(status)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid issue status");
    }

    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += `
    ORDER BY created_at ${sort === "oldest" ? "ASC" : "DESC"}
  `;

  const issueResult = await pool.query(query, values);
  const issues = issueResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  const userResult = await pool.query(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
    `,
    [reporterIds],
  );

  const users = userResult.rows;

  return issues.map((issue) => {
    const reporter = users.find((user) => user.id === issue.reporter_id);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporter || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
};

const getSingleIssue = async (id: number) => {
  const issueResult = await pool.query(
    `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = $1
    `,
    [id],
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const userResult = await pool.query(
    `
      SELECT id, name, role
      FROM users
      WHERE id = $1
    `,
    [issue.reporter_id],
  );

  const reporter = userResult.rows[0] || null;

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssue = async (
  issueId: number,
  payload: UpdateIssuePayload,
  user: RequestUser,
) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    issueId,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  if (user.role !== "maintainer") {
    if (issue.reporter_id !== user.id) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You can only update your own issue",
      );
    }

    if (issue.status !== "open") {
      throw new AppError(
        StatusCodes.CONFLICT,
        "Only open issues can be updated by contributor",
      );
    }

    if (payload.status) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Only maintainer can update issue status",
      );
    }
  }

  const title = payload.title ?? issue.title;
  const description = payload.description ?? issue.description;
  const type = payload.type ?? issue.type;
  const status =
    user.role === "maintainer"
      ? (payload.status ?? issue.status)
      : issue.status;

  if (!title?.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Title is required");
  }

  if (title.length > 150) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Title cannot exceed 150 characters",
    );
  }

  if (!description?.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Description is required");
  }

  if (description.trim().length < 20) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Description must be at least 20 characters",
    );
  }

  if (!["bug", "feature_request"].includes(type)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid issue type");
  }

  if (!["open", "in_progress", "resolved"].includes(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid issue status");
  }

  const result = await pool.query(
    `
      UPDATE issues
      SET title = $1,
          description = $2,
          type = $3,
          status = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
    [title.trim(), description.trim(), type, status, issueId],
  );

  return result.rows[0];
};

const deleteIssue = async (issueId: number) => {
  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id = $1
      RETURNING id
    `,
    [issueId],
  );

  if (result.rows.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  return null;
};

export const IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

