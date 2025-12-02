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

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error(err);
          return res.status(403).json({ message: "Token is not valid" });
        }

        // Find user
        const user = await User.findById(decodedUser.userID).select(
          "-hashedPassword"
        );

        // Return user in request
        req.user = user;
        next();
      }
    );
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
