import jwt from "jsonwebtoken";
import { BlackList } from "../models/blacklist.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authUser = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new apiError(401, "Unauthorized access");
  }

  const isBlacklisted = await BlackList.findOne({ token });
  if (isBlacklisted) {
    throw new apiError(401, "Token expired or logged out");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken.id).select("-password -refreshToken -__v");

  if (!user) {
    throw new apiError(401, "User not found");
  }

  req.user = user;
  next();
});

export { authUser };
