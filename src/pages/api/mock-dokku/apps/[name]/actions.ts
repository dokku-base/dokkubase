import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../../lib/mock-dokku';

console.log('Loading actions.ts file...');
const mockAPI = new MockDokkuAPI();
console.log('mockAPI created');

export const POST: APIRoute = async ({ params, request }) => {
    console.log('POST /api/mock-dokku/apps/[name]/actions - Start');
    
    // Add content type header consistently
    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const { name } = params;
        console.log('App name:', name);
        
        if (!name) {
            console.log('Error: App name is required');
            return new Response(JSON.stringify({ 
                error: 'App name is required' 
            }), {
                status: 400,
                headers
            });
        }

        // Parse request body with error handling
        let body;
        try {
            body = await request.json();
            console.log('Request body parsed:', body);
        } catch (e) {
            console.log('Error parsing request body:', e);
            return new Response(JSON.stringify({ 
                error: 'Invalid JSON body' 
            }), {
                status: 400,
                headers
            });
        }

        const { action } = body;
        console.log('Action:', action, 'for app:', name);

        if (!action || !['start', 'stop', 'restart'].includes(action)) {
            console.log('Error: Invalid action');
            return new Response(JSON.stringify({ 
                error: 'Invalid action. Must be one of: start, stop, restart' 
            }), {
                status: 400,
                headers
            });
        }

        console.log('Getting apps from mockAPI...');
        const apps = await mockAPI.apps();
        console.log('Got apps from mockAPI');
        
        let updatedApp;
        console.log(`Executing ${action} on app ${name}...`);

        try {
            switch (action) {
                case 'start':
                    updatedApp = await apps.start(name);
                    break;
                case 'stop':
                    updatedApp = await apps.stop(name);
                    break;
                case 'restart':
                    updatedApp = await apps.restart(name);
                    break;
            }

            if (!updatedApp) {
                console.error(`Action ${action} completed but no app data returned`);
                throw new Error('Operation failed - no response from action');
            }

            console.log('Action completed successfully:', updatedApp);
            return new Response(JSON.stringify(updatedApp), { 
                status: 200,
                headers 
            });

        } catch (actionError) {
            console.error(`Error executing ${action} on app ${name}:`, actionError);
            throw actionError; // Re-throw to be caught by outer catch block
        }

    } catch (error) {
        console.error('Error in actions endpoint:', error);

        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                return new Response(JSON.stringify({ 
                    error: 'App not found',
                    details: error.message
                }), {
                    status: 404,
                    headers
                });
            }
            
            if (error.message.includes('already')) {
                return new Response(JSON.stringify({ 
                    error: error.message 
                }), {
                    status: 400,
                    headers
                });
            }

            if (error.message.includes('Operation failed')) {
                return new Response(JSON.stringify({ 
                    error: 'Internal server error',
                    details: 'Action completed but failed to return updated app data'
                }), {
                    status: 500,
                    headers
                });
            }
        }

        // Generic error response
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers
        });
    }
}; 