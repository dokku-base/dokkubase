import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../../lib/mock-dokku';
import { eventEmitter } from '../../../../../lib/mock-dokku/events';
import type { LogEvent, LogLevel } from '../../../../../lib/mock-dokku/types';

const mockAPI = new MockDokkuAPI();

// Sample logs for testing different UI scenarios
const generateMockHistoricalLogs = (appName: string): LogEvent[] => [
    {
        type: 'log',
        appName,
        timestamp: Date.now() - 60000,
        level: 'info',
        message: '-----> Starting deploy...',
        source: 'builder'
    },
    {
        type: 'log',
        appName,
        timestamp: Date.now() - 50000,
        level: 'info',
        message: '-----> Node.js app detected',
        source: 'builder'
    },
    {
        type: 'log',
        appName,
        timestamp: Date.now() - 40000,
        level: 'info',
        message: '-----> Installing dependencies using npm',
        source: 'builder'
    },
    {
        type: 'log',
        appName,
        timestamp: Date.now() - 30000,
        level: 'warn',
        message: 'Warning: Package.json has no "engines" field',
        source: 'builder'
    },
    {
        type: 'log',
        appName,
        timestamp: Date.now() - 20000,
        level: 'error',
        message: 'Error: Failed to install dependencies',
        source: 'builder'
    },
    {
        type: 'log',
        appName,
        timestamp: Date.now() - 10000,
        level: 'debug',
        message: 'Debug: Retrying npm install with --no-optional',
        source: 'builder'
    }
];

export const GET: APIRoute = async ({ params, request }) => {
    try {
        const { name } = params;
        const url = new URL(request.url);
        const logLevel = url.searchParams.get('level') as LogLevel | null;

        if (!name) {
            return new Response(JSON.stringify({ 
                error: 'App name is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if app exists
        try {
            await mockAPI.get(name);
        } catch (error) {
            return new Response(JSON.stringify({ 
                error: 'App not found',
                details: 'Check if the app name is correct'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Setup SSE stream
        const stream = new ReadableStream({
            start(controller) {
                // Send sample historical logs
                const historicalLogs = generateMockHistoricalLogs(name)
                    .filter(log => !logLevel || log.level === logLevel);

                historicalLogs.forEach(log => {
                    const data = `data: ${JSON.stringify({ ...log, historical: true })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(data));
                });

                // Subscribe to new logs
                const unsubscribe = eventEmitter.subscribe('log', name, (event: LogEvent) => {
                    if (!logLevel || event.level === logLevel) {
                        const data = `data: ${JSON.stringify(event)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(data));
                    }
                });

                // Cleanup
                request.signal.addEventListener('abort', () => {
                    unsubscribe();
                    controller.close();
                });
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (error) {
        console.error('Error in mock logs endpoint:', error);
        return new Response(JSON.stringify({ 
            error: 'Server error',
            details: 'Please try again later'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
