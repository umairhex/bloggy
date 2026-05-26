import mongoose from 'mongoose';
import { cookies } from 'next/headers';

let connectionPromise: Promise<boolean> | null = null;
const projectConnections = new Map<string, mongoose.Connection>();

function deobfuscate(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

export const connectToDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
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
      console.log('Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      connectionPromise = null;
      return false;
    }
  })();

  return connectionPromise;
};

export function isLocalMongoUri(mongodbUri: string): boolean {
  const lowered = mongodbUri.toLowerCase();
  return (
    lowered.includes('localhost') ||
    lowered.includes('127.0.0.1') ||
    lowered.includes('[::1]') ||
    lowered.includes('0.0.0.0')
  );
}

export async function getProjectConnection(mongodbUri: string) {
  const cached = projectConnections.get(mongodbUri);
  if (cached) {
    if (cached.readyState === 1) {
      return cached;
    }
    if (cached.readyState === 2) {
      await cached.asPromise();
      return cached;
    }
  }

  const connection = mongoose.createConnection(mongodbUri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  await connection.asPromise();
  projectConnections.set(mongodbUri, connection);
  return connection;
}

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
