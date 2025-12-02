import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatarURL: {
      type: String,
    },
    avatarID: {
      type: String,
    },
    role: {
      type: String,
      enum: ["viewer", "assignee", "project manager", "admin"],
      default: "viewer",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
