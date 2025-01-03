export interface User {
    id: string;
    email: string;
    username?: string;
    password?: string; // hashed password, optional for OAuth
}

export interface Session {
    id: string;
    userId: string;
    expiresAt: number;
} 