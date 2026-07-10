import mongoose from "mongoose";

export interface IContribution extends mongoose.Document {
  memberId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new mongoose.Schema<IContribution>(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: [true, "Please provide a member ID"],
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    url: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contribution || mongoose.model<IContribution>("Contribution", ContributionSchema);
