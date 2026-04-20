import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { apiError } from "../utils/apiError.js";

const normalizeText = (text = "") => text.replace(/\s+/g, " ").trim();

const extractTextFromResume = async (file) => {
  if (!file?.buffer) {
    return "";
  }

  const mimeType = file.mimetype;

  if (mimeType === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return normalizeText(parsed.text);
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeText(value);
  }

  throw new apiError(400, "Only PDF and DOCX resumes are supported");
};

export { extractTextFromResume };
