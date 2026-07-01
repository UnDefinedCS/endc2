import { isRedirect, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sessions, usersTable } from '$lib/db/schema';
import { SendCommand } from '$lib/server/connection.js';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) throw redirect(301, "/login");

    try {
        const session = await db.select()
        .from(sessions)
        .innerJoin(usersTable, eq(sessions.uid, usersTable.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

        if (!session.length)
            throw redirect(301, "/login");
    } catch (e) {
        if (isRedirect(e)) throw e;
        return { error: "Database Unreachable" };
    }
};

export const actions = {
    // special form named-target
    send: async ({ cookies, request }) => {
        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;
        try {
            console.log(formData);
            await SendCommand(formData.sid, formData.cmd);
        } catch (e) {
            console.error('[ERROR] --', e);
            return { success: false, message: 'An error occurred' };
        }
    }
};