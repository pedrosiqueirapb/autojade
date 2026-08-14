import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard IV length

function getEncryptionKey(): Buffer {
  // Use the ADMIN_PASSWORD environment variable to derive the 256-bit AES key.
  // Fall back to a hardcoded constant ONLY to avoid crashing in case of configuration errors.
  const password = process.env.ADMIN_PASSWORD || 'default_secret_key_autojade_fallback';
  return crypto.createHash('sha256').update(password).digest();
}

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Returns the result in format "ivHex:authTagHex:encryptedHex"
 */
export function encryptText(text: string): string {
  if (!text) return '';
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error("Encryption failed:", err);
    return text; // Graceful fallback to plaintext
  }
}

/**
 * Decrypts a cipher text string formatted as "ivHex:authTagHex:encryptedHex".
 * Returns the plain text string, or the raw cipherText if not encrypted.
 */
export function decryptText(cipherText: string): string {
  if (!cipherText) return '';
  try {
    // If it does not contain the GCM components delimiter, treat as plain text (graceful transition)
    if (!cipherText.includes(':')) {
      return cipherText;
    }
    
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return '[Erro de descriptografia - chave alterada]';
  }
}
