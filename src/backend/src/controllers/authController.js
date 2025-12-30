import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail, verifyOTP } from "../services/emailService.js";

const ACCESS_TOKEN_TTL = "30m"; // normal: 15mins
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days (milliseconds)

export const signUp = async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;
    const finalFullName = fullName || username;
    if (!username || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Password must contain at least one uppercase letter and one number
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    if (!uppercaseRegex.test(password) || !numberRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter and one number",
      });
    }

    const duplicate_name = await User.findOne({ username });

    if (duplicate_name) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const duplicate_email = await User.findOne({ email });
    if (duplicate_email) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      hashedPassword,
      role: "user",
      status: "active",
      fullName: finalFullName,
      email,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error occurred when signing up", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username/Email and password are required" });
    }

    const isEmail = username.includes("@");

    const query = isEmail ? { email: username } : { username: username };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "banned") {
      return res.status(403).json({
        message:
          "Your account has been banned. Please contact the administrator.",
      });
    }

    // if (user.status === "inactive") {
    //   return res.status(403).json({
    //     message: "Your account is inactive. Please verify your email.",
    //   });
    // }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const accessToken = jwt.sign(
      { userID: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userID: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // Deploy separate backend, frontend
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `User ${user.username} logged in`,
      accessToken,
      user: { _id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("Error occurred when signing in", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signOut = async (req, res) => {
  try {
    // Take refresh token from cookies
    const token = req.cookies?.refreshToken;

    if (token) {
      // Remove refresh token from Session
      await Session.deleteOne({ refreshToken: token });
      // Remove cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error occurred when signing out", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Take refresh token from cookies
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Compare with refresh tokens in database
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const user = await User.findById(session.userID);

    // 2. Check if user exists and is NOT banned
    if (!user || user.status === "banned") {
      // Security: Destroy the session immediately
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");

      return res.status(403).json({
        message: "Session terminated. Your account has been banned.",
      });
    }
    // Check if token is valid and not expired
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Refresh token has expired" });
    }

    // If valid, create new access token
    const accessToken = jwt.sign(
      { userID: session.userID },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      }
    );
    // return new access token
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error occurred when refreshing token", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const result = await sendOTPEmail(email, user.username);

    if (!result.success) {
      return res.status(429).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again." });
  }
};

export const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const result = await verifyOTP(email, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in verifyOTPCode:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify OTP. Please try again." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Password must contain at least one uppercase letter and one number
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    if (!uppercaseRegex.test(newPassword) || !numberRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter and one number",
      });
    }

    const verificationResult = await verifyOTP(email, otp);

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.hashedPassword = hashedPassword;
    await user.save();

    await OTP.cleanupOldOTPs(email);
    await Session.deleteMany({ userID: user._id });

    return res.status(200).json({
      message:
        "Password reset successfully. Please sign in with your new password",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res
      .status(500)
      .json({ message: "Failed to reset password. Please try again." });
  }
};

export const changePassword = async (req, res) => {
  try {
  } catch (error) {}
};
