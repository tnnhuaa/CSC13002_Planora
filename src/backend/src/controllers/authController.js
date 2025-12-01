import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signUp = async (req, res) => {
  try {
    const { username, password, email } = req.body;

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
      email,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error occurred when signing up", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
