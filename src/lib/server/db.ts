import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { usersTable } from '$lib/db/schema'; 
export const db = drizzle(process.env.DB_FILE_NAME!);

import { HashPassword } from '$lib/utils';

if (process.env.ADM_PASSWD) {
    // generate a default admin profile
    await db.insert(usersTable).values({
        username: "admin",
        password: await HashPassword(process.env.ADM_PASSWD),
        role: "admin",
    }).onConflictDoNothing().then(() => {
        console.log('[+] Default Admin created!');
    });
} else {
    console.error("[-] Missing value for ADM_PASSWD");
}

const users = await db.select({ username: usersTable.username }).from(usersTable);
console.log('[*] Getting all users from the database: ', users)