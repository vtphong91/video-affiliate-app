/**
 * Encryption Utility
 * Encrypt/Decrypt sensitive data like API tokens
 * Uses AES-256-GCM encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 * Falls back to a default key for development (NOT SECURE FOR PRODUCTION)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY not configured in environment variables');
  }

  // Create a 32-byte key from the environment variable
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt a string value
 *
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData (all in hex)
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty text');
  }

  try {
    const key = getEncryptionKey();

    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 *
 * @param encryptedText - Encrypted string in format: iv:authTag:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty text');
  }

  try {
    const key = getEncryptionKey();

    // Split the encrypted text
    const parts = encryptedText.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a value (one-way, for comparison only)
 *
 * @param text - Text to hash
 * @returns SHA-256 hash in hex format
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Check if a value is encrypted (basic format check)
 *
 * @param text - Text to check
 * @returns True if text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;

  // Check format: should have 3 parts separated by ':'
  const parts = text.split(':');
  if (parts.length !== 3) return false;

  // Check if parts are valid hex strings
  const hexRegex = /^[0-9a-f]+$/i;
  return parts.every(part => hexRegex.test(part));
}
