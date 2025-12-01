import express from "express";
import {
  changePassword,
  forgotPassword,
  refreshToken,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/signout", signOut);

router.post("/refresh-token", refreshToken);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.post("/change-password", changePassword);

export default router;
