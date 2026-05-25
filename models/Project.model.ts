import mongoose, { Schema } from 'mongoose';

const ProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    mongodbUri: { type: String, required: true },

    category: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'development',
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    connectionStatus: {
      type: String,
      enum: ['untested', 'connected', 'failed'],
      default: 'untested',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
