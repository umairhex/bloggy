import mongoose, { Schema } from "mongoose";

const BlogPostSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Published", "Scheduled", "Draft"],
      default: "Draft",
      required: true,
    },

    publishDate: {
      type: Date,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    featuredImageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    projectId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },

    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.BlogPost ||
  mongoose.model("BlogPost", BlogPostSchema);
