import { randomBytes } from "crypto";

export function generateId(length: number): string {
    return randomBytes(length).toString("base64url");
} 