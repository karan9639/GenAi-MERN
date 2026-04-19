import express, {urlencoded} from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({
    path: "./.env"
});

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
};

app.use(cors(corsOptions)); // Enable CORS with the specified options
app.use(express.urlencoded({extended: true})); // To parse URL-encoded data from the request body specially for form submissions
app.use(express.json()); // To parse JSON data from the request body, which is common for API requests
app.use(cookieParser()); // To parse cookies from the incoming requests, allowing you to access them via req.cookies in your route handlers
app.use(express.static("public")); // To serve static files from the "public" directory, allowing you to access them via URLs like http://yourdomain.com/filename.ext

import authRoute from "./routes/auth.routes.js";


app.use("/api/v1/auth", authRoute); // Mount the auth routes at the /api/v1/auth path, so all routes defined in auth.routes.js will be prefixed with /api/v1/auth

export {app};