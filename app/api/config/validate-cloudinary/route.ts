import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { cloudName, apiKey, apiSecret } = await req.json();

    if (!cloudName?.trim() || !apiKey?.trim() || !apiSecret?.trim()) {
      return NextResponse.json(
        { error: 'Cloud name, API key, and API secret are required.' },
        { status: 400 }
      );
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey.trim()}:${apiSecret.trim()}`).toString('base64')}`;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName.trim()}/ping`,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.ok) {
      return NextResponse.json({
        message: 'Cloudinary configuration validated successfully.',
        valid: true,
      });
    }

    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API Key or API Secret. Please check your credentials.' },
        { status: 400 }
      );
    }

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Invalid Cloud Name. Cloudinary account not found.' },
        { status: 400 }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: data.error?.message || 'Failed to validate Cloudinary connection.' },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred during validation.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
