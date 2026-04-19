const asyncHandler = (func) => async (request, response, next) => {
    try {
        await func(request, response, next);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return response.status(400).json({
                success: false,
                message: `${field} already exists`,
            });
        }

        return response.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export { asyncHandler };
