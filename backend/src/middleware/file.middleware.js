import multer from "multer";
import { apiError } from "../utils/apiError.js";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new apiError(400, "Only PDF and DOCX files are allowed"));
      return;
    }
    callback(null, true);
  },
});

export default upload;
