import { generateId } from "./token";
import type { Session, User } from "./types";
import { db } from "../db";
import { sessions, users } from "./schema";
import { eq } from "drizzle-orm";

export class Auth {
    async createSession(userId: string): Promise<Session> {
        const sessionId = generateId(40); // long random token
        const session = {
            id: sessionId,
            userId,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        await db.insert(sessions).values(session);
        return session;
    }

    async getSession(sessionId: string): Promise<Session | null> {
        const [session] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.id, sessionId));
            
        return session || null;
    }
}

// Export singleton instance
export const auth = new Auth(); 