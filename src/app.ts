import cors from "cors";
import express from "express";
import type { Request, Response } from "express";

import errorMiddleware from "./middleware/error.middleware.js";
import { AuthRoutes } from "./modules/auth/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API is running",
  });
});

app.use("/api/auth", AuthRoutes);

app.use(errorMiddleware);

export default app;
