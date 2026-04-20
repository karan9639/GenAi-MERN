import { useCallback, useContext, useEffect } from "react";
import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
  generateResumePdf,
} from "../services/interview.api.js";
import { InterviewContext } from "../interview.context.jsx";
import { useParams } from "react-router";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  const { interviewId } = useParams();

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports, error, setError } = context;

  const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true);
    setError("");
    try {
      const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (err) {
      setError(err.message || "Failed to generate report");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setReport]);

  const getReportById = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await getInterviewReportById(id);
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (err) {
      setError(err.message || "Failed to fetch report");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setReport]);

  const getReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllInterviewReports();
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (err) {
      setError(err.message || "Failed to fetch reports");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setReports]);

  const getResumePdf = useCallback(async (interviewReportId) => {
    setLoading(true);
    setError("");
    try {
      const blob = await generateResumePdf({ interviewReportId });
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to generate resume PDF");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  useEffect(() => {
    const run = async () => {
      try {
        if (interviewId) {
          await getReportById(interviewId);
        } else {
          await getReports();
        }
      } catch (error) {
        console.error(error);
      }
    };

    run();
  }, [getReportById, getReports, interviewId]);

  return { loading, error, report, reports, generateReport, getReportById, getReports, getResumePdf };
};
