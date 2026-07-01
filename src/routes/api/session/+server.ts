import { usersTable, sessions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { json, error, isRedirect, redirect } from '@sveltejs/kit';
import { GetOutput } from '$lib/server/connection.js';

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
      output: GetOutput()
    });
  } catch (e) {
    if (isRedirect(e)) throw e;
    throw error(400, 'Invalid JSON body');
  }
};