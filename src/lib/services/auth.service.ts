import { LoginDto, RegisterDto, loginSchema, registerSchema } from "../validation/auth";
import { AppError, ValidationError, AuthError } from "../errors";
import { db } from "../db";
import { users } from "../auth/schema";
import { hashPassword, verifyPassword } from "../auth/password";
import { generateId } from "../auth/token";
import { eq } from "drizzle-orm";

export class AuthService {
    async login({ email, password }: LoginDto) {
        // Validate input
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            throw new ValidationError(result.error.message);
        }

        // Get user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (!user?.password) {
            throw new AuthError("Invalid credentials");
        }

        // Verify password
        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            throw new AuthError("Invalid credentials");
        }

        return user;
    }

    // ... podobnie dla register
}

// Singleton instance
export const authService = new AuthService(); 