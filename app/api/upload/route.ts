import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function deobfuscate(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const storedCookie = cookieStore.get('bloggy_cloudinary_config');

    if (!storedCookie?.value) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please configure it in settings.' },
        { status: 400 }
      );
    }

    let config;
    try {
      config = JSON.parse(decodeURIComponent(storedCookie.value));
    } catch {
      return NextResponse.json(
        { error: 'Invalid Cloudinary configuration format.' },
        { status: 400 }
      );
    }

    const { cloudName, apiKey, apiSecret: obfuscatedSecret } = config;
    if (!cloudName || !apiKey || !obfuscatedSecret) {
      return NextResponse.json(
        { error: 'Incomplete Cloudinary configuration.' },
        { status: 400 }
      );
    }

    const apiSecret = deobfuscate(obfuscatedSecret);

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image file was provided for upload.' },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to upload image to Cloudinary.' },
        { status: cloudinaryResponse.status }
      );
    }

    return NextResponse.json({
      url: data.secure_url,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during upload.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
