import { Schema } from "mongoose";

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
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["Published", "Draft"],
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
            default: null,
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
            default: null,
            trim: true,
        },

        seoDescription: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default BlogPostSchema;