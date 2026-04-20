import { api, extractApiData } from "../../../lib/api.js";

const getErrorMessage = (err) => err?.response?.data?.message || err?.message || "Request failed";

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
  try {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    const response = await api.post("/api/v1/interviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const getInterviewReportById = async (interviewId) => {
  try {
    const response = await api.get(`/api/v1/interviews/${interviewId}`);
    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const getAllInterviewReports = async () => {
  try {
    const response = await api.get("/api/v1/interviews");
    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const generateResumePdf = async ({ interviewReportId }) => {
  try {
    const response = await api.post(`/api/v1/interviews/${interviewReportId}/resume-pdf`, null, {
      responseType: "blob",
    });
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};
