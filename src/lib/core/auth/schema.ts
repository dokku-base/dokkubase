import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    email: text("email").unique().notNull(),
    username: text("username"),
    password: text("password"), // null if OAuth only
    // TODO: Add OAuth fields
    // githubId: text("github_id").unique(),
    // googleId: text("google_id").unique(),
    createdAt: integer("created_at").notNull()
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: integer("expires_at").notNull()
    // TODO: Add 2FA status field when implementing
});

// TODO: Add tables for 2FA
// - totp_secrets
// - webauthn_credentials 