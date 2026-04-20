import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import upload from "../middleware/file.middleware.js";
import {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
} from "../controllers/interview.controller.js";

const router = Router();

router.post("/", authUser, upload.single("resume"), generateInterviewReportController);
router.get("/", authUser, getAllInterviewReportsController);
router.get("/:interviewId", authUser, getInterviewReportByIdController);
router.post("/:interviewReportId/resume-pdf", authUser, generateResumePdfController);

export default router;
