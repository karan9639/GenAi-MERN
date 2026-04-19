import { BlackList } from "../models/blackList.model";

const authMiddleware = asyncHandler(async (request, _, next) => {
  const token =
    request.cookies?.accessToken ||
    request.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new apiError(401, "Unauthorized access!");
  }

  // 🔥 Check blacklist
  const isBlacklisted = await BlackList.findOne({ token });

  if (isBlacklisted) {
    throw new apiError(401, "Token expired or logged out");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new apiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decodedToken.id).select(
    "-password -refreshToken -__v",
  );

  if (!user) {
    throw new apiError(401, "User not found");
  }

  request.user = user;
  next();
});
