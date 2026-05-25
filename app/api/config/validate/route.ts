import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { mongoUri } = await req.json();

    if (!mongoUri) {
      return NextResponse.json({ error: 'MongoDB URI is required' }, { status: 400 });
    }

    // Validate URI format
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      return NextResponse.json({ error: 'Invalid MongoDB URI format' }, { status: 400 });
    }

    // Attempt connection test
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    // Close the test connection
    await connection.disconnect();

    return NextResponse.json({
      message: 'MongoDB connection validated successfully',
      valid: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to connect to MongoDB';

    return NextResponse.json(
      {
        error: message.includes('ECONNREFUSED')
          ? 'MongoDB server is not running. Please check your connection string.'
          : message.includes('authentication failed')
            ? 'Invalid credentials. Check your username and password.'
            : message.includes('unknown host')
              ? 'Invalid hostname. Check your connection string.'
              : message,
      },
      { status: 400 }
    );
  }
}
