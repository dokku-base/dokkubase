import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../lib/mock-dokku';

const mockAPI = new MockDokkuAPI();

export const GET: APIRoute = async ({ params }) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const { name } = params;
        
        if (!name) {
            return new Response(JSON.stringify({ 
                error: 'App name is required' 
            }), {
                status: 400,
                headers
            });
        }

        // Get logs for the app
        const logs = await mockAPI.logs(name);

        return new Response(JSON.stringify(logs), {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error in logs endpoint:', error);

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
        }

        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers
        });
    }
};
