import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { ADMIN_PASSWORD_MIN_LENGTH } from "./admin-password-policy";

export { ADMIN_PASSWORD_MIN_LENGTH } from "./admin-password-policy";

const HASH_PREFIX = "v1$";

export function adminPasswordMeetsPolicy(plain: string): boolean {
  return plain.length >= ADMIN_PASSWORD_MIN_LENGTH;
}

/** Stored alongside portfolio data; verify with `verifyAdminPasswordHash`. */
export function hashAdminPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${HASH_PREFIX}${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyAdminPasswordHash(
  stored: string,
  plain: string,
): boolean {
  if (!stored.startsWith(HASH_PREFIX)) return false;
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [, saltB64, expectedB64] = parts;
  try {
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(expectedB64, "base64url");
    const got = scryptSync(plain, salt, expected.length);
    if (got.length !== expected.length) return false;
    return timingSafeEqual(got, expected);
  } catch {
    return false;
  }
}
