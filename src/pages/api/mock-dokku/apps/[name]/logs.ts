import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../../lib/mock-dokku';

const mockAPI = new MockDokkuAPI();

export const GET: APIRoute = async ({ params }) => {
    try {
        const { name } = params;
        if (!name) {
            return new Response(JSON.stringify({ error: 'App name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apps = await mockAPI.apps();
        const logs = await apps.logs(name);
        
        return new Response(JSON.stringify(logs), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return new Response(JSON.stringify({ error: 'App not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.error('Error fetching app logs:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
