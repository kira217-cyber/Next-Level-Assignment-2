import cors from "cors";
import express from "express";
import type { Request, Response } from "express";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API is running",
  });
});

export default app;
