/**
 * Mock Dokku API Implementation
 * 
 * Implementuje pełne API Dokku z:
 * - Zarządzaniem aplikacjami (CRUD)
 * - Deploymentem (git push)
 * - Logami i metrykami
 * - Real-time eventami przez SSE
 * 
 * @module mock-dokku
 */

import { mockApps } from '../../mocks/data/apps';
import { mockLogs } from '../../mocks/data/logs';
import type { DokkuAPI, DokkuApp, DokkuLog, CreateAppParams, UpdateAppParams, ValidationError, DeploymentStatus } from './types';
import { eventEmitter } from './events';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data
let apps = [...mockApps];
let logs: DokkuLog[] = [...mockLogs];
let deployments = new Map<string, DeploymentStatus>();

// Validation functions
const validateAppName = (name: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!name.match(/^[a-z0-9-]+$/)) {
        errors.push({
            field: 'name',
            message: 'Name must contain only lowercase letters, numbers, and hyphens'
        });
    }
    if (name.length < 2 || name.length > 32) {
        errors.push({
            field: 'name',
            message: 'Name must be between 2 and 32 characters'
        });
    }
    return errors;
};

const validateGitUrl = (url?: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (url && !url.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
        errors.push({
            field: 'gitUrl',
            message: 'Invalid git URL format'
        });
    }
    return errors;
};

const validateEnv = (env?: Record<string, string>): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (env) {
        Object.entries(env).forEach(([key, value]) => {
            if (!key.match(/^[A-Z][A-Z0-9_]*$/)) {
                errors.push({
                    field: `env.${key}`,
                    message: 'Environment variable names must be uppercase with underscores'
                });
            }
            if (value.includes('\n')) {
                errors.push({
                    field: `env.${key}`,
                    message: 'Environment variable values cannot contain newlines'
                });
            }
        });
    }
    return errors;
};

// Helper to add logs with SSE
const addLog = (appName: string, type: DokkuLog['type'], level: DokkuLog['level'], message: string, source?: string) => {
    const log: DokkuLog = {
        timestamp: Date.now(),
        type,
        level,
        message,
        source,
        appName
    };
    
    logs = [log, ...logs].slice(0, 1000); // Keep last 1000 logs
    
    try {
        eventEmitter.emitLog({
            type: 'log',
            appName,
            data: log
        });
    } catch (error) {
        console.error('Failed to emit log event:', error);
    }

    return log;
};

// Simulate metrics update with SSE
const updateMetrics = (app: DokkuApp): DokkuApp => {
    if (app.status !== 'running') {
        const updatedApp = {
            ...app,
            metrics: app.metrics ? {
                ...app.metrics,
                cpu: 0,
                memory: 0,
                lastUpdated: Date.now()
            } : undefined
        };

        try {
            if (updatedApp.metrics) {
                eventEmitter.emitMetrics({
                    type: 'metrics',
                    appName: app.name,
                    data: updatedApp.metrics
                });
            }
        } catch (error) {
            console.error('Failed to emit metrics event:', error);
        }

        return updatedApp;
    }

    const now = Date.now();
    const metrics = app.metrics || { 
        cpu: Math.random() * 20,
        memory: Math.random() * 200,
        storage: 0,
        lastUpdated: now,
        network: {
            rx_bytes: 0,
            tx_bytes: 0,
            rx_packets: 0,
            tx_packets: 0,
            rx_errors: 0,
            tx_errors: 0
        },
        disk: {
            reads: 0,
            writes: 0,
            read_bytes: 0,
            write_bytes: 0
        }
    };
    
    if (now - (metrics.lastUpdated || 0) > 5000) {
        // Update CPU, memory, storage as before...

        // Update network metrics
        if (metrics.network) {
            metrics.network.rx_bytes += Math.random() * 1000;
            metrics.network.tx_bytes += Math.random() * 500;
            metrics.network.rx_packets += Math.random() * 10;
            metrics.network.tx_packets += Math.random() * 5;
        }

        // Update disk metrics
        if (metrics.disk) {
            metrics.disk.reads += Math.random() * 5;
            metrics.disk.writes += Math.random() * 3;
            metrics.disk.read_bytes += Math.random() * 500;
            metrics.disk.write_bytes += Math.random() * 300;
        }

        metrics.lastUpdated = now;

        // Broadcast metrics update
        try {
            eventEmitter.emitMetrics({
                type: 'metrics',
                appName: app.name,
                data: metrics
            });
        } catch (error) {
            console.error('Failed to emit metrics event:', error);
        }
    }

    return { ...app, metrics };
};

// Update status with SSE
const updateStatus = (app: DokkuApp, status: DokkuApp['status'], statusDetails?: string): DokkuApp => {
    const updatedApp = {
        ...app,
        status,
        statusDetails,
        updatedAt: Date.now()
    };

    try {
        eventEmitter.emitStatus({
            type: 'status',
            appName: app.name,
            data: {
                status: updatedApp.status,
                statusDetails: updatedApp.statusDetails,
                updatedAt: updatedApp.updatedAt
            }
        });
    } catch (error) {
        console.error('Failed to emit status event:', error);
    }

    return updatedApp;
};

export class MockDokkuAPI implements DokkuAPI {
    async logs(name: string): Promise<DokkuLog[]> {
        await delay(500); // Simulate network delay
        
        // Check if app exists
        const app = apps.find(a => a.name === name);
        if (!app) {
            throw new Error(`App ${name} not found`);
        }

        // Generate sample logs
        const now = Date.now();
        return [
            {
                timestamp: now - 5000,
                type: 'system',
                level: 'info',
                message: 'Container started successfully',
                appName: name
            },
            {
                timestamp: now - 4000,
                type: 'app',
                level: 'info',
                message: 'Server listening on port 5000',
                source: 'app[web.1]',
                appName: name
            },
            {
                timestamp: now - 3000,
                type: 'app',
                level: 'debug',
                message: 'Connected to database',
                source: 'app[web.1]',
                appName: name
            },
            {
                timestamp: now - 2000,
                type: 'app',
                level: 'warn',
                message: 'High memory usage detected',
                source: 'app[web.1]',
                appName: name
            }
        ];
    }

    async deploymentStatus(name: string): Promise<DeploymentStatus | null> {
        await delay(200);
        
        // Check if app exists
        const app = apps.find(a => a.name === name);
        if (!app) {
            throw new Error(`App ${name} not found`);
        }

        // Find latest deployment for this app
        const appDeployments = Array.from(deployments.values())
            .filter(d => d.appName === name)
            .sort((a, b) => b.startedAt - a.startedAt);

        return appDeployments[0] || null;
    }

    async deploy(name: string, gitUrl: string): Promise<DeploymentStatus> {
        // Check if app exists
        const app = apps.find(a => a.name === name);
        if (!app) {
            throw new Error(`App ${name} not found`);
        }

        // Validate URL
        const urlErrors = validateGitUrl(gitUrl);
        if (urlErrors.length > 0) {
            throw new Error('Invalid git URL: ' + urlErrors[0].message);
        }

        // Generate unique ID for deployment
        const deploymentId = Math.random().toString(36).substring(7);

        // Simulate deployment process
        const deployment: DeploymentStatus = {
            id: deploymentId,
            appName: name,
            gitUrl,
            status: 'pending',
            startedAt: Date.now()
        };

        // Save deployment in memory
        deployments.set(deploymentId, deployment);

        // Simulate background process
        (async () => {
            try {
                // 1. Building
                await delay(2000);
                deployment.status = 'building';
                addLog(name, 'deploy', 'info', 'Building application...');

                // 2. Deploying
                await delay(3000);
                deployment.status = 'deploying';
                addLog(name, 'deploy', 'info', 'Deploying application...');

                // 3. Complete
                await delay(1000);
                deployment.status = 'completed';
                deployment.completedAt = Date.now();
                addLog(name, 'deploy', 'info', 'Deployment completed successfully');

                // Update app status
                const updatedApp = {
                    ...app,
                    status: 'running',
                    statusDetails: 'Deployment completed',
                    gitUrl,
                    updatedAt: Date.now()
                };
                apps = apps.map(a => a.name === name ? updatedApp : a);

            } catch (error) {
                deployment.status = 'failed';
                deployment.completedAt = Date.now();
                deployment.error = error instanceof Error ? error.message : 'Unknown error';
                addLog(name, 'deploy', 'error', `Deployment failed: ${deployment.error}`);
            }
        })();

        return deployment;
    }

    async apps() {
        return {
            async validateName(name: string): Promise<ValidationError[]> {
                await delay(100);
                return validateAppName(name);
            },

            async validateGitUrl(url: string): Promise<ValidationError[]> {
                await delay(100);
                return validateGitUrl(url);
            },

            async validateEnv(env: Record<string, string>): Promise<ValidationError[]> {
                await delay(100);
                return validateEnv(env);
            },

            async list(): Promise<DokkuApp[]> {
                await delay(500);
                return apps.map(updateMetrics);
            },

            async get(name: string): Promise<DokkuApp> {
                await delay(300);
                const app = apps.find(a => a.name === name);
                if (!app) {
                    throw new Error(`App ${name} not found`);
                }
                return updateMetrics(app);
            },

            async create(params: CreateAppParams): Promise<DokkuApp> {
                console.log('Creating app with params:', params);
                await delay(1000);
                
                // Validate all fields
                console.log('Validating fields...');
                const errors = [
                    ...validateAppName(params.name),
                    ...validateGitUrl(params.gitUrl),
                    ...validateEnv(params.env)
                ];
                console.log('Validation errors:', errors);

                if (errors.length > 0) {
                    console.log('Validation failed');
                    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
                }

                console.log('Checking if app exists...');
                if (apps.some(a => a.name === params.name)) {
                    console.log('App already exists');
                    throw new Error(`App ${params.name} already exists`);
                }

                console.log('Creating new app...');
                const newApp: DokkuApp = {
                    name: params.name,
                    status: 'stopped',
                    statusDetails: 'App created',
                    domains: [],
                    proxyPorts: [],
                    env: params.env || {},
                    processCount: 0,
                    gitUrl: params.gitUrl,
                    gitBranch: params.gitBranch || 'main',
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                apps = [...apps, newApp];
                addLog(params.name, 'system', 'info', `App ${params.name} created`);
                return newApp;
            },

            async delete(name: string): Promise<void> {
                await delay(800);
                const app = apps.find(a => a.name === name);
                if (!app) {
                    throw new Error(`App ${name} not found`);
                }

                if (app.status === 'running') {
                    throw new Error(`Cannot delete running app ${name}. Stop it first.`);
                }

                apps = apps.filter(a => a.name !== name);
                addLog(name, 'system', 'info', `App ${name} deleted`);
            },

            async update(name: string, params: UpdateAppParams): Promise<DokkuApp> {
                await delay(500);
                const app = apps.find(a => a.name === name);
                if (!app) {
                    throw new Error(`App ${name} not found`);
                }

                // Validate env if provided
                if (params.env) {
                    const errors = validateEnv(params.env);
                    if (errors.length > 0) {
                        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
                    }
                }

                const updatedApp = {
                    ...app,
                    ...params,
                    updatedAt: Date.now()
                };

                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', `App ${name} updated`);
                return updatedApp;
            },

            async start(name: string): Promise<DokkuApp> {
                await delay(2000);
                const app = apps.find(a => a.name === name);
                if (!app) {
                    throw new Error(`App ${name} not found`);
                }

                if (app.status === 'running') {
                    throw new Error(`App ${name} is already running`);
                }

                // First set status to starting
                let updatedApp: DokkuApp = {
                    ...app,
                    status: 'starting',
                    statusDetails: 'Container is starting...',
                    updatedAt: Date.now()
                };
                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', 'Starting container...');

                // Simulate startup process
                await delay(2000);

                // Then set to running if everything went OK
                updatedApp = {
                    ...updatedApp,
                    status: 'running',
                    statusDetails: 'App is running',
                    processCount: 1,
                    metrics: {
                        cpu: 0,
                        memory: 0,
                        storage: app.metrics?.storage || 0,
                        lastUpdated: Date.now()
                    },
                    updatedAt: Date.now()
                };

                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'app', 'info', 'Container started successfully', 'app[web.1]');
                return updatedApp;
            },

            async stop(name: string): Promise<DokkuApp> {
                await delay(1000);
                const app = apps.find(a => a.name === name);
                if (!app) {
                    throw new Error(`App ${name} not found`);
                }

                if (app.status === 'stopped') {
                    throw new Error(`App ${name} is already stopped`);
                }

                // First set status to stopping
                let updatedApp: DokkuApp = {
                    ...app,
                    status: 'stopping',
                    statusDetails: 'Container is stopping...',
                    updatedAt: Date.now()
                };
                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', 'Stopping container...');

                // Simulate stop process
                await delay(1000);

                // Then set to stopped
                updatedApp = {
                    ...updatedApp,
                    status: 'stopped',
                    statusDetails: 'App is stopped',
                    processCount: 0,
                    metrics: {
                        cpu: 0,
                        memory: 0,
                        storage: app.metrics?.storage || 0,
                        lastUpdated: Date.now()
                    },
                    updatedAt: Date.now()
                };

                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', 'Container stopped successfully');
                return updatedApp;
            },

            async restart(name: string): Promise<DokkuApp> {
                await delay(3000);
                const app = apps.find(a => a.name === name);
                if (!app) {
                    throw new Error(`App ${name} not found`);
                }

                if (app.status === 'stopped') {
                    throw new Error(`Cannot restart stopped app ${name}`);
                }

                // First stop
                let updatedApp: DokkuApp = {
                    ...app,
                    status: 'stopping',
                    statusDetails: 'Restarting - stopping container...',
                    updatedAt: Date.now()
                };
                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', 'Restarting - stopping container...');

                await delay(1000);

                // Then start
                updatedApp = {
                    ...updatedApp,
                    status: 'starting',
                    statusDetails: 'Restarting - starting container...',
                    updatedAt: Date.now()
                };
                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', 'Restarting - starting container...');

                await delay(1000);

                // Finally set to running
                updatedApp = {
                    ...updatedApp,
                    status: 'running',
                    statusDetails: 'App restarted successfully',
                    processCount: 1,
                    metrics: {
                        cpu: 0,
                        memory: 0,
                        storage: app.metrics?.storage || 0,
                        lastUpdated: Date.now()
                    },
                    updatedAt: Date.now()
                };

                apps = apps.map(a => a.name === name ? updatedApp : a);
                addLog(name, 'system', 'info', 'Container restarted successfully');
                return updatedApp;
            }
        };
    }
}
