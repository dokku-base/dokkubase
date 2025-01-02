import type { APIRoute } from 'astro';
import { eventEmitter, type EventType } from '../../../../lib/mock-dokku/events';

export const GET: APIRoute = async ({ params, request }) => {
    const appName = params.name;
    if (!appName) {
        return new Response('App name is required', { status: 400 });
    }

    // Parse requested event types from query
    const url = new URL(request.url);
    const types = url.searchParams.get('types')?.split(',') as EventType[] || ['log', 'metrics', 'status', 'deployment'];

    // Create SSE stream
    const stream = new ReadableStream({
        start(controller) {
            let isActive = true;

            // Helper to send SSE message
            const send = (event: any) => {
                if (!isActive) return;
                
                try {
                    const data = `data: ${JSON.stringify(event)}\n\n`;
                    controller.enqueue(new TextEncoder().encode(data));
                } catch (error) {
                    console.log('Stream closed, cleaning up...');
                    isActive = false;
                    cleanup();
                }
            };

            // Send initial connection message
            send({ type: 'connected', appName, timestamp: Date.now() });

            // Setup heartbeat
            const heartbeat = setInterval(() => {
                if (!isActive) return;
                send({ type: 'heartbeat', timestamp: Date.now() });
            }, 30000); // Every 30 seconds

            // Subscribe to requested event types
            const unsubscribes = types.map(type => 
                eventEmitter.subscribe(type, appName, send)
            );

            // Cleanup function
            const cleanup = () => {
                isActive = false;
                clearInterval(heartbeat);
                unsubscribes.forEach(unsub => unsub());
            };

            // Cleanup on close
            request.signal.addEventListener('abort', cleanup);
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
