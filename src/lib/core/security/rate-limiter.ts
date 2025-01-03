interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset: number;
    headers: Record<string, string>;
}

interface ClientState {
    requests: number[];
    lastReset: number;
    blocked: number;
}

interface RateLimitMetrics {
    allowed: number;
    blocked: number;
    avgQueueTime: number;
}

export class RateLimiter {
    private clients: Map<string, ClientState> = new Map();
    private readonly limit: number;
    private readonly windowMs: number;
    private readonly queueTimeout: number;

    constructor(limit: number, windowMs: number, queueTimeout: number = 1000) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.queueTimeout = queueTimeout;
    }

    async check(clientId: string): Promise<RateLimitResult> {
        const now = Date.now();
        let state = this.clients.get(clientId);

        // Initialize state if needed
        if (!state) {
            state = { requests: [], lastReset: now, blocked: 0 };
            this.clients.set(clientId, state);
        }

        // Clean up old requests
        this.cleanup(state, now);

        // Calculate remaining before adding new request
        const remaining = Math.max(0, this.limit - state.requests.length - 1); // -1 for current request
        const oldestRequest = state.requests[0] || now;
        const reset = Math.ceil((oldestRequest + this.windowMs - now) / 1000);

        // Check if we're over limit
        if (state.requests.length >= this.limit) {
            state.blocked++;
            return {
                allowed: false,
                remaining: 0,
                reset,
                headers: {
                    'X-RATELIMIT-LIMIT': String(this.limit),
                    'X-RATELIMIT-REMAINING': '0',
                    'X-RATELIMIT-RESET': String(reset),
                    'RETRY-AFTER': String(reset)
                }
            };
        }

        // Add new request
        state.requests.push(now);

        return {
            allowed: true,
            remaining,
            reset,
            headers: {
                'X-RATELIMIT-LIMIT': String(this.limit),
                'X-RATELIMIT-REMAINING': String(remaining),
                'X-RATELIMIT-RESET': String(reset)
            }
        };
    }

    private cleanup(state: ClientState, now: number) {
        const windowStart = now - this.windowMs;
        state.requests = state.requests.filter(time => time > windowStart);
    }

    clear() {
        this.clients.clear();
    }

    getMetrics(): RateLimitMetrics {
        let allowed = 0;
        let blocked = 0;

        this.clients.forEach(state => {
            allowed += state.requests.length;
            blocked += state.blocked;
        });

        return {
            allowed,
            blocked,
            avgQueueTime: 0 // We don't implement queueing yet
        };
    }
}
