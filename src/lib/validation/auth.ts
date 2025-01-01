import { z } from "zod";

export const loginSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .min(1, "Email is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
});

export const registerSchema = loginSchema;

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>; 