import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("workers", {
  id:       int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  password: text().notNull(),
  role:     text().notNull().default("user"),
  created_at: int({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
    id: text().primaryKey(),
    uid: text().notNull().references(() => usersTable.id, { onDelete: 'cascade' } ),
    expires_at: int({ mode: 'timestamp_ms' }).notNull(),
});
