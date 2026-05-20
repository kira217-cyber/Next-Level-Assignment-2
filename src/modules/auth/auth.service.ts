import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db.js";
import AppError from "../../utils/AppError.js";

type UserRole = "contributor" | "maintainer";

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

const signupUser = async (payload: SignupPayload) => {
  const { name, email, password, role = "contributor" } = payload;

  if (!name || !email || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Name, email and password are required",
    );
  }

  if (!["contributor", "maintainer"].includes(role)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Role must be contributor or maintainer",
    );
  }

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email.toLowerCase(), hashedPassword, role],
  );

  return result.rows[0];
};

const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Email and password are required",
    );
  }

  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "JWT secret is not configured",
    );
  }

  const signOptions: SignOptions = {
    expiresIn: "7d",
  };

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    jwtSecret,
    signOptions,
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const AuthService = {
  signupUser,
  loginUser,
};
