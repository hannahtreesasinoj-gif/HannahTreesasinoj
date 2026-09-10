/**
 * Cryptographic and Privacy Security Service
 * Uses 100% native Web Crypto API (SHA-256) without any external libraries or APIs.
 */

export class SecurityService {
  /**
   * Generates a random cryptographic hex salt.
   */
  static generateSalt(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hashes a PIN or Password with salt using SHA-256.
   */
  static async hashPin(pin: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + salt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifies a plain PIN against stored hash and salt.
   */
  static async verifyPin(enteredPin: string, storedHash: string, storedSalt: string): Promise<boolean> {
    const computedHash = await this.hashPin(enteredPin, storedSalt);
    return computedHash === storedHash;
  }
}
