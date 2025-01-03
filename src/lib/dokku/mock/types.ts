/**
 * Type definitions for Mock Dokku API
 * 
 * Contains all types used in the API:
 * - DokkuApp - main application type
 * - DokkuLog - system and application logs
 * - EventType - event types
 * - DokkuEvent - base event type
 * 
 * @module types
 */

export interface DokkuApp {
    name: string;
    status: 'running' | 'stopped' | 'crashed' | 'starting' | 'stopping' | 'deploying' | 'error';
    statusDetails?: string;
    domains: string[];
    proxyPorts: Array<{
        scheme: string;
        host: string;
        container: string;
    }>;
    env: Record<string, string>;
    processCount: number;
    metrics?: {
        cpu: number;
        memory: number;
        storage: number;
        lastUpdated: number;
        network?: {
            rx_bytes: number;  // Received bytes
            tx_bytes: number;  // Transmitted bytes
            rx_packets: number;
            tx_packets: number;
            rx_errors: number;
            tx_errors: number;
        };
        disk?: {
            reads: number;
            writes: number;
            read_bytes: number;
            write_bytes: number;
        };
    };
    gitUrl?: string;
    gitBranch?: string;
    createdAt: number;
    updatedAt: number;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogType = 'system' | 'app' | 'deploy' | 'build';

export interface DokkuLog {
    timestamp: number;
    type: LogType;
    level: LogLevel;
    message: string;
    source?: string;
    appName: string;
}

// Event system types
export type EventType = 'log' | 'metrics' | 'status' | 'deployment';

export interface DokkuStatus {
    status: DokkuApp['status'];
    statusDetails?: string;
    updatedAt: number;
}

export interface DokkuEvent<T = unknown> {
    type: EventType;
    appName: string;
    data: T;
    timestamp: number;
}

export type LogEvent = DokkuEvent<DokkuLog>;
export type MetricsEvent = DokkuEvent<DokkuApp['metrics']>;
export type StatusEvent = DokkuEvent<DokkuStatus>;
export type DeploymentEvent = DokkuEvent<DeploymentStatus>;

export interface CreateAppParams {
    name: string;
    gitUrl?: string;
    gitBranch?: string;
    env?: Record<string, string>;
}

export interface UpdateAppParams {
    env?: Record<string, string>;
    domains?: string[];
    proxyPorts?: Array<{
        scheme: string;
        host: string;
        container: string;
    }>;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface EnvVar {
    key: string;
    value: string;
    isSecret?: boolean;
}

export interface DeploymentStatus {
    id: string;
    appName: string;
    gitUrl: string;
    status: 'pending' | 'building' | 'deploying' | 'completed' | 'failed';
    startedAt: number;
    completedAt?: number;
    error?: string;
}

export interface DokkuAPI {
    // Apps
    list(): Promise<DokkuApp[]>;
    get(name: string): Promise<DokkuApp>;
    create(params: CreateAppParams): Promise<DokkuApp>;
    delete(name: string): Promise<void>;
    update(name: string, params: UpdateAppParams): Promise<DokkuApp>;
    
    // App control
    start(name: string): Promise<DokkuApp>;
    stop(name: string): Promise<DokkuApp>;
    restart(name: string): Promise<DokkuApp>;
    
    // Logs
    logs(name: string): Promise<DokkuLog[]>;
    
    // Deployment
    deploy(name: string, gitUrl: string): Promise<DeploymentStatus>;
    deploymentStatus(name: string): Promise<DeploymentStatus | null>;
    
    // Validation
    validateName(name: string): Promise<ValidationError[]>;
    validateGitUrl(url: string): Promise<ValidationError[]>;
    validateEnv(env: Record<string, string>): Promise<ValidationError[]>;
}