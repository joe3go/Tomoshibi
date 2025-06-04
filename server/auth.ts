import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { nanoid } from "nanoid";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function generateVerificationToken(): string {
  return nanoid(32);
}

export function generatePasswordResetToken(): string {
  return nanoid(32);
}

export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}

export function getPasswordResetExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // 1 hour from now
  return expiry;
}

export function getEmailVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours from now
  return expiry;
}