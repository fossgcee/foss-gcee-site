import mongoose from "mongoose";

export interface IBlogCategory {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCategorySchema = new mongoose.Schema<IBlogCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.BlogCategory ||
  mongoose.model<IBlogCategory>("BlogCategory", BlogCategorySchema);
