import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
  try {
    // Take token from headers
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Verify token
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Use synchronous verify to properly catch TokenExpiredError
    try {
      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Find user
      const user = await User.findById(decodedUser.userID).select(
        "-hashedPassword"
      );

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user in request
      req.user = user;
      next();
    } catch (jwtError) {
      console.error(jwtError);
      // Return 401 for expired tokens to trigger refresh in frontend
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      // Return 403 for other token errors
      return res.status(403).json({ message: "Token is not valid" });
    }
  } catch (error) {
    console.log("Error in auth middleware", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// RBAC Middleware (Role based access control)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authenticated required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(
          " or "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};
