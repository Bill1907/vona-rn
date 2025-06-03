import CryptoJS from "crypto-js";

export class E2EEHelper {
  private static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Hex);
  }

  static createKeyPair(): { privateKey: string; publicKey: string } {
    const privateKey = this.generateKey();
    const publicKey = CryptoJS.SHA256(privateKey).toString(CryptoJS.enc.Hex);
    return { privateKey, publicKey };
  }

  static encrypt(data: string, key: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return encrypted;
    } catch (error) {
      throw new Error("Encryption failed");
    }
  }

  static decrypt(encryptedData: string, key: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error("Decryption failed - invalid key or corrupted data");
      }
      return decryptedString;
    } catch (error) {
      throw new Error("Decryption failed");
    }
  }

  static generateSecureRandom(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
  }
}
