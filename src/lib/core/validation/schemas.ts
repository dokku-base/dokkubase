import { z } from 'zod';

const requiredString = (fieldName: string) => z.string({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a string`
});

export const tokenSchema = z.object({
    token: requiredString("Token")
        .min(1, "Token is required")
        .max(100, "Token is too long")
});

export const adminSchema = z.object({
    username: requiredString("Username")
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username is too long"),
    password: requiredString("Password")
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});
