import mongoose from 'mongoose';
import { getDBConfig } from './config/storage';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  // Get MongoDB URI - prefer user's config, fallback to .env
  const mongodbUri = getDBConfig() || process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('Please configure MongoDB connection. Go to Settings to add your MongoDB URI.');
  }

  try {
    await mongoose.connect(mongodbUri);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};
