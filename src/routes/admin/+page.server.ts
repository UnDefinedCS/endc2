import { isRedirect, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { sessions, usersTable } from '$lib/db/schema';
import { HashPassword } from '$lib/utils.js';

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
        const user = await db.select({ role: usersTable.role }).from(usersTable)
                    .where(eq(usersTable.id, session[0].workers.id)).limit(1);
        if (!user || user[0].role !== "admin")
            throw redirect(301, "/login");
        const users = await db.select({
            id: usersTable.id,
            username: usersTable.username,
            role: usersTable.role,
            createdAt: usersTable.created_at
        }).from(usersTable);
        return { operators: users }
    } catch (e) {
        if (isRedirect(e)) throw e;
        return { error: "Database Unreachable" };
    }
};

export const actions = {
    create: async ({ request }) => {
        const form = await request.formData();
        const username = form.get('username') as string;
        const password = form.get('password') as string;
        const role = (form.get('role') as string) || 'user';

        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }

        try {
            const existing = await db.select().from(usersTable)
                .where(eq(usersTable.username, username)).get();
            if (existing) {
                return { success: false, message: 'Username already taken' };
            }

            const passwordHash = await HashPassword(password);
            await db.insert(usersTable).values({
                username,
                password: passwordHash,
                role,
                created_at: new Date()
            });

            return { success: true, message: 'User created' };
        } catch (e) {
            console.error('[ERROR] --', e);
            return { success: false, message: 'Failed to create user' };
        }
    },

    remove: async ({ request }) => {
        const form = await request.formData();
        const id = form.get('id') as string;

        if (!id) return { success: false, message: 'Missing user id' };

        try {
            const user = await db.select({ id: usersTable.id, username: usersTable.username })
                .from(usersTable)
                .where(eq(usersTable.id, id)).limit(1);
        
            // do not remove the super-admin
            if (!user || user[0].username === "admin") {
                console.warn("[*] Invalid User Removal by Administration")
                return { success: false, message: 'Invalid Removal' };
            }

            await db.delete(usersTable).where(eq(usersTable.id, Number(id)));
            return { success: true, message: 'User removed' };
        } catch (e) {
            console.error('[ERROR] --', e);
            return { success: false, message: 'Failed to remove user' };
        }
    }
};