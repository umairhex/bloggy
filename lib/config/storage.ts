/**
 * Privacy-First Configuration Storage
 * Stores MongoDB connection string securely in localStorage
 * Data never leaves the user's browser
 */

const CONFIG_KEY = 'bloggy_db_config';

interface DBConfig {
  mongodbUri: string;
  timestamp: number;
}

/**
 * Simple obfuscation (not encryption - for privacy, not security)
 * Use only for hiding from casual inspection. For real security, use encryption libraries.
 */
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

/**
 * Save MongoDB connection string to localStorage
 */
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

  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('localStorage is full');
    }
    throw error;
  }
}

/**
 * Retrieve MongoDB connection string from localStorage
 */
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

/**
 * Check if MongoDB is configured
 */
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

/**
 * Clear MongoDB configuration
 */
export function clearDBConfig(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Validate MongoDB URI format
 */
export function validateMongoDBURI(uri: string): { valid: boolean; error?: string } {
  if (!uri || uri.trim().length === 0) {
    return { valid: false, error: 'MongoDB URI cannot be empty' };
  }

  // Basic MongoDB URI validation
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return {
      valid: false,
      error: 'URI must start with "mongodb://" or "mongodb+srv://"',
    };
  }

  try {
    // Try to parse as URL to check basic structure
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
