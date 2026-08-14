import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { headers } from 'next/headers';

export interface Session {
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface AccessLog {
  timestamp: string;
  ip: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  reason?: string;
}

const SESSIONS_FILE_PATH = path.join(process.cwd(), 'src/data/sessions.json');
const LOGS_FILE_PATH = path.join(process.cwd(), 'src/data/access_logs.json');
const LOCKOUTS_FILE_PATH = path.join(process.cwd(), 'src/data/login_lockouts.json');

async function ensureFileExists(filePath: string, defaultContent: string = '[]') {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultContent, 'utf-8');
  }
}

export async function getClientIp(): Promise<string> {
  try {
    const reqHeaders = await headers();
    const forwardedFor = reqHeaders.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = reqHeaders.get('x-real-ip');
    if (realIp) return realIp;
  } catch {
    // headers() might throw outside request context
  }
  return '127.0.0.1';
}

// 1. Session Management
export async function createSession(): Promise<string> {
  await ensureFileExists(SESSIONS_FILE_PATH, '[]');
  
  const token = 'session_' + crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours session

  const data = await fs.readFile(SESSIONS_FILE_PATH, 'utf-8');
  const sessions: Session[] = JSON.parse(data);

  // Clean up expired sessions on write
  const activeSessions = sessions.filter(s => new Date(s.expiresAt) > now);
  
  activeSessions.push({
    token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  await fs.writeFile(SESSIONS_FILE_PATH, JSON.stringify(activeSessions, null, 2), 'utf-8');
  return token;
}

export async function validateSession(token: string): Promise<boolean> {
  await ensureFileExists(SESSIONS_FILE_PATH, '[]');
  try {
    const data = await fs.readFile(SESSIONS_FILE_PATH, 'utf-8');
    const sessions: Session[] = JSON.parse(data);
    const now = new Date();
    
    const session = sessions.find(s => s.token === token && new Date(s.expiresAt) > now);
    return !!session;
  } catch {
    return false;
  }
}

export async function deleteSession(token: string): Promise<void> {
  await ensureFileExists(SESSIONS_FILE_PATH, '[]');
  try {
    const data = await fs.readFile(SESSIONS_FILE_PATH, 'utf-8');
    const sessions: Session[] = JSON.parse(data);
    
    const filtered = sessions.filter(s => s.token !== token);
    await fs.writeFile(SESSIONS_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to delete session:", error);
  }
}

// 2. Persistent Brute Force Protection (Lockout)
interface LockoutData {
  attempts: number;
  lockUntil: number;
}

async function getLockouts(): Promise<Record<string, LockoutData>> {
  await ensureFileExists(LOCKOUTS_FILE_PATH, '{}');
  try {
    const data = await fs.readFile(LOCKOUTS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveLockouts(lockouts: Record<string, LockoutData>) {
  await fs.writeFile(LOCKOUTS_FILE_PATH, JSON.stringify(lockouts, null, 2), 'utf-8');
}

export async function checkLockout(ip: string): Promise<{ locked: boolean; remainingMs: number }> {
  const lockouts = await getLockouts();
  const attempt = lockouts[ip];
  if (!attempt) return { locked: false, remainingMs: 0 };

  const now = Date.now();
  if (attempt.lockUntil > now) {
    return { locked: true, remainingMs: attempt.lockUntil - now };
  }

  // Lock has expired, reset attempts
  if (attempt.lockUntil > 0 && attempt.lockUntil <= now) {
    delete lockouts[ip];
    await saveLockouts(lockouts);
  }

  return { locked: false, remainingMs: 0 };
}

export async function registerFailedAttempt(ip: string): Promise<void> {
  const lockouts = await getLockouts();
  const attempt = lockouts[ip] || { attempts: 0, lockUntil: 0 };
  attempt.attempts += 1;

  if (attempt.attempts >= 5) {
    // Lock for 15 minutes after 5 failed attempts
    attempt.lockUntil = Date.now() + 15 * 60 * 1000;
  }

  lockouts[ip] = attempt;
  await saveLockouts(lockouts);
}

export async function resetAttempts(ip: string): Promise<void> {
  const lockouts = await getLockouts();
  if (lockouts[ip]) {
    delete lockouts[ip];
    await saveLockouts(lockouts);
  }
}

// 3. 2FA TOTP Validation
function base32ToHex(base32: string): string {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";

  const cleanBase32 = base32.replace(/=+$/, "").toUpperCase();

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = base32chars.indexOf(cleanBase32.charAt(i));
    if (val === -1) throw new Error("Invalid base32 character");
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substring(i, i + 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return hex;
}

export function verifyTOTP(token: string, secretBase32: string): boolean {
  try {
    const cleanSecret = secretBase32.replace(/\s+/g, '');
    const secretHex = base32ToHex(cleanSecret);
    const secretBuffer = Buffer.from(secretHex, 'hex');

    const now = Math.floor(Date.now() / 1000);
    // Allow 30 seconds window drift before and after
    for (let offset = -1; offset <= 1; offset++) {
      const counter = Math.floor(now / 30) + offset;
      
      const buffer = Buffer.alloc(8);
      buffer.writeBigInt64BE(BigInt(counter), 0);

      const hmac = crypto.createHmac('sha1', secretBuffer);
      hmac.update(buffer);
      const digest = hmac.digest();

      const digestOffset = digest[digest.length - 1] & 0xf;
      const code = (
        ((digest[digestOffset] & 0x7f) << 24) |
        ((digest[digestOffset + 1] & 0xff) << 16) |
        ((digest[digestOffset + 2] & 0xff) << 8) |
        (digest[digestOffset + 3] & 0xff)
      ) % 1000000;

      const codeStr = code.toString().padStart(6, '0');
      if (codeStr === token.trim()) {
        return true;
      }
    }
  } catch (err) {
    console.error("TOTP verification error:", err);
  }
  return false;
}

// 4. Audit / Access Logging
export async function logAccessAttempt(ip: string, action: string, status: 'SUCCESS' | 'FAILURE' | 'BLOCKED', reason?: string) {
  await ensureFileExists(LOGS_FILE_PATH, '[]');
  try {
    const data = await fs.readFile(LOGS_FILE_PATH, 'utf-8');
    const logs: AccessLog[] = JSON.parse(data);
    
    logs.push({
      timestamp: new Date().toISOString(),
      ip,
      action,
      status,
      reason
    });

    // Limit log file size to last 500 records
    const trimmedLogs = logs.slice(-500);

    await fs.writeFile(LOGS_FILE_PATH, JSON.stringify(trimmedLogs, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to write access log:", error);
  }
}
