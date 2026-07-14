import mongoose from "mongoose";

export interface IBlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: mongoose.Types.ObjectId;
  author: string;
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new mongoose.Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    coverImage: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    author: { type: String, required: true, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });

// Temporary workaround for typescript generic type mismatch (IBlogPost typecast)
type BlogPostModelType = mongoose.Model<any>;
export default (mongoose.models.BlogPost ||
  mongoose.model("BlogPost", BlogPostSchema)) as BlogPostModelType;
