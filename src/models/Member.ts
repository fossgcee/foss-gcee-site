import mongoose from "mongoose";

export interface IMember extends mongoose.Document {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  year: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new mongoose.Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    role: {
      type: String,
      default: "Member",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);
