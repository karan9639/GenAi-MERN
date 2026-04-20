const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

export { asyncHandler };
