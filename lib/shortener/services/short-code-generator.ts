/**
 * Short Code Generator Service
 * Generates unique, collision-resistant short codes using Base62 encoding
 *
 * Base62: Uses 0-9, a-z, A-Z (62 characters total)
 * Benefits:
 * - URL-safe (no special characters)
 * - Case-sensitive (more combinations)
 * - Human-readable
 * - Compact (6 chars = 56 billion combinations)
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class ShortCodeGenerator {
  /**
   * Generate short code from UUID
   * UUID → Hex → BigInt → Base62
   *
   * Example: 550e8400-e29b-41d4-a716-446655440000
   *          → 550e8400e29b41d4
   *          → Base62 encode
   *          → "3pN9g8K" (7 chars)
   */
  generateFromUUID(uuid: string): string {
    // Remove hyphens and take first 16 chars (64 bits)
    const hex = uuid.replace(/-/g, '').substring(0, 16);

    // Convert hex to BigInt
    const num = BigInt('0x' + hex);

    // Encode to base62 with minimum 6 characters
    return this.encodeBase62(num, 6);
  }

  /**
   * Generate short code from timestamp + random
   * More collision-resistant than UUID-based
   *
   * Formula: (timestamp * 100000) + random
   * timestamp: milliseconds since epoch (13 digits)
   * random: 0-99999 (5 digits)
   * Combined: ~18 digits
   * Base62 encoded: ~10 characters
   *
   * Example: timestamp=1705320000000, random=12345
   *          → combined=170532000000012345
   *          → Base62 encode
   *          → "aB3xY9Km" (8 chars)
   */
  generateFromTimestamp(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const combined = BigInt(timestamp) * BigInt(100000) + BigInt(random);

    return this.encodeBase62(combined, 6);
  }

  /**
   * Encode BigInt to Base62 string
   *
   * @param num - Number to encode
   * @param minLength - Minimum length (pads with '0' if needed)
   * @returns Base62 encoded string
   */
  private encodeBase62(num: bigint, minLength: number = 6): string {
    if (num === 0n) {
      return BASE62_CHARS[0].repeat(minLength);
    }

    let result = '';
    let n = num;

    while (n > 0n) {
      const remainder = Number(n % 62n);
      result = BASE62_CHARS[remainder] + result;
      n = n / 62n;
    }

    // Pad to minimum length
    while (result.length < minLength) {
      result = BASE62_CHARS[0] + result;
    }

    return result;
  }

  /**
   * Decode Base62 string to BigInt
   * Useful for debugging or reverse lookups
   *
   * @param code - Base62 encoded string
   * @returns Decoded BigInt
   */
  decodeBase62(code: string): bigint {
    let result = 0n;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const value = BASE62_CHARS.indexOf(char);

      if (value === -1) {
        throw new Error(`Invalid character in short code: ${char}`);
      }

      result = result * 62n + BigInt(value);
    }

    return result;
  }

  /**
   * Validate short code format
   *
   * Rules:
   * - Length: 4-10 characters
   * - Characters: Only 0-9, a-z, A-Z
   *
   * @param code - Short code to validate
   * @returns true if valid, false otherwise
   */
  isValidCode(code: string): boolean {
    // Check length
    if (!code || code.length < 4 || code.length > 10) {
      return false;
    }

    // Check all characters are in BASE62_CHARS
    for (const char of code) {
      if (!BASE62_CHARS.includes(char)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate unique code with collision check
   * Retries up to maxAttempts times if collision detected
   *
   * @param checkExists - Async function to check if code exists in database
   * @param maxAttempts - Maximum retry attempts (default: 10)
   * @returns Unique short code
   * @throws Error if unable to generate unique code after maxAttempts
   */
  async generateUniqueCode(
    checkExists: (code: string) => Promise<boolean>,
    maxAttempts: number = 10
  ): Promise<string> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      // Generate code using timestamp + random (more collision-resistant)
      const code = this.generateFromTimestamp();

      // Check if exists
      const exists = await checkExists(code);
      if (!exists) {
        return code;
      }

      attempts++;

      // Add small delay to ensure different timestamp on retry
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error(`Failed to generate unique short code after ${maxAttempts} attempts`);
  }

  /**
   * Generate custom code (user-specified)
   * Validates and normalizes user input
   *
   * @param customCode - User's desired short code
   * @returns Normalized code
   * @throws Error if invalid format
   */
  generateCustomCode(customCode: string): string {
    // Normalize: trim, lowercase (optional - keep case for more combinations)
    const normalized = customCode.trim();

    // Validate
    if (!this.isValidCode(normalized)) {
      throw new Error(
        'Invalid custom code. Must be 4-10 characters, using only letters and numbers.'
      );
    }

    return normalized;
  }

  /**
   * Calculate collision probability
   * For educational purposes / capacity planning
   *
   * Base62^length = total combinations
   * 6 chars: 62^6 = 56,800,235,584 (~56 billion)
   * 8 chars: 62^8 = 218,340,105,584,896 (~218 trillion)
   *
   * Birthday paradox: ~50% collision at sqrt(combinations)
   * 6 chars: collision likely after ~238,000 codes
   * 8 chars: collision likely after ~14.7 million codes
   */
  calculateCapacity(codeLength: number): {
    totalCombinations: bigint;
    fiftyPercentCollisionAt: bigint;
  } {
    const totalCombinations = BigInt(62) ** BigInt(codeLength);
    const fiftyPercentCollisionAt = this.sqrtBigInt(totalCombinations);

    return {
      totalCombinations,
      fiftyPercentCollisionAt
    };
  }

  /**
   * Calculate square root of BigInt (for collision probability)
   * Using Newton's method
   */
  private sqrtBigInt(value: bigint): bigint {
    if (value < 0n) {
      throw new Error('Square root of negative number');
    }
    if (value < 2n) {
      return value;
    }

    let x0 = value / 2n;
    let x1 = (x0 + value / x0) / 2n;

    while (x1 < x0) {
      x0 = x1;
      x1 = (x0 + value / x0) / 2n;
    }

    return x0;
  }
}

// Singleton instance
export const shortCodeGenerator = new ShortCodeGenerator();

// Export for testing
export { BASE62_CHARS };
