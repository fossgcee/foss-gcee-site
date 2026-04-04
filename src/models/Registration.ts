import mongoose from "mongoose";

export interface IRegistration extends mongoose.Document {
  name: string;
  email: string;
  linkedin: string;
  phone: string;
  year: string;
  department: string;
  otpVerified: boolean;
  approved: boolean;
  role: string;
  otp?: string;
  otpExpiresAt?: Date;
  otpAttempts?: number;
  otpLockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new mongoose.Schema<IRegistration>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    linkedin: {
      type: String,
      required: [true, "LinkedIn profile is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    year: {
      type: String,
      required: [true, "Year is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "Member",
      trim: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
