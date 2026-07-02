import { usersTable, sessions, devices } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { json, isRedirect, redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
  try {
    const sessionId = cookies.get('session');
    if (!sessionId) throw redirect(301, "/login");
    
    const session = await db.select()
        .from(sessions)
        .innerJoin(usersTable, eq(sessions.uid, usersTable.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

    if (!session.length)
        throw redirect(301, "/login");

    return json({
      devices: await db.select().from(devices)
    }, {
        headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    if (isRedirect(e)) throw e;
    throw json({ error: "Error Occurred" });
  }
};