import mongoose from 'mongoose';
import { cookies } from 'next/headers';

let isConnected = false;

function deobfuscate(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

export const connectToDB = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return true;
  }

  mongoose.set('bufferCommands', false);

  let mongodbUri: string | undefined;

  try {
    const cookieStore = await cookies();
    const storedCookie = cookieStore.get('bloggy_db_config');
    if (storedCookie?.value) {
      try {
        const config = JSON.parse(decodeURIComponent(storedCookie.value));
        if (config && config.mongodbUri) {
          mongodbUri = deobfuscate(config.mongodbUri);
        }
      } catch {
        mongodbUri = deobfuscate(storedCookie.value);
      }
    }
  } catch (error) {
    console.warn('Could not retrieve DB config from cookies (common during build):', error);
  }

  if (!mongodbUri) {
    mongodbUri = process.env.MONGODB_URI;
  }

  if (!mongodbUri) {
    console.warn('MongoDB not configured - skipping connection (common during build)');
    return false;
  }

  try {
    await mongoose.connect(mongodbUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

export async function hasDBConfigServer() {
  if (process.env.MONGODB_URI) {
    return true;
  }

  try {
    const cookieStore = await cookies();
    return cookieStore.has('bloggy_db_config');
  } catch {
    return false;
  }
}
