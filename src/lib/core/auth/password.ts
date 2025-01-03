import { randomBytes, scryptSync } from "crypto";

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split(":");
    const calculatedHash = scryptSync(password, salt, 64).toString("hex");
    return storedHash === calculatedHash;
} 