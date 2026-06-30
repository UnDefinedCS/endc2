import { db } from '$lib/server/db';
import { sessions, usersTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load = async ({ cookies }) => {
    const sessionId = cookies.get('session');
    if (!sessionId) return;

    try {
        const session = await db
            .select()
            .from(sessions)
            .innerJoin(usersTable, eq(sessions.uid, usersTable.id))
            .where(eq(sessions.id, sessionId))
            .limit(1);
    
        if (!session.length) return;
        
        const user = {
            name: session[0].workers.username,
            role: session[0].workers.role,
        };
    
        console.log(`[USER] username: ${user.name} | role: ${user.role}`);
    
        return { user };
    } catch (e) {
        return { error: "Database Unreachable" };
    }
};