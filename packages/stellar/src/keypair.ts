import { Keypair } from 'stellar-sdk';

export interface GeneratedKeypair {
  publicKey: string;
  secretKey: string;
}

/**
 * Keypair helpers. Generation happens in-memory; callers are responsible
 * for encrypting secret keys before persistence (see backend CryptoUtil).
 */
export class KeypairManager {
  /** Generates a fresh random Stellar keypair. */
  static generate(): GeneratedKeypair {
    const kp = Keypair.random();
    return { publicKey: kp.publicKey(), secretKey: kp.secret() };
  }

  /** Reconstructs a Keypair object from a secret seed. */
  static fromSecret(secret: string): Keypair {
    return Keypair.fromSecret(secret);
  }

  /** Reconstructs a public-only Keypair from a public key. */
  static fromPublic(publicKey: string): Keypair {
    return Keypair.fromPublicKey(publicKey);
  }

  /** Verifies a signature against a challenge for a given public key. */
  static verifySignature(publicKey: string, message: string, signatureBase64: string): boolean {
    try {
      const kp = Keypair.fromPublicKey(publicKey);
      return kp.verify(Buffer.from(message), Buffer.from(signatureBase64, 'base64'));
    } catch {
      return false;
    }
  }

  /** Validates the format of a Stellar public key. */
  static isValidPublicKey(publicKey: string): boolean {
    try {
      Keypair.fromPublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }
}
