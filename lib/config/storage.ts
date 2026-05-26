const CONFIG_KEY = 'bloggy_db_config';

interface DBConfig {
  mongodbUri: string;
  timestamp: number;
}

function obfuscate(str: string): string {
  return btoa(str);
}

function deobfuscate(str: string): string {
  try {
    return atob(str);
  } catch {
    return str;
  }
}

export function saveDBConfig(mongodbUri: string): void {
  if (typeof window === 'undefined') {
    throw new Error('Storage is only available in the browser');
  }

  if (!mongodbUri || mongodbUri.trim().length === 0) {
    throw new Error('MongoDB URI cannot be empty');
  }

  const config: DBConfig = {
    mongodbUri: obfuscate(mongodbUri),
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(config);

  try {
    localStorage.setItem(CONFIG_KEY, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('localStorage is full');
    }
    throw error;
  }

  try {
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = `${CONFIG_KEY}=${encodeURIComponent(serialized)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  } catch (cookieError) {
    console.error('Failed to set DB config cookie:', cookieError);
  }
}

export function getDBConfig(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
      return null;
    }

    const config: DBConfig = JSON.parse(stored);
    return deobfuscate(config.mongodbUri);
  } catch {
    return null;
  }
}

export function isDBConfigured(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
      return false;
    }

    const config: DBConfig = JSON.parse(stored);
    const uri = deobfuscate(config.mongodbUri);
    return typeof uri === 'string' && uri.trim().length > 0;
  } catch {
    return false;
  }
}

export function clearDBConfig(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch {}

  try {
    document.cookie = `${CONFIG_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
  } catch (cookieError) {
    console.error('Failed to clear DB config cookie:', cookieError);
  }
}

export function validateMongoDBURI(uri: string): { valid: boolean; error?: string } {
  if (!uri || uri.trim().length === 0) {
    return { valid: false, error: 'MongoDB URI cannot be empty' };
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return {
      valid: false,
      error: 'URI must start with "mongodb://" or "mongodb+srv://"',
    };
  }

  try {
    const urlPart = uri.split('://')[1];
    if (!urlPart || !urlPart.includes('/')) {
      return {
        valid: false,
        error: 'Invalid MongoDB URI format',
      };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid MongoDB URI format' };
  }
}

const CLOUDINARY_KEY = 'bloggy_cloudinary_config';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  timestamp: number;
}

export function saveCloudinaryConfig(cloudName: string, apiKey: string, apiSecret: string): void {
  if (typeof window === 'undefined') {
    throw new Error('Storage is only available in the browser');
  }

  if (!cloudName?.trim() || !apiKey?.trim() || !apiSecret?.trim()) {
    throw new Error('All Cloudinary credentials are required');
  }

  const config: CloudinaryConfig = {
    cloudName: cloudName.trim(),
    apiKey: apiKey.trim(),
    apiSecret: obfuscate(apiSecret.trim()),
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(config);

  try {
    localStorage.setItem(CLOUDINARY_KEY, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('localStorage is full');
    }
    throw error;
  }

  try {
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = `${CLOUDINARY_KEY}=${encodeURIComponent(serialized)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  } catch (cookieError) {
    console.error('Failed to set Cloudinary config cookie:', cookieError);
  }
}

export function getCloudinaryConfig(): { cloudName: string; apiKey: string; apiSecret: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(CLOUDINARY_KEY);
    if (!stored) {
      return null;
    }

    const config: CloudinaryConfig = JSON.parse(stored);
    return {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      apiSecret: deobfuscate(config.apiSecret),
    };
  } catch {
    return null;
  }
}

export function isCloudinaryConfigured(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = localStorage.getItem(CLOUDINARY_KEY);
    if (!stored) {
      return false;
    }

    const config: CloudinaryConfig = JSON.parse(stored);
    return (
      typeof config.cloudName === 'string' &&
      config.cloudName.trim().length > 0 &&
      typeof config.apiKey === 'string' &&
      config.apiKey.trim().length > 0
    );
  } catch {
    return false;
  }
}

export function clearCloudinaryConfig(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CLOUDINARY_KEY);
  } catch {}

  try {
    document.cookie = `${CLOUDINARY_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
  } catch (cookieError) {
    console.error('Failed to clear Cloudinary config cookie:', cookieError);
  }
}
