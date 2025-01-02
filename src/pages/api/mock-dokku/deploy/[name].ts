import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../lib/mock-dokku';

const mockAPI = new MockDokkuAPI();

export const POST: APIRoute = async ({ params, request }) => {
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

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ 
                error: 'Invalid JSON body' 
            }), {
                status: 400,
                headers
            });
        }

        const { gitUrl } = body;
        if (!gitUrl) {
            return new Response(JSON.stringify({ 
                error: 'gitUrl is required in request body' 
            }), {
                status: 400,
                headers
            });
        }

        // Start deployment
        const deployment = await mockAPI.deploy(name, gitUrl);

        return new Response(JSON.stringify(deployment), {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error in deploy endpoint:', error);

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
            
            if (error.message.includes('Invalid git URL')) {
                return new Response(JSON.stringify({ 
                    error: error.message 
                }), {
                    status: 400,
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
