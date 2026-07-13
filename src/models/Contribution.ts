import mongoose from "mongoose";

export interface IContribution extends mongoose.Document {
  memberId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  url?: string;
  links?: { label: string; url: string }[];
  imageUrl?: string;
  isFeatured?: boolean;
  order?: number;
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
    links: [
      {
        label: String,
        url: String,
      }
    ],
    imageUrl: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contribution || mongoose.model<IContribution>("Contribution", ContributionSchema);
