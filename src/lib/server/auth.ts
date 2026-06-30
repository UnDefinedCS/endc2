import { db } from '$lib/server/db';
import { sessions, usersTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: string) {
  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db.insert(sessions).values({ id, uid: userId, expires_at: expiresAt });
  return { id, expiresAt };
}

export async function validateSession(sessionId: string) {
  // users can have 1-many sessions but all session ids are unique
  const result = await db
    .select({ user: usersTable, session: sessions })
    .from(sessions)
    .innerJoin(usersTable, eq(sessions.uid, usersTable.id))
    .where(eq(sessions.id, sessionId)).get();

  if (!result || result.session.expires_at < new Date()) {
    if (result) await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }
  return result;
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function setSessionCookie(cookies: Cookies, id: string, expiresAt: Date) {
  cookies.set('session', id, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete('session', { path: '/' });
}