import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import InterviewReport from "../models/interviewReport.model.js";
import { extractTextFromResume } from "../services/document.service.js";
import { generateInterviewReport, generateResumePdf } from "../services/ai.service.js";

const generateInterviewReportController = asyncHandler(async (req, res) => {
  const { selfDescription = "", jobDescription = "" } = req.body;
  const resumeText = req.file ? await extractTextFromResume(req.file) : "";

  if (!jobDescription.trim()) {
    throw new apiError(400, "Job description is required");
  }

  if (!resumeText.trim() && !selfDescription.trim()) {
    throw new apiError(400, "Upload a resume or provide a self description");
  }

  const aiReport = await generateInterviewReport({
    resume: resumeText,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await InterviewReport.create({
    user: req.user._id,
    resume: resumeText,
    selfDescription,
    jobDescription,
    ...aiReport,
  });

  return res
    .status(201)
    .json(new apiResponse(201, { interviewReport }, "Interview report generated successfully"));
});

const getInterviewReportByIdController = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  const interviewReport = await InterviewReport.findOne({
    _id: interviewId,
    user: req.user._id,
  });

  if (!interviewReport) {
    throw new apiError(404, "Interview report not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { interviewReport }, "Interview report fetched successfully"));
});

const getAllInterviewReportsController = asyncHandler(async (req, res) => {
  const interviewReports = await InterviewReport.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("-resume -selfDescription -jobDescription -__v");

  return res
    .status(200)
    .json(new apiResponse(200, { interviewReports }, "Interview reports fetched successfully"));
});

const generateResumePdfController = asyncHandler(async (req, res) => {
  const { interviewReportId } = req.params;

  const interviewReport = await InterviewReport.findOne({
    _id: interviewReportId,
    user: req.user._id,
  });

  if (!interviewReport) {
    throw new apiError(404, "Interview report not found");
  }

  const pdfBuffer = await generateResumePdf({
    resume: interviewReport.resume || "",
    jobDescription: interviewReport.jobDescription,
    selfDescription: interviewReport.selfDescription || "",
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  return res.send(pdfBuffer);
});

export {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
