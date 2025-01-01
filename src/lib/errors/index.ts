export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, "VALIDATION_ERROR", 400);
    }
}

export class AuthError extends AppError {
    constructor(message: string) {
        super(message, "AUTH_ERROR", 401);
    }
} 