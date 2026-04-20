import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
  },
  { _id: false },
);

const preparationPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    focus: { type: String, required: true },
    tasks: [{ type: String, required: true }],
  },
  { _id: false },
);

const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: { type: String, required: true },
    resume: { type: String, default: "" },
    selfDescription: { type: String, default: "" },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    technicalQuestions: [questionSchema],
    behavioralQuestions: [questionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
  },
  { timestamps: true },
);

const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);

export default InterviewReport;
