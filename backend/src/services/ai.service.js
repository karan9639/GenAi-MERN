import { GoogleGenAI, Type } from "@google/genai";
import puppeteer from "puppeteer";
import { apiError } from "../utils/apiError.js";

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
const getModel = () => process.env.GENAI_MODEL || "gemini-2.5-flash";

const interviewReportResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    matchScore: { type: Type.NUMBER },
    technicalQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          focus: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

const getClient = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new apiError(500, "GEMINI_API_KEY is missing in backend .env");
  }

  return new GoogleGenAI({ apiKey });
};

const extractJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new apiError(500, "AI returned an invalid JSON response");
    }
    return JSON.parse(match[0]);
  }
};

const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {
  const prompt = `You are an expert interview coach.
Return valid JSON only.

Create an interview preparation report using the information below.
- Keep the matchScore between 0 and 100.
- Give 6 technical questions.
- Give 5 behavioral questions.
- Give 3 to 6 skill gaps.
- Give a 7 day preparation plan.
- Infer a concise job title from the job description.

Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}`;

  const response = await getClient().models.generateContent({
    model: getModel(),
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewReportResponseSchema,
      temperature: 0.4,
    },
  });

  return extractJson(response.text);
};

const buildResumeHtml = ({ headline, summary, strengths, experience, skills }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 32px; }
      h1 { margin: 0 0 8px; font-size: 28px; }
      h2 { margin: 20px 0 8px; font-size: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
      p, li { font-size: 12px; line-height: 1.6; }
      ul { padding-left: 18px; }
      .muted { color: #4b5563; }
      .badge { display: inline-block; margin-right: 8px; margin-bottom: 8px; padding: 4px 8px; background: #f3f4f6; border-radius: 999px; font-size: 11px; }
    </style>
  </head>
  <body>
    <h1>${headline}</h1>
    <p class="muted">Tailored resume generated from your profile and target role.</p>
    <h2>Professional Summary</h2>
    <p>${summary}</p>
    <h2>Core Strengths</h2>
    <div>${strengths.map((item) => `<span class="badge">${item}</span>`).join("")}</div>
    <h2>Relevant Experience Highlights</h2>
    <ul>${experience.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h2>Skills</h2>
    <ul>${skills.map((item) => `<li>${item}</li>`).join("")}</ul>
  </body>
</html>`;

const generateResumePdf = async ({ resume, selfDescription, jobDescription }) => {
  const prompt = `You are a resume writer.
Return valid JSON only with this shape:
{
  "headline": string,
  "summary": string,
  "strengths": string[],
  "experience": string[],
  "skills": string[]
}

Build a concise ATS-friendly resume draft tailored to the target role.
Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}`;

  const response = await getClient().models.generateContent({
    model: getModel(),
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const resumeJson = extractJson(response.text);
  const html = buildResumeHtml({
    headline: resumeJson.headline || "Candidate Resume",
    summary: resumeJson.summary || "",
    strengths: Array.isArray(resumeJson.strengths) ? resumeJson.strengths : [],
    experience: Array.isArray(resumeJson.experience) ? resumeJson.experience : [],
    skills: Array.isArray(resumeJson.skills) ? resumeJson.skills : [],
  });

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
  });
  await browser.close();
  return pdfBuffer;
};

export { generateInterviewReport, generateResumePdf };
