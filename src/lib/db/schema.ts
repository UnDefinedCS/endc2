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


export const devices = sqliteTable("devices", {
    id:       int().primaryKey({ autoIncrement: true }),
    sid:      text().notNull().unique(),
    username: text().notNull(),
    hostname: text().notNull(),
    model:    text().notNull(),
    machine_id: text().notNull(),
    pwned_at: int({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});