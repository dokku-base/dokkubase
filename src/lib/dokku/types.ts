export interface DokkuApp {
    name: string;
    status: 'running' | 'stopped' | 'crashed';
    // Domains
    domains: string[];
    proxyPorts: Array<{
        scheme: string;
        host: string;
        container: string;
    }>;
    
    // Config
    env: Record<string, string>;
    
    // Resources
    processCount: number;
    metrics?: {
        cpu: number;    // percentage
        memory: number; // MB
        storage: number; // MB
    };
    
    // Git
    gitUrl?: string;
    gitBranch?: string;
    
    // Timestamps
    createdAt: number;
    updatedAt: number;
}

export interface DokkuLog {
    timestamp: number;
    type: 'app' | 'system' | 'build';
    level: 'info' | 'error' | 'warn';
    message: string;
    source?: string;
}

// Mock API Endpoints
export interface DokkuAPI {
    apps: {
        list(): Promise<DokkuApp[]>;
        get(name: string): Promise<DokkuApp>;
        create(name: string): Promise<void>;
        destroy(name: string): Promise<void>;
        logs(name: string): Promise<DokkuLog[]>;
    };
    domains: {
        add(app: string, domain: string): Promise<void>;
        remove(app: string, domain: string): Promise<void>;
        list(app: string): Promise<string[]>;
    };
    config: {
        get(app: string): Promise<Record<string, string>>;
        set(app: string, key: string, value: string): Promise<void>;
        unset(app: string, key: string): Promise<void>;
    };
}