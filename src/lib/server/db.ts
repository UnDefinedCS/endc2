import 'dotenv/config';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { usersTable } from '$lib/db/schema';
import { HashPassword } from '$lib/utils';

const sqlite = new Database(process.env.DB_FILE_NAME!);

export const db = drizzle(sqlite);

if (process.env.ADM_PASSWD) {
    await db
        .insert(usersTable)
        .values({
            username: 'admin',
            password: await HashPassword(process.env.ADM_PASSWD),
            role: 'admin',
        })
        .onConflictDoNothing();

    console.log('[+] Default Admin created!');
} else {
    console.error('[-] Missing value for ADM_PASSWD');
}

const users = await db
    .select({ username: usersTable.username })
    .from(usersTable);

console.log('[*] Getting all users from the database:', users);