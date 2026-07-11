import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Field-level encryption for sensitive data (e.g. Stellar secret keys,
 * national IDs). Uses AES-256-GCM with a per-value random salt + IV.
 * Output format: base64(salt | iv | authTag | ciphertext)
 */
export class CryptoUtil {
  private static deriveKey(masterKey: string, salt: Buffer): Buffer {
    return scryptSync(masterKey, salt, KEY_LENGTH);
  }

  static encrypt(plaintext: string, masterKey: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    const key = this.deriveKey(masterKey, salt);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');
  }

  static decrypt(payload: string, masterKey: string): string {
    const data = Buffer.from(payload, 'base64');
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + 16);
    const ciphertext = data.subarray(SALT_LENGTH + IV_LENGTH + 16);
    const key = this.deriveKey(masterKey, salt);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}
