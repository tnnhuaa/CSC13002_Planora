import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp_code: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3, // Maximum 3 attempts allowed
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from creation
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete OTP documents after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
otpSchema.index({ email: 1, verified: 1 });

// Method to check if OTP is still valid
otpSchema.methods.isValid = function () {
  return !this.verified && this.attempts < 3 && this.expiresAt > new Date();
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  this.lastAttemptAt = new Date();
  await this.save();
};

// Method to mark as verified
otpSchema.methods.markAsVerified = async function () {
  this.verified = true;
  await this.save();
};

// Static method to cleanup expired/verified OTPs for an email
otpSchema.statics.cleanupOldOTPs = async function (email) {
  await this.deleteMany({
    email,
    $or: [
      { verified: true },
      { expiresAt: { $lt: new Date() } },
      { attempts: { $gte: 3 } },
    ],
  });
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
