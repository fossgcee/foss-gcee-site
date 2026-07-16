import mongoose from "mongoose";

const OtpSessionSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    linkedin: String,
    phone: String,
    year: String,
    department: String,
    otp: String,
    otpExpiresAt: Date,
    otpAttempts: { type: Number, default: 0 },
    otpLockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-delete after 1 hour (3600 seconds)
OtpSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.OtpSession ||
  mongoose.model("OtpSession", OtpSessionSchema);
