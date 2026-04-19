import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { accessTokenOptions, refreshTokenOptions } from "../constant.js";

const registerUser = asyncHandler(async (req, res) => {
  let { fullname, username, email, password, confirmPassword } = req.body;

  // ✅ Trim validation (important)
  if (
    [fullname, username, email, password, confirmPassword].some(
      (field) => !field?.trim(),
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  // ✅ Normalize
  email = email.toLowerCase();
  username = username.toLowerCase();

  // ✅ Password match check
  if (password !== confirmPassword) {
    throw new apiError(400, "Passwords do not match");
  }

  // ✅ Check existing user
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new apiError(409, "User already exists");
  }

  // ✅ Create user (password hashed automatically via pre-save)
  const user = await User.create({
    fullname,
    username,
    email,
    password,
  });

  // ✅ Remove sensitive data (no extra DB call)
  const createdUser = user.toObject();
  delete createdUser.password;
  delete createdUser.refreshToken;

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  console.log("Login request body:", req.body); // Debugging line to check incoming data
  const { email, username, password } = req.body;

  if(!email && !username){
    throw new apiError(400, "Email or username is required");
  }
  if(!password){
    throw new apiError(400, "Password is required");
  }

  // ✅ Find user by email or username
  const user = await User.findOne({
    $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }],
  });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  // ✅ Check password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new apiError(401, "Invalid credentials");
  }

  // ✅ Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // ✅ Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  // ✅ Set cookies
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  // ✅ Remove sensitive data
  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  return res
    .status(200)
    .json(new apiResponse(200, loggedInUser, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new apiError(400, "Refresh token is required");
  }

  // ✅ Find user by refresh token
  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  // ✅ Clear refresh token in DB
  user.refreshToken = null;
  await user.save();

  // ✅ Clear cookies
  res.clearCookie("accessToken", accessTokenOptions);
  res.clearCookie("refreshToken", refreshTokenOptions);

  return res
    .status(200)
    .json(new apiResponse(200, null, "Logout successful"));
});

export { registerUser, loginUser, logoutUser };
