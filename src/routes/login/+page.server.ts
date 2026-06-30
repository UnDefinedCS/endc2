import { redirect, isRedirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sessions, usersTable } from '$lib/db/schema';
import { createSession, setSessionCookie } from '$lib/server/auth';
import { CheckPassword } from '$lib/utils.js';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) return;

    try {
        const session = await db.select()
        .from(sessions)
        .innerJoin(usersTable, eq(sessions.uid, usersTable.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

        if (!session.length) return;
        throw redirect(301, "/");
    } catch (e) {
        if (isRedirect(e)) throw e;
        return { error: "Database Unreachable" };
    }
};

export const actions = {
    // special form named-target
	login: async ({ cookies, request }) => {
        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            const username = formData.username;
            const password = formData.password;

            if (!username || !password) {
                console.log("[*] Missing username or password");
                return { success: false, message: 'Username and password are required' };
            }

            const user = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.username, username))
                .get();

            if (!user) {
                console.log("[*] User not present");
                return { success: false, message: 'Invalid username or password' };
            }

            if (!await CheckPassword(password, user.password)) {
                console.log("[*] Invalid Password");
                return { success: false, message: 'Invalid username or password' };
            }

            const session = await createSession(user.id.toString());
            setSessionCookie(cookies, session.id, session.expiresAt);
            console.log("[*] Login Success");
            throw redirect(303, "/");
        } catch (e) {
            if (isRedirect(e)) throw e;
            console.error('[ERROR] --', e);
            return { success: false, message: 'An error occurred' };
        }
    }
};