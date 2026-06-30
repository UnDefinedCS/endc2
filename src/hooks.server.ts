import { db } from '$lib/server/db';
import { sessions, usersTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .get();

    if (session && session.expires_at > new Date()) {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, session.uid))
        .get();

      event.locals.user = user ?? null;
    } else {
      if (session) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
      }
      event.cookies.delete('session', { path: '/' });
    }
  }

  return resolve(event);
};