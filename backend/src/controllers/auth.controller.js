import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

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

export { registerUser };
