import { User } from "../models/user.model.js";
import { BlackList } from "../models/blacklist.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { accessTokenOptions, refreshTokenOptions } from "../constant.js";

const sanitizeUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  delete safeUser.refreshToken;
  delete safeUser.__v;
  return safeUser;
};

const registerUser = asyncHandler(async (req, res) => {
  let { fullname, username, email, password, confirmPassword } = req.body;

  if (
    [fullname, username, email, password, confirmPassword].some(
      (field) => !String(field || "").trim(),
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new apiError(400, "Passwords do not match");
  }

  email = email.trim().toLowerCase();
  username = username.trim().toLowerCase();
  fullname = fullname.trim();

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new apiError(409, "User already exists");
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
  });

  return res
    .status(201)
    .json(new apiResponse(201, { user: sanitizeUser(user) }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new apiError(400, "Email or username is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedUsername = username?.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  return res
    .status(200)
    .json(new apiResponse(200, { user: sanitizeUser(user) }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { $unset: { refreshToken: 1 } });
  }

  if (accessToken) {
    await BlackList.create({ token: accessToken });
  }

  res.clearCookie("accessToken", accessTokenOptions);
  res.clearCookie("refreshToken", refreshTokenOptions);

  return res
    .status(200)
    .json(new apiResponse(200, null, "Logout successful"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, { user: sanitizeUser(req.user) }, "Current user fetched successfully"));
});

export { registerUser, loginUser, logoutUser, getCurrentUser };
